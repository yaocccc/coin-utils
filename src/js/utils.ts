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
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export {
    sGet, sSet, sleep
}
