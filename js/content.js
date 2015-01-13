// Read the CodeMirror from the page and send it to the pageAction
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.action == "request-widget-html") {

			var content = '';

			[].forEach.call(document.querySelectorAll('.CodeMirror pre'), function(item) {
				content += item.textContent + "\n";
			});

			sendResponse({html: content});
		}
	});
