exports.main = function(options,callbacks) {
    var {Cc, Ci, Cr} = require("chrome");
    var buttons = require('sdk/ui/button/action');

    function matchUri(uri) {
        // for e.g. http://m.facebook.com or http://en.m.wikipedia.org
        var re1 = RegExp("(\\.|^|://)(m|mobile)\\.");
        if (re1.test(uri.spec)) {
            return [true, uri.spec.replace(re1, "$1")];
        }
        
        // for e.g. http://goole.com/m
        var re2 = RegExp("/(m|mobile)(/|$|\\?|#)");
        if (re2.test(uri.spec)) {
            return [true, uri.spec.replace(re2, "$2")];
        }
        
        // for reddit (e.g. http://reddit.com/r/all/.compact )
        var re3 = RegExp("/\\.compact($|#)");
        if (re3.test(uri.spec)) {
            return [true, uri.spec.replace(re3, "$1")];
        }
        
        return [false, ""];
    }

    // Create observer
    httpRequestObserver =
    {
        observe: function (subject, topic, data) {
            if (topic == "http-on-modify-request") {
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
                var uri = httpChannel.URI;
                var domainLoc = uri.host;
                
                var [match, newUri] = matchUri(uri)

                if (match) {
                    console.log("redirect hit: " + uri.spec + " to " + newUri);
                    httpChannel.redirectTo(this.uriService.newURI(newUri, null, null));
                }
            }
        },
        
        get uriService() {
            return Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService);
        },

        get observerService() {
            return Cc["@mozilla.org/observer-service;1"]
                    .getService(Ci.nsIObserverService);
        },

        active: false,

        register: function() {
            if (!this.active) {
                this.observerService.addObserver(this, "http-on-modify-request", false);
                this.active = true;
            }
        },

        unregister: function() {
            if (this.active) {
                this.observerService.removeObserver(this, "http-on-modify-request");
                this.active = false;
            }
        }
    };
    
    activeText = "NoMobileLinks: Active";
    inactiveText = "NoMobileLinks: Inactive";

    activeIcons = {
        "16": "./icon-16-active.png",
        "32": "./icon-32-active.png",
        "64": "./icon-64-active.png"
    };
    inactiveIcons = {
        "16": "./icon-16-inactive.png",
        "32": "./icon-32-inactive.png",
        "64": "./icon-64-inactive.png"
    };
    
    var button = buttons.ActionButton({
        id: "no-mobile-toggle",
        label: activeText,
        icon: activeIcons,
        onClick: toggleNoMobile
    }); 
        
    function toggleNoMobile(state) {
        if (httpRequestObserver.active) {
            httpRequestObserver.unregister();
            button.label = inactiveText;
            button.icon = inactiveIcons;
        }
        else {
            httpRequestObserver.register();
            button.label = activeText;
            button.icon = activeIcons;
        }
    }

    //register observer
    httpRequestObserver.register();

};

exports.onUnload = function(reason) {
    httpRequestObserver.unregister();
};