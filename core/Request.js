import ParseUrl from "./Layer"

export class Request {

    constructor(express) {
        this.core = express;
        this.another('*');
    }

    another(url) {
        this.domain = location.host;
        this.keys = [];
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
            this.query = {};
            this.parseGet();
        }
        return this;
    }

    parseGet() {
        location.search.substr(1).split('&').forEach(item => {
            this.query[item.split('=')[0]] = item.split('=')[1]
        })
    }

}