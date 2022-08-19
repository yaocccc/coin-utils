const sGet = (key: string) => {
    try {
        return typeof Storage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
        return null;
    }
};
const sSet = (key: string, value: any) => {
    try {
        typeof Storage !== 'undefined' && localStorage.setItem(key, value);
    } catch (e) {}
};
export {
    sGet, sSet
}
