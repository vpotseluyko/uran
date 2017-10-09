/**
 * @constructor
 * @class
 */
import {Uran} from "./Uran";

/**
 * @constructor
 */
export function Router() {
    this.stack = [];
}

/**
 * @type {Uran}
 */
Router.prototype = Uran;

/**
 * Returns router stack
 * @returns {Array}
 * @public
 */
Router.prototype.getStack = function () {
    return this.stack;
};

/**
 * @param path
 * @param fn
 * @public
 */
Router.prototype.use = function (path, fn) {
    if (typeof path === 'function') {
        fn = arguments[0];
        this.stack.push({path: '*', cb: fn})
    } else {
        this.stack.push({path, cb: fn})
    }
};

