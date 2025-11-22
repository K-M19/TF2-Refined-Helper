// This script runs in the Page World (an environment that is not blocked by the extension’s CSP).

window.addEventListener('message', function(event) {
    if (event.source !== window) {
        return;
    }
    if (event.data.type && (event.data.type === 'EXECUTE_PAGE_SCRIPT')) {
        try {
            eval(event.data.code);
        } catch (e) {
            console.error("TF2 Refined Helper Injection Error:", e);
        }
    }
}, false);