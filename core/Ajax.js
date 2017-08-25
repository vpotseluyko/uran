class Response {

    constructor(resp) {
        this.response = resp;
    }

    json() {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.parse(this.response))
            } catch (e) {
                reject(e);
            }
        });
    }

}

class XHR {

    constructor(method, url) {
        this.method = method;
        this.url = url;
        this.headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    headers(headers) {
        this.headers = headers;
        return this;
    }

    data(data) {
        this.params = data;
        return this.send();
    }


    send = () => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(this.method, this.url);
        xhr.onload = function ()  {
            if (this.status >= 200 && this.status < 300) {
                resolve(new Response(xhr.response));
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

}

export let Ajax = {

    post(address) {
        return new XHR('post', address)
    },

    get (address) {
        return new XHR('get', address)
    }

};