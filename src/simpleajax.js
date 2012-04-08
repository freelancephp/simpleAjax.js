/**
 * SimpleAjax
 *
 * @fileOverview
 *    Cross browser ajax object for creating ajax calls.
 *    Released under MIT license.
 * @version 1.0.0
 * @author Victor Villaverde Laan
 * @link http://www.freelancephp.net/simpleajax-small-ajax-javascript-object/
 * @link https://github.com/freelancephp/SimpleAjax
 */

/**
 * @namespace SimpleAjax
 */
var SimpleAjax = {

	/**
	 * @property {XMLHttpRequest|ActiveXObject}
	 */
	xhr: null,

	/**
	 * @property {Object} Default ajax settings
	 */
	settings: {
		url: '',
		type: 'GET',
		dataType: 'text', // text, html, json or xml
		async: true,
		cache: true,
		data: null,
		contentType: 'application/x-www-form-urlencoded',
		success: null,
		error: null,
		complete: null,
		accepts: {
			text: 'text/plain',
			html: 'text/html',
			xml: 'application/xml, text/xml',
			json: 'application/json, text/javascript'
		}
	},

	/**
	 * Ajax call
	 * @param {Object} [options] Overwrite the default settings (see ajaxSettings)
	 * @return {This}
	 */
	call: function (options) {
		var self = this,
			xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
			opts = (function (s, o) {
				var opts = {};

				for (var key in s)
					opts[key] = (typeof o[key] == 'undefined') ? s[key] : o[key];

				return opts;
			})(this.settings, options),
			ready = function () {
				if(xhr.readyState == 4){
					if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
						// set data
						var data = (opts.dataType == 'xml') ? xhr.responseXML : xhr.responseText;

						// parse json data
						if (opts.dataType == 'json')
							data = self.parseJSON(data);

						// success callback
						if (self.isFunction(opts.success))
							opts.success.call(opts, data, xhr.status, xhr);
					} else {
						// error callback
						if (self.isFunction(opts.error))
							opts.error.call(opts, xhr, xhr.status);
					}

					// complete callback
					if (self.isFunction(opts.complete))
						opts.complete.call(opts, xhr, xhr.status);
				}
			};

		this.xhr = xhr;

		// prepare options
		if (!opts.cache)
			opts.url += ((opts.url.indexOf('?') > -1) ? '&' : '?') + '_nocache='+ (new Date()).getTime();

		if (opts.data) {
			if (opts.type == 'GET') {
				opts.url += ((opts.url.indexOf('?') > -1) ? '&' : '?') + this.param(opts.data);
				opts.data = null;
			} else {
				opts.data = this.param(opts.data);
			}
		}

		// set request
		xhr.open(opts.type, opts.url, opts.async);
		xhr.setRequestHeader('Content-type', opts.contentType);

		if (opts.dataType && opts.accepts[opts.dataType])
			xhr.setRequestHeader('Accept', opts.accepts[opts.dataType]);

		if (opts.async) {
			xhr.onreadystatechange = ready;
			xhr.send(opts.data);
		} else {
			xhr.send(opts.data);
			ready();
		}

		return this;
	},

	/**
	 * Ajax GET request
	 * @param {String} url
	 * @param {String|Object} [data] Containing GET values
	 * @param {Function} [success] Callback when request was succesfull
	 * @return {This}
	 */
	get: function (url, data, success) {
		if (this.isFunction(data)) {
			success = data;
			data = null;
		}

		return this.call({
			url: url,
			type: 'GET',
			data: data,
			success: success
		});
	},

	/**
	 * Ajax POST request
	 * @param {String} url
	 * @param {String|Object} [data] Containing POST values
	 * @param {Function} [success] Callback when request was succesfull
	 * @return {This}
	 */
	post: function (url, data, success) {
		if (this.isFunction(data)) {
			success = data;
			data = null;
		}

		return this.call({
			url: url,
			type: 'POST',
			data: data,
			success: success
		});
	},

	/**
	 * Set content loaded by an ajax call
	 * @param {DOMElement|String} el Can contain an element or the id of the element
	 * @param {String} url The url of the ajax call (include GET vars in querystring)
	 * @param {String} [data] The POST data, when set method will be set to POST
	 * @param {Function} [complete] Callback when loading is completed
	 * @return {This}
	 */
	load: function (el, url, data, complete) {
		if (typeof el == 'string')
			el = document.getElementById(el);

		return this.call({
			url: url,
			type: data ? 'POST' : 'GET',
			data: data || null,
			complete: complete || null,
			success: function (html) {
				try {
					el.innerHTML = html;
				} catch (e) {
					var ph = document.createElement('div');
					ph.innerHTML = html;

					// empty element content
					while (el.firstChild)
						el.removeChild(el.firstChild);

					// set new html content
					for(var x = 0, max = ph.childNodes.length; x < max; x++)
						el.appendChild(ph.childNodes[x]);
				}
			}
		});
	},

	/**
	 * Make querystring outof object or array of values
	 * @param {Object|Array} obj Keys/values
	 * @return {String} The querystring
	 */
	param: function (obj) {
		var s = [];

		for (var key in obj) {
			s.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
		}

		return s.join('&');
	},

	/**
	 * Parse JSON string
	 * @param {String} data
	 * @return {Object} JSON object
	 */
	parseJSON: function (data) {
		if (typeof data !== 'string' || !data)
			return null;

		return eval('('+ this.trim(data) +')');
	},

	/**
	 * Trim spaces
	 * @param {String} str
	 * @return {String}
	 */
	trim: function (str) {
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	},

	/**
	 * Check if argument is function
	 * @param {Mixed} obj
	 * @return {Boolean}
	 */
	isFunction: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	}

};

if (!window.Ajax) {
	/**
	 * Alias for SimpleAjax
	 * @namespace Ajax
	 */
	window.Ajax = SimpleAjax;
}
