import ParseUrl from "./Layer"

/**
 * @param {Uran} uran
 * @constructor
 * @class
 */
export function Request(uran) {
    /**
     * @type {Uran}
     * @public
     */
    this.core = uran;
    this.another('*');
}

/**
 * @param url
 * @returns {Request}
 * @public
 */
Request.prototype.another = function (url) {
    /**
     * @public
     * @type {string}
     */
    this.domain = location.host;
    /**
     * @private
     * @type {Array}
     */
    this.keys = [];
    /**
     * @public
     * @type {{}}
     */
    this.params = {};
    if (url === '*') {
        this.path = location.pathname;
        this.url = location.href;
    } else {
        this.regexp = ParseUrl(url, this.keys, {}).exec(location.pathname);
        this.path = this.regexp[0];
        for (let i = 1; i < this.regexp.length; i++) {
            this.params[this.keys[i - 1].name] = this.regexp[i];
        }
        /**
         * @public
         * @type {{}}
         */
        this.query = {};
        this.parseGet();
    }
    return this;
};

/**
 * @public
 */
Request.prototype.parseGet = function () {
    location.search.substr(1).split('&').forEach(item => {
        this.query[item.split('=')[0]] = item.split('=')[1]
    })
};

