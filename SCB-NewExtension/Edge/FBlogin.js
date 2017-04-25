var accessToken = window.location.hash;
accessToken = accessToken.substring(accessToken.indexOf('=') + 1, accessToken.indexOf('&'));

chrome.storage.local.set({ 'accessToken': accessToken }, () => { window.close() });