export class Router {

    constructor() {
        this.stack = [];
    }

    getStack() {
        return this.stack;
    }

    use(fn) {
        if (typeof fn === 'function') {
            this.stack.push({path: '*', cb: fn})
        } else {
            this.stack.push({path: arguments[0], cb: arguments[1]})
        }
    }

}