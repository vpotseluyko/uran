import "../Vendor/DOM"

/**
 * @param {string} mnt
 * @param {Uran} uran
 * @constructor
 * @class
 */
export function Response(mnt, uran) {
    this.core = uran;
    this.bind = {};
    this.ensureBind();
    this.listeners = {};
    this.functions = {};
    this.mnt = mnt;
}

/**
 * @private - First Level Bind Values
 * @type {{}}
 */
Response.prototype.bind = {};

/**
 * @private - Second level proxy objects store
 * @type {{}}
 */
Response.prototype.locals2 = {};

/**
 * @private
 * @returns {*}
 */
Response.prototype.ensureBind = function () {
    this.locals = new Proxy(this.bind, {
        set: (target, name, value) => {
            if (typeof value === 'object') {
                for (let prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        document
                            .querySelectorAll(`[data-bind="${name}.${prop}"]`)
                            .fill(value[prop]);
                    }
                }
                target[name] = value;
                this.locals2[name] = {};
                this.locals2[name] = new Proxy(target[name], {
                    set(target, name2, value) {
                        document
                            .querySelectorAll(`[data-bind="${name}.${name2}"]`)
                            .fill(value);
                        target[name2] = value;
                        return true;
                    },
                    get(target, name2) {
                        target[name2] = document
                            .querySelector(`[data-bind="${name}.${name2}"]`)
                            .get();
                        return target[name2];
                    }
                });
            } else {
                document.querySelectorAll(`[data-bind="${name}"]`).fill(value);
            }
            target[name] = value;
            return true;
        },
        get: (target, name) => {
            if (typeof this.locals2[name] !== 'undefined') {
                return this.locals2[name];
            }
            target[name] = document.querySelector(`[data-bind="${name}"]`).get();
            return target[name];
        }
    })
};

/**
 * @private
 * @param obj
 */
Response.prototype.addRenderProperties = function (obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            this.locals[prop] = obj[prop];
        }
    }
};

/**
 * @public
 * @param {string} [slc=this.mnt]
 * @param {function} tmp
 * @param {object} [obj]
 */
Response.prototype.render = function (slc, tmp, obj = {}) {
    if (typeof arguments[0] === 'string') {
        //
    } else if (typeof arguments[0] === 'function') {
        slc = null;
        tmp = arguments[0];
        obj = arguments[1] || {};
    }
    this.addRenderProperties(obj);
    if (slc === null) {
        this.mnt.innerHTML = tmp(this.bind);
    } else {
        document.querySelector(slc).innerHTML = tmp(this.bind);
    }
    this.bindDOM();
};

/**
 * @public
 * @param {string} [slc=this.mnt]
 * @param {function} tmp
 * @param {object} obj
 */
Response.prototype.add = function (slc = this.mnt, tmp, obj) {
    if (typeof arguments[0] === 'string') {
        //
    } else if (typeof arguments[0] === 'function') {
        slc = null;
        tmp = arguments[0];
        obj = arguments[1] || {};
    }
    this.addRenderProperties(obj);
    if (slc === null) {
        this.mnt.insertAdjacentHTML('beforeend', tmp(this.bind));
    } else {
        document.querySelector(slc).insertAdjacentHTML('beforeend', tmp(this.bind));
    }
    this.bindDOM();
};

/**
 * @public
 * @param {string} [slc=this.mnt]
 * @param {function} tmp
 * @param {object} obj
 */
Response.prototype.addBefore = function (slc = this.mnt, tmp, obj) {
    if (typeof arguments[0] === 'string') {
        //
    } else if (typeof arguments[0] === 'function') {
        slc = '';
        tmp = arguments[0];
        obj = arguments[1] || {};
    }
    this.addRenderProperties(obj);
    if (slc === null) {
        this.mnt.insertAdjacentHTML('afterbegin', tmp(this.bind));
    } else {
        document.querySelector(slc).insertAdjacentHTML('afterbegin', tmp(this.bind));
    }
    this.bindDOM();
};

/**
 * @private
 */
Response.prototype.bindDOM = function () {
    const _this = this;
    document
        .querySelectorAll('[data-click]')
        .onclick(function () {
            _this.listeners[this.getAttribute('data-click')].bind(this)();
        });
    document
        .querySelectorAll('[data-href]')
        .onclick(function () {
            _this.core.reloadSoftly(this.getAttribute('data-href'))
        });
};
