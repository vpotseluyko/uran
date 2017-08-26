/**
 * @param {string|JSON} resp
 * @constructor
 * @class
 */
function AjaxResponse(resp) {
    this.response = resp;
}

/**
 * @type {string|JSON}
 * @public
 */
AjaxResponse.prototype.response = '';

/**
 * Returns json parse result
 * @returns {Promise}
 * @public
 */
AjaxResponse.prototype.json = function () {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(this.response))
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Creates XHR instanse
 * @param {string} method
 * @param {string} url
 * @constructor
 * @class
 */
function XHR(method, url) {
    /**
     * @type {string}
     * @private
     */
    this.method = method;
    /**
     * @type {string}
     * @private
     */
    this.url = url;
    /**
     * @type {object}
     * @private
     */
    this.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
}

/**
 * @param {object} headers
 * @returns {XHR}
 * @public
 */
XHR.prototype.headers = function (headers) {
    this.headers = headers;
    return this;
};

/**
 * @param {object|string} data
 * @returns Promise
 * @public
 */
XHR.prototype.data = function (data) {
    this.params = data;
    return this.send();
};

/**
 * @returns {Promise}
 * @private
 */
XHR.prototype.send = function () {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(this.method, this.url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(new AjaxResponse(xhr.response));
            } else {
                let e = new Error(xhr.statusText);
                e.status = this.status;
                reject(e);
            }
        };
        xhr.onerror = () => {
            reject(new Error(xhr.statusText));
        };
        if (this.headers) {
            Object.keys(this.headers).forEach(key =>
                xhr.setRequestHeader(key, this.headers[key])
            );
        }
        let params = this.params;
        // We'll need to stringify if we've been given an object
        // If we have a string, this is skipped.
        if (params && typeof params === 'object') {
            params = Object.keys(params).map((key) =>
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
            ).join('&');
        }
        xhr.send(params);
    })

};

/**
 *
 * @type {{post: (function(*=)), get: (function(*=))}}
 */
export const Ajax = {
    /**
     *
     * @param address
     * @returns {XHR}
     * @static
     * @public
     */
    post(address) {
        return new XHR('post', address)
    },

    /**
     *
     * @param address
     * @returns {XHR}
     * @static
     * @public
     */
    get (address) {
        return new XHR('get', address)
    }

};