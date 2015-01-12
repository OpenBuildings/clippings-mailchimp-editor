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

		add: function(type, message)
		{
			var item = Mustache.render(this.template, {
				message: message,
				type: type || 'info'
			});
			$(item).prependTo(this.element);
		},
		warning: function (message) {
			this.add('warning', message);
		},
		danger: function (message) {
			this.add('danger', message);
		},
		info: function (message) {
			this.add('info', message);
		},
		success: function (message) {
			this.add('success', message);
		}
	};

	var old = $.fn.alerts;

	$.fn.alerts = function (option, param1, param2) {
		return this.each(function () {
			var $this = $(this),
					data = $this.data('alerts'),
					options = typeof option === 'object' && option;

			if (!data) {
				$this.data('alerts', (data = new Alerts(this, options)));
			}

			if (typeof option === 'string') {
				data[option](param1, param2);
			}
		});
	};

	$.fn.alerts.Constructor = Alerts;

	$.fn.alerts.noConflict = function () {
		$.fn.filters = old;
		return this;
	};

}(window.jQuery);
