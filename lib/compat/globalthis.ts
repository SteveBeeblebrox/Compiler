///#pragma once
((() => {
    if (typeof globalThis === "object") return;
    try {
        Object.defineProperty(Object.prototype, "__magic__", {
            get() {
                return this;
            },
            configurable: true
        });
        //@ts-ignore
        __magic__.globalThis = __magic__;
        // The previous line should have made `globalThis` globally
        // available, but it fails in Internet Explorer 10 and older.
        // Detect this failure and fall back.
        if (typeof globalThis === "undefined") {
            // Assume `window` exists.
            //@ts-ignore
            window.globalThis = window;
        }
        //@ts-ignore
        delete Object.prototype.__magic__;
    }
    catch (error) {
        // In IE8, Object.defineProperty only works on DOM objects.
        // If we hit this code path, assume `window` exists.
        //@ts-ignore
        window.globalThis = window;
    }
})());