/**
 * simpleAjax
 *
 * @fileOverview
 *    Cross browser ajax object for creating ajax calls.
 *    Released under MIT license.
 * @version 2.0.0
 * @author Victor Villaverde Laan
 * @link http://www.freelancephp.net/simpleajax-small-ajax-javascript-object/
 * @link https://github.com/freelancephp/SimpleAjax
 */
!function (window) {

    'use strict';

    var document = window.document;
    var ajaxSettings = {
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
    };

    /**
     * Ajax call helper
     * @private
     * @param {String} url
     * @param {String} type
     * @param {Object} [data]
     * @param {Function} [success]
     * @returns {\XMLHttpRequest}
     */
    var call = function (url, type, data, success) {
        if (isFunction(data)) {
            success = data;
            data = null;
        }

        return simpleAjax({
            url: url,
            type: type,
            data: data,
            success: success
        });
    };

    /**
     * Parse JSON string
     * @private
     * @param {String} data
     * @return {Object} JSON object
     */
    var parseJSON = function (data) {
        if (typeof data !== 'string' || !data) {
            return null;
        }

        return eval('('+ trim(data) +')');
    };

    /**
     * Create options combined with default settings
     * @private
     * @param {Object} options
     * @returns {Object}
     */
    var createOptions = function (options) {
        var opts = {};
        var key;

        for (key in ajaxSettings) {
            if (typeof options[key] === 'undefined') {
                opts[key] =  ajaxSettings[key];
            } else {
                opts[key] =  options[key];
            }
        }

        return opts;
    };

    /**
     * Make querystring outof object or array of values
     * @private
     * @param {Object|Array} obj Keys/values
     * @return {String} The querystring
     */
    var param = function (obj) {
        var s = [];
        var key;

        for (key in obj) {
            s.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }

        return s.join('&');
    };

    /**
     * @private
     * @param {String} url
     * @param {Object} params
     * @returns {String}
     */
    var addToQueryString = function (url, params) {
        var str = param(params);
        var newUrl = url + (url.indexOf('?') > -1 ? '&' : '?') + str;
        return newUrl;
    };

    /**
     * Trim spaces
     * @private
     * @param {String} str
     * @return {String}
     */
    var trim = function (str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    /**
     * Check if argument is function
     * @private
     * @param {Mixed} obj
     * @return {Boolean}
     */
    var isFunction = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    };


   /**
     * @namespace simpleAjax
     *
     * @public
     * @param {Object} [options] Overwrite the default settings (see ajaxSettings)
     * @return {\XMLHttpRequest}
     */
    var simpleAjax = function (options) {
        var xhr = new XMLHttpRequest();
        var opts = createOptions(options);
        var url = opts.url;
        var sendData = opts.data;

        var readyStateChange = function () {
            var status = xhr.status;
            var data;

            if (xhr.readyState !== 4){
                return;
            }

            if (status >= 200 && status < 300 || status === 304) {
                // get data
                if (opts.dataType === 'xml') {
                    data = xhr.responseXML;
                } else {
                    data = xhr.responseText;

                    if (opts.dataType === 'json') {
                        data = parseJSON(data);
                    }
                }

                // on success
                if (isFunction(opts.success)) {
                    opts.success.call(opts, data, status, xhr);
                }
            } else {
                // on error
                if (isFunction(opts.error)) {
                    opts.error.call(opts, xhr, status);
                }
            }

            // on complete
            if (isFunction(opts.complete)) {
                opts.complete.call(opts, xhr, status);
            }
        };

        // prepare options
        if (!opts.cache) {
            url = addToQueryString(url, { noAjaxCache: (new Date()).getTime() });
        }

        if (sendData) {
            if (opts.type === 'GET') {
                url = addToQueryString(url, sendData);
                sendData = null;
            } else {
                sendData = param(sendData);
            }
        }

        // set request
        xhr.open(opts.type, url, opts.async);
        xhr.setRequestHeader('Content-type', opts.contentType);

        if (opts.dataType && opts.accepts[opts.dataType]) {
            xhr.setRequestHeader('Accept', opts.accepts[opts.dataType]);
        }

        if (opts.async) {
            xhr.onreadystatechange = readyStateChange;
            xhr.send(sendData);
        } else {
            xhr.send(sendData);
            readyStateChange();
        }

        return xhr;
    };


    /**
     * Ajax GET request
     * @public
     * @param {String} url
     * @param {String|Object} [data] Containing GET values
     * @param {Function} [success] Callback when request was succesfull
     * @return {\XMLHttpRequest}
     */
    simpleAjax.get = function (url, data, success) {
        return call(url, 'GET', data, success);
    };

    /**
     * Ajax POST request
     * @public
     * @param {String} url
     * @param {String|Object} [data] Containing POST values
     * @param {Function} [success] Callback when request was succesfull
     * @return {\XMLHttpRequest}
     */
    simpleAjax.post = function (url, data, success) {
        return call(url, 'POST', data, success);
    };

    /**
     * Set content loaded by an ajax call
     * @public
     * @param {DOMElement|String} el Can contain an element or the id of the element
     * @param {String} url The url of the ajax call (include GET vars in querystring)
     * @param {String} [data] The POST data, when set method will be set to POST
     * @param {Function} [complete] Callback when loading is completed
     * @return {\XMLHttpRequest}
     */
    simpleAjax.load = function (el, url, data, complete) {
        if (typeof el === 'string') {
            el = document.getElementById(el);
        }

        return simpleAjax({
            url: url,
            type: data ? 'POST' : 'GET',
            data: data || null,
            complete: complete || null,
            success: function (html) {
                try {
                    el.innerHTML = html;
                } catch (e) {
                    var ph = document.createElement('div');
                    var x, max;

                    ph.innerHTML = html;

                    // empty element content
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }

                    // set new html content
                    for (x = 0, max = ph.childNodes.length; x < max; x++) {
                        el.appendChild(ph.childNodes[x]);
                    }
                }
            }
        });
    };

    // make global
    window.simpleAjax = simpleAjax;

}(window);
