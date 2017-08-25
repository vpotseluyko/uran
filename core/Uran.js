import RegexpUri from "./Layer";
import {Response} from "./Response"
import {Request} from "./Request"
import {Router} from "./Router"
import {Ajax} from "./Ajax"

export class Uran {

    static Router() {
        return new Router();
    }

    static Post = (url) => Ajax.post(url);

    static Get = (url) => Ajax.get(url);

    constructor(root) {
        document.querySelector(root).innerHTML = '';
        this.mount(root);
        this.stack = [];
        this.path = location.pathname;
        this.Response = new Response(this.root, this);
        this.Request = new Request(this);
    }

    mount(domSelector) {
        this.root = document.querySelector(domSelector);
        if (this.root === null) {
            throw new Error('Invalid mountpoint')
        }
    }

    spreadRouter(Router, path) {
        const routersStack = Router.getStack();
        for (let i = 0; i < routersStack.length; i++) {
            if (routersStack[i].path === '*') {
                routersStack[i].path = '/*'
            }
            routersStack[i].link = path + routersStack[i].path;
            routersStack[i].path = RegexpUri(path + routersStack[i].path);
        }
        this.stack.push(...routersStack);
    }

    use(fn) {
        if (arguments.length === 1) {
            if (typeof fn === 'object') {
                this.spreadRouter(fn, '');
            } else {
                if (fn.length === 4) {
                    this.error = fn;
                } else {
                    this.stack.push({path: '*', cb: fn, link: '*'});
                }
            }
        } else if (arguments.length === 2) {
            if (typeof arguments[1] === 'object') {
                this.spreadRouter(arguments[1], fn)
            } else {
                this.stack.push({path: RegexpUri(fn), link: fn, cb: arguments[1]})
            }
        }
    }

    reload(url) {
        this.root.innerHTML = '';
        window.history.pushState(null, null, url);
        delete this.activeStack;
        this.running = 0;
        this.run();
    }

    run() {
        if (typeof this.activeStack === 'undefined') {
            this.activeStack = [];
            for (let i = 0; i < this.stack.length; i++) {
                if (this.stack[i].path === '*' || this.stack[i].path.test(location.pathname)) {
                    this.activeStack.push(this.stack[i])
                }
            }
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
        this.activeStack[this.running].cb(
            this.Request.another(this.activeStack[this.running].link),
            this.Response,
            () => {
                this.running++;
                this.run();
            }
        )
    }

}

