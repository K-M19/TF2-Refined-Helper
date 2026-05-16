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
            fetchData("https://database.butaa.top/raw/project/git/TF2-Refined-Helper/Vers.json")
                .then(data => sendResponse({ success: true, version: data.version }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
        } 
    }
);