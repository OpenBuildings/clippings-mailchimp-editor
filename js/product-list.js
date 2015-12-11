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

		getDate: function()
		{
			return $(this.element.data('date'));
		},

		getTitleUrl: function()
		{
			return $(this.element.data('title-url'));
		},

		getProducts: function()
		{
			return $.map(this.element.find('tr'), function(item) {
				return $(item).data('product')
			});
		},

		getProductsData: function()
		{
			var date = this.getDate().val()

			if (date) {
				return $.map(this.getProducts(), function (product) {
					product.url = product.url.replace('%2A%7CDATE%3A%7C%2A', encodeURIComponent(date))
					product.brand_url = product.brand_url.replace('%2A%7CDATE%3A%7C%2A', encodeURIComponent(date))

					return product
				})
			} else {
				return this.getProducts()
			}
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

		load: function (params)
		{
			var self = this;

			this.clear();

			if (params.title) {
				this.getTitle().val(params.title.text);
				this.getTitleUrl().val(params.title.url);
			};

			if (params.date) {
				this.getDate().val(params.date);
			};

			$.each(params.products, function(i, item) {
				self.add(item);
			});
		},

		clear: function()
		{
			this.element.find('tr').remove();
			this.updateSortable();
			this.getTitle().val('');
			this.getTitleUrl().val('');
			this.save();
		},

		remove: function(item)
		{
			item.closest('tr').remove();
			this.updateSortable();
			this.renderOutput();
		},

		save: function()
		{
			var products = this.getProducts(),
				title = {
					text: this.getTitle().val(),
					url: this.getTitleUrl().val()
				};

			localStorage.params = JSON.stringify({products: products, title: title});
		},

		renderOutput: function() {
			var products = this.getProductsData(),
				rows = [],
				date = this.getDate().val(),
				title = {
					text: this.getTitle().val(),
					url: this.getTitleUrl().val()
				};

			localStorage.params = JSON.stringify({products: this.getProducts(), title: title, date: date});

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
						params: JSON.stringify({
							products: products,
							title: title,
						}),
						title: title,
						date: date,
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
