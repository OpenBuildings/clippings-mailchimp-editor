// The general JS file of the popup

// Initialize typeahead and bloodhound (http://twitter.github.io/typeahead.js/examples/)
var products = new Bloodhound({
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	remote: 'https://clippings.dev/search/typeahead?q=%QUERY'
});

products.initialize();

$('[data-provide~="typeahead"]')
	.typeahead(null, {
		name: 'products',
		displayKey: 'name',
		hint: true,
		source: products.ttAdapter()
	})
	// When an item is selected, add it to the product list table
	// and clear the search field
	.on('typeahead:selected', function(e, product) {
		$(this).typeahead('val', '');
		$($(this).data('typeaheadList'))
			.product_list('add', product);
	});

// Use global ajax progress since bloodhound does not support it
$(document).ajaxSend(function(event, jqXHR, settings) {
	$('[data-typeahead-loading]').removeClass('hidden');
});

$(document).ajaxComplete(function(event, jqXHR, settings) {
	$('[data-typeahead-loading]').addClass('hidden');
});

// Extract information from the current page, containing CodeMirror
// It depends on a content script (js/script.js), using messaging
// https://developer.chrome.com/extensions/messaging
$('[data-provide~="load"]')
	.on('click', function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: "request-widget-html"}, function(response) {

				var dataDump = $('<div>'+response.html+'</div>').find('#data-dump');

				if (dataDump.length) {
					$('#product-list').product_list('updateTitle', dataDump.data('title'));
					$.each(dataDump.data('products'), function(i, item) {
						$('#product-list').product_list('add', item);
					});
				} else {
					$('[data-provide~="alerts"]').alerts('add', 'You need to open a products widget on the left to load it');
				}

			});
		});
	});


