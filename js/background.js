const REMOTE_VERSION_URL = "https://furbox.butaa.top/API/Project/TF2-Refined-Helper/VsFiles.json";
const SCAMMER_LIST_URL = "https://furbox.butaa.top/API/Project/TF2-Refined-Helper/scammer.json"; 
const LEGIT_LIST_URL = "https://furbox.butaa.top/API/Project/TF2-Refined-Helper/Legit.json";


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
            fetchData(REMOTE_VERSION_URL)
                .then(data => sendResponse({ success: true, version: data.version }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
        } 
        
        else if (request.action === "check_lists") { 
            Promise.all([
                fetchData(SCAMMER_LIST_URL),
                fetchData(LEGIT_LIST_URL)
            ])
            .then(([scammerData, legitData]) => {
                sendResponse({ 
                    success: true, 
                    scammerList: scammerData,
                    legitList: legitData
                });
            })
            .catch(error => {
                sendResponse({ success: false, error: "Failed to load scammer or legit lists." });
            });
            
            return true;
        }
    }
);