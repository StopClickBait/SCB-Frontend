var params = window.location.search.toQueryParams();
if(!params.session) return;
var session = JSON.parse(params.session);
chrome.extension.sendRequest({message: 'setSession', session: session}, function() { window.close(); });