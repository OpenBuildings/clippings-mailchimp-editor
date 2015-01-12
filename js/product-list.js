!function ($) {

	"use strict"; // jshint ;_;

	/*
	 * Product list plugin
	 * Uses Table DnD plugin for sorting
	 *
	 * Options:
	 *   data-output: Selector for the input element, which will contain the rendered html
	 *   data-output-template: A selector for the mustache template, containing the template for rendered html
	 *   data-product-template: A selector for the mustache template, containing a row in the pageAction table
	 *   data-title: A selector for the input, containing the title
	 */
	var ProductList = function (element, options) {
		var self = this;
		this.element = $(element);
		this.productTemplate = $(this.element.data('productTemplate')).html();
		this.outputTemplate = $(this.element.data('outputTemplate')).html();
		this.output = $(this.element.data('output'));
		this.title = $(this.element.data('title'));

		this.output.on('focus.product-list.data-api', function (e) {
			self.renderOutput();
			this.select();
		});

		this.element.tableDnD({
			onDragClass: 'active',
			dragHandle: 'img',
		})
	};

	ProductList.prototype = {

		constructor: ProductList,

		add: function (product) {
			var item = Mustache.render(this.productTemplate, {
				data: JSON.stringify(product),
				product: product
			});

			$(item).appendTo(this.element.find('tbody'));

			this.updateSortable();
			this.renderOutput();
		},

		updateSortable: function()
		{
			var self = this;
			this.element.parent().tableDnDUpdate();
		},

		updateTitle: function (title)
		{
			this.title.val(title);
		},

		remove: function(item)
		{
			item.closest('tr').remove();
			this.updateSortable();
			this.renderOutput();
		},

		renderOutput: function() {
			var products = $.map(this.element.find('tr'), function(item) {
					return $(item).data('product');
				}),
				rows = [];

			// separate rows into chunks of 3 as rows for the template
			for (var i = 0; i < products.length; i+=3) {
				rows[i%3] = {
					product1: products[i],
					product2: products[i+1],
					product3: products[i+2],
				}
			};

			this.output
				.toggleClass("hidden", ! rows.length)
				.val(
					Mustache.render(this.outputTemplate, {
						title: this.title.val(),
						products: JSON.stringify(products),
						rows: rows
					})
				);
		},
	};

	// Public interface and no conflict code
	var old = $.fn.product_list;

	$.fn.product_list = function (option, param) {
		return this.each(function () {
			var $this = $(this),
					data = $this.data('product_list'),
					options = typeof option === 'object' && option;

			if (!data) {
				$this.data('product_list', (data = new ProductList(this, options)));
			}

			if (typeof option === 'string') {
				data[option](param);
			}
		});
	};

	$.fn.product_list.Constructor = ProductList;

	$.fn.product_list.noConflict = function () {
		$.fn.filters = old;
		return this;
	};

	// Events binding
	$(function () {
		$(document).on('click.product-list.data-api', '[data-product-list-remove]', function (e) {
			$(this)
				.closest('[data-provide~="product-list"]')
					.product_list('remove', $(this));
		});
	});

}(window.jQuery);
