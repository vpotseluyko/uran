Node.prototype.fill = function(val) {
    if (this.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        this.value = val;
    } else {
        this.innerHTML = val;
    }
};

Node.prototype.get = function () {
    if (this.tagName === "INPUT" || this.tagName === 'TEXTAREA') {
        return this.value;
    } else {
        return this.innerHTML;
    }
};

NodeList.prototype.fill = function (val) {
    [].forEach.call(this, item => item.fill(val))
};

NodeList.prototype.onclick = function (cb) {
    [].forEach.call(this, item => item.onclick = cb)
};