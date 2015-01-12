// The general JS file of the popup

// Initialize typeahead and bloodhound (http://twitter.github.io/typeahead.js/examples/)
var products = new Bloodhound({
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	remote: {
		url: 'https://clippings.com/search/typeahead?q=%QUERY',
		ajax: {
	        beforeSend: function() {
	        	$('[data-provide~="typeahead"]').closest('.form-group').removeClass('has-error');
	        	$('[data-typeahead-loading]').removeClass('hidden');
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
		        $('[data-provide~="typeahead"]').closest('.form-group').addClass('has-error');
		        $('[data-provide~="alerts"]').alerts('danger', errorThrown);
	        },
	        complete: function() {
	            $('[data-typeahead-loading]').addClass('hidden');
	        }
	    }
	}
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

// Extract information from the current page, containing CodeMirror
// It depends on a content script (js/script.js), using messaging
// https://developer.chrome.com/extensions/messaging
$('[data-provide~="load"]')
	.on('click', function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: "request-widget-html"}, function(response) {

				var dataDump = $('<div>'+response.html+'</div>').find('#data-dump');

				if (dataDump.length) {
					$('#product-list').product_list('clear');
					$('#product-list').product_list('updateTitle', dataDump.data('title'));
					$.each(dataDump.data('products'), function(i, item) {
						$('#product-list').product_list('add', item);
					});
				} else {
					$('[data-provide~="alerts"]').alerts('warning', 'You need to open a products widget on the left to load it');
				}

			});
		});
	});


