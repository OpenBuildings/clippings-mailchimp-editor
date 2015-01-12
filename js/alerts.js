!function ($) {

	"use strict"; // jshint ;_;

	// A plugin to show alerts
	var Alerts = function (element, options) {
		var self = this;
		this.element = $(element);
		this.template = $(this.element.data('alertsTemplate')).html();
	};

	Alerts.prototype = {

		constructor: Alerts,

		add: function (text) {
			var item = Mustache.render(this.template, {
				message: text
			});

			$(item).prependTo(this.element);
		},
	};

	var old = $.fn.alerts;

	$.fn.alerts = function (option, param) {
		return this.each(function () {
			var $this = $(this),
					data = $this.data('alerts'),
					options = typeof option === 'object' && option;

			if (!data) {
				$this.data('alerts', (data = new Alerts(this, options)));
			}

			if (typeof option === 'string') {
				data[option](param);
			}
		});
	};

	$.fn.alerts.Constructor = Alerts;

	$.fn.alerts.noConflict = function () {
		$.fn.filters = old;
		return this;
	};

}(window.jQuery);
