async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`); 
        return await response.json();
    } catch (error) {
        console.error(`Background fetch error from ${url}:`, error);
        throw error;
    }
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.action === "check_update") {
            fetchData("https://raw.githubusercontent.com/K-M19/TF2-Refined-Helper/refs/heads/main/js/version.json")
                .then(data => sendResponse({ success: true, version: data.version }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
        } 
    }
);