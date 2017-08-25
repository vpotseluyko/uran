import {getElementVal, setElementVal, isInput} from "../Vendor/DOM"

export class Response {

    constructor(mnt, express) {
        this.core = express;
        this.bind = {};
        this.ensureBind();
        this.listeners = {};
        this.functions = {};
        this.mnt = mnt;
    }

    ensureBind() {
        this.locals = new Proxy(this.bind, {
            set(target, name, value) {
                const e = document.querySelector(`[data-bind="${name}"]`);
                if (e !== null) {
                    setElementVal(e, value);
                }
                target[name] = value;
                return true;
            },
            get(target, name) {
                const e = document.querySelector(`[data-bind="${name}"]`);
                if (e !== null) {
                    target[name] = getElementVal(e);
                }
                return target[name];
            }
        })
    }

    addRenderProperties(obj) {
        for (let prop in obj) {
            this.locals[prop] = obj[prop];
        }
    }

    render(slc, tmp, obj = {}) {
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
    }

    add(slc = this.mnt, tmp, obj) {
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
    }

    addBefore(slc = this.mnt, tmp, obj) {
        if (typeof arguments[0] === 'string') {
            //
        } else if (typeof arguments[0] === 'function') {
            slc = null;
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
    }

    bindDOM() {
        const clickers = document.querySelectorAll('[data-click]');
        [].forEach.call(clickers, el => {
            el.onclick = this.listeners[el.getAttribute('data-click')]
        });
        const navigates = document.querySelectorAll('[data-href]');
        [].forEach.call(navigates, el => {
            el.onclick = () => this.core.reloadSoftly(el.getAttribute('data-href'))
        })
    }
}