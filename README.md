# no-mobile
Firefox addon to get rid of links to the mobile version of websites

I have often been annoyed by following links on e.g. reddit and ending up on a mobile site of wikipedia while on my desktop computer.
While there are some websites that will automatically decide, many do not and you manually have to tweak the url.

This addon is not really more that a glorified regex-url-redirecter, it scans url that are being requested, and if it finds something that looks like a mobile url, it tries to give the proper version and redirects.
If a url should be matched mistakenly, the addon can be disabled in the toolbar.

Future plans include more configurability and blacklisting of false positives.
