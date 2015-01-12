// This is used to enable the page action, only on mailchimp admin page
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (~tab.url.indexOf('https://us1.admin.mailchimp.com/')) {
    chrome.pageAction.show(tabId);
  }
});
