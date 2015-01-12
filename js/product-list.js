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
		this.element = $(element);
		this.element.tableDnD({
			onDragClass: 'active',
			dragHandle: 'img',
		});

		var self = this;

		$(document).on('focus.product-list.data-api', this.element.data('output'), function (e) {
			self.renderOutput();
			this.select();
		});
	};

	ProductList.prototype = {

		constructor: ProductList,

		getProductTemplate: function()
		{
			return $(this.element.data('productTemplate')).html();
		},

		getOutputTemplate: function()
		{
			return $(this.element.data('outputTemplate')).html();
		},

		getOutput: function()
		{
			return $(this.element.data('output'));
		},

		getTitle: function()
		{
			return $(this.element.data('title'));
		},

		getProducts: function()
		{
			return $.map(this.element.find('tr'), function(item) {
				return $(item).data('product');
			});
		},

		add: function (product) {
			var item = Mustache.render(this.getProductTemplate(), {
				data: JSON.stringify(product),
				product: product
			});

			$(item).appendTo(this.element.find('tbody'));

			this.updateSortable();
			this.renderOutput();
		},

		updateSortable: function()
		{
			this.element.tableDnDUpdate();
		},

		updateTitle: function (title)
		{
			this.getTitle().val(title);
		},

		clear: function()
		{
			this.element.find('tr').remove();
			this.updateSortable();
		},

		remove: function(item)
		{
			item.closest('tr').remove();
			this.updateSortable();
			this.renderOutput();
		},

		renderOutput: function() {
			var products = this.getProducts(),
				rows = [];

			// separate rows into chunks of 3 as rows for the template
			for (var i = 0; i < products.length; i+=3) {
				rows[Math.floor(i/3)] = {
					product1: products[i],
					product2: products[i+1],
					product3: products[i+2],
				}
			};

			this.getOutput()
				.toggleClass("hidden", ! rows.length)
				.val(
					Mustache.render(this.getOutputTemplate(), {
						title: this.getTitle().val(),
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
