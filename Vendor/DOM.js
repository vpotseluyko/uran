export function getElementVal(el) {
    if (el.tagName === "INPUT" || el.tagName === 'TEXTAREA') {
        return el.value;
    } else {
        return el.innerText;
    }
}
export function setElementVal(el, val) {
    if (el.tagName === "INPUT" || el.tagName === 'TEXTAREA') {
        el.value = val;
    } else {
        el.innerText = val;
    }
}

export function isInput(el) {
    return el.tagName === "INPUT" || el.tagName === 'TEXTAREA'
}