import RegexpUri from "./Layer";
import {Response} from "./Response"
import {Request} from "./Request"
import {Router} from "./Router"
import {Ajax} from "./Ajax"

/**
 *
 * @param {string} root - Root selector for mount
 * @constructor
 * @class
 * @classdesc Main routing class. Provides `use` and `run` methods for Uran app and couple of static.
 */
export function Uran(root) {
    this.mount(root);
    this.root.innerHTML = '';
    /**
     * @type {Response}
     * @private
     */
    this.Response = new Response(this.root, this);
    /**
     * @type {Request}
     * @private
     */
    this.Request = new Request(this);
}

// static methods

/**
 * creates instance of Uran Router.
 * @constructor
 * @static
 */
Uran.Router = () => new Router();

/**
 * Creates ajax post manager
 * @param {string} url
 * @constructor
 * @static
 */
Uran.Post = (url) => Ajax.post(url);

/**
 * Creates ajax get manager
 * @param {string} url
 * @constructor
 * @static
 */
Uran.Get = (url) => Ajax.get(url);

/**
 * Sets root mountpoint
 * @param {string} domSelector
 * @private
 */
Uran.prototype.mount = function (domSelector) {
    /**
     * @type {Element}
     * @private
     */
    this.root = document.querySelector(domSelector);

    if (this.root === null) {
        throw new Error('Invalid mountpoint')
    }
};

/**
 * @type {Element} - root el app is mounted to
 * @private
 */
Uran.prototype.root = null;

/**
 * @type {Array}
 * @private
 */
Uran.prototype.stack = [];

/**
 * @type {Array} - stack of active launch for Uran
 * @private
 */
Uran.prototype.activeStack = [];

/**
 * @type {number} - executing stack step
 * @private
 */
Uran.prototype.running = 0;

/**
 * @type {string}
 * @private
 */
Uran.prototype.path = location.pathname;

/**
 * @type {function}
 * @private
 */

/**
 * Default error function
 * @param {Error} err
 * @param {Request} req
 * @param {Response] res
 * @param {function} next
 * @private
 */
Uran.prototype.error = (err, req, res, next) => {throw err};

/**
 * Merges received Router stack instance to main stack
 * @param {Router} Router
 * @param path
 * @private
 */
Uran.prototype.spreadRouter = function (Router, path) {
    const routersStack = Router.getStack();
    for (let i = 0; i < routersStack.length; i++) {
        if (routersStack[i].path === '*') {
            routersStack[i].path = '/*'
        }
        routersStack[i].link = path + routersStack[i].path;
        routersStack[i].path = RegexpUri(path + routersStack[i].path);
    }
    this.stack.push(...routersStack);
};

/**
 *
 * @param {string} [path='*']
 * @param {(Router|function)} fn
 * @public
 */
Uran.prototype.use = function (path, fn) {
    if (arguments.length === 1) {
        fn = arguments[0];
        if (typeof fn === 'object') {
            this.spreadRouter(fn, '');
        } else {
            if (fn.length === 4) {
                /**
                 * @private
                 */
                this.error = fn;
            } else {
                this.stack.push({path: '*', cb: fn, link: '*'});
            }
        }
    } else if (arguments.length === 2) {
        if (typeof fn === 'object') {
            this.spreadRouter(fn, path)
        } else {
            this.stack.push({path: RegexpUri(path), link: path, cb: fn})
        }
    }
};
/**
 * @deprecated
 * @param fn
 */
Uran.prototype.always = function (fn) {
    if (typeof fn === 'object') {
        this.spreadRouter(fn, '!');
    } else {
        if (fn.length === 4) {
            /**
             * @private
             */
            this.error = fn;
        } else {
            this.stack.push({path: '*', cb: fn, link: '!'});
        }
    }
};

/**
 * Implements LazyReload
 * @param {string} url
 * @public
 */
Uran.prototype.reloadSoftly = function (url) {
    const oldPath = this.path;
    window.history.pushState(null, null, url);
    this.path = url;
    const newPath = url;
    if (oldPath === newPath) {
        // TODO: if allowed rerun prev activeStack. IF no, return
        return;
    }
    document.dispatchEvent(new Event('uran:startRender'));

    /**
     * @type {Array}
     * @private
     */
    this.activeStack = [];
    for (let i = 0; i < this.stack.length; i++) {
        const fnc = this.stack[i];
        if (fnc.path !== '*' &&
            (!fnc.path.test(oldPath) && fnc.path.test(newPath))) {
            this.activeStack.push(this.stack[i])
        }
    }
    /**
     * @type {number}
     * @private
     */
    this.running = 0;
    this.run();
};

/**
 * Fully reloads page
 * @param {string} url
 * @public
 */
Uran.prototype.reload = function (url) {
    let newRoot = this.root.cloneNode(false);
    newRoot.style.opacity = 0;
    newRoot.style.transitionDuration = ".5s";
    newRoot = this.root.parentNode.appendChild(newRoot);
    const oldroot = this.root;
    this.root = newRoot;
    this.Response.mnt = this.root;
    window.history.pushState(null, null, url);
    this.path = url;
    /**
     * @type {Array}
     * @private
     */
    this.activeStack = [];
    /**
     * @type {number}
     * @private
     */
    this.running = 0;
    this.run();
    oldroot.style.zIndex = 999;
    oldroot.style.opacity = 1;
    oldroot.style.transitionDuration = ".3s";
    oldroot.style.opacity = 0;
    //return;
    setTimeout(() => {
        this.root.style.opacity = 1;
    }, 200);
    //this.root.style.opacity = 1;
    setTimeout(() => {
        oldroot.remove();
    }, 400);
};

/**
 * Launch stack execution
 * @public
 */
Uran.prototype.run = async function () {
    /**
     * if activeStack not generated(first run or Uran.prototype.reload())
     */
    if (this.activeStack.length === 0)   {
        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].path === '*' || this.stack[i].path.test(location.pathname)) {
                this.activeStack.push(this.stack[i])
            }
        }
        /**
         * @private
         * @type {number}
         */
        this.running = 0;
    }
    if (typeof this.activeStack[this.running] === 'undefined') {
        this.error(
            new Error('Page not found'),
            this.Request,
            this.Response,
            () => {
            }
        );
        return;
    }
    await this.activeStack[this.running].cb(
        this.Request.another(this.activeStack[this.running].link),
        this.Response,
        async () => {
            this.running++;
            await this.run();
        }
    )
};

