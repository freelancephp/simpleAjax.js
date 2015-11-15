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
!function (window, document) {

    'use strict';

    var defaultAjaxSettings = {
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
     * Create options combined with default settings
     * @param {Object} options
     * @returns {Object}
     */
    var createOptions = function (options) {
        var opts = {};
        var key;

        for (key in defaultAjaxSettings) {
            if (typeof options[key] === 'undefined') {
                opts[key] =  defaultAjaxSettings[key];
            } else {
                opts[key] =  options[key];
            }
        }

        return opts;
    };

    /**
     * Make querystring outof object or array of values
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
     * @param {String} str
     * @return {String}
     */
    var trim = function (str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    /**
     * Check if argument is function
     * @param {Mixed} obj
     * @return {Boolean}
     */
    var isFunction = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    };

    /**
     * Parse JSON string
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
     * @param {Object} [options] Overwrite the default settings (see defaultAjaxSettings)
     * @return {\XMLHttpRequest}
     */
    var ajax = function (options) {
        var xhr = new XMLHttpRequest();
        var opts = createOptions(options);
        var url = opts.url;
        var sendData = opts.data;

        var readyStateChange = function () {
            var status = xhr.status;
            var data;

            if (xhr.readyState !== 4) {
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
     * Ajax call helper
     * @param {String} url
     * @param {String} type
     * @param {Object} [data]
     * @param {Function} [success]
     * @returns {\XMLHttpRequest}
     */
    var ajaxCallHelper = function (url, type, data, success) {
        if (isFunction(data)) {
            success = data;
            data = null;
        }

        return ajax({
            url: url,
            type: type,
            data: data,
            success: success
        });
    };

    /**
     * Ajax GET request
     * @param {String} url
     * @param {String|Object} [data] Containing GET values
     * @param {Function} [success] Callback when request was succesfull
     * @return {\XMLHttpRequest}
     */
    var ajaxGet = function (url, data, success) {
        return ajaxCallHelper(url, 'GET', data, success);
    };

    /**
     * Ajax POST request
     * @param {String} url
     * @param {String|Object} [data] Containing POST values
     * @param {Function} [success] Callback when request was succesfull
     * @return {\XMLHttpRequest}
     */
    var ajaxPost = function (url, data, success) {
        return ajaxCallHelper(url, 'POST', data, success);
    };

    /**
     * Set content loaded by an ajax call
     * @param {DOMElement|String} element Can contain an element or the selector of the element
     * @param {String} url The url of the ajax call (include GET vars in querystring)
     * @param {String|Object} [data] The POST data, when set method will be set to POST
     * @param {Function} [complete] Callback when loading is completed
     * @return {\XMLHttpRequest}
     */
    var ajaxLoad = function (element, url, data, complete) {
        return simpleAjax({
            url: url,
            dataType: 'html',
            type: data ? 'POST' : 'GET',
            data: data || null,
            complete: complete || null,
            success: function (html) {
                setHtmlContent(element, html);
            }
        });
    };

    /**
     * Set HTML in given element
     * @param {DOMElement|String} element
     * @param {String} html
     * @return {DOMElement}
     */
    var setHtmlContent = function (element, html) {
        var el;

        if (typeof element === 'string') {
            el = document.querySelector(element);
        } else {
            el = element;
        }

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

        return el;
    };

    /**
     * simpleAjax
     * @public
     */
    var simpleAjax = ajax;
    simpleAjax.get = ajaxGet;
    simpleAjax.post = ajaxPost;
    simpleAjax.load = ajaxLoad;
    simpleAjax.parseJSON = parseJSON;
    simpleAjax.setHtmlContent = setHtmlContent;

    // make global
    window.simpleAjax = simpleAjax;

}(window, window.document);
