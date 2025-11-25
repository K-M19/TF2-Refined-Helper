// File: CheckUpdate.js (Content Script)

(function () {
    'use strict';

    const POPUP_DURATION = 10;

    const UPDATE_URL = "https://github.com/K-M19/TF2-Refined-Helper";
    const SETTING_KEY = "TF2RefinedHelper_IgnoreUpdate_Extension";

    function getCurrentVersion() {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
            return chrome.runtime.getManifest().version;
        }
    }

    function isNewerVersion(currentVer, remoteVer) {
        const curParts = currentVer.split('.').map(Number);
        const remParts = remoteVer.split('.').map(Number);
        for (let i = 0; i < Math.max(curParts.length, remParts.length); i++) {
            const cur = curParts[i] || 0;
            const rem = remParts[i] || 0;
            if (rem > cur) return true;
            if (rem < cur) return false;
        }
        return false;
    }


    function showUpdateNotification(remoteVersion) {
        const currentVersion = getCurrentVersion();

        const popup = document.createElement('div');
        popup.id = 'tf2rh-update-popup';

        popup.style.cssText = `
            position: fixed;
            top: 20px; 
            left: 20px; 
            background-color: #2a475e; 
            color: #c7d5e0;
            border: 2px solid #1b2838;
            border-radius: 8px;
            padding: 15px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            max-width: 300px;
            font-family: Arial, sans-serif;
            transition: opacity 0.5s;
            opacity: 1;
        `;


        popup.innerHTML = `
            <h3 style="margin-top: 0; margin-bottom: 10px; color: #66c0f4; font-size: 16px;">
                🚨 Update Warning
            </h3>
            <ul style="list-style: none; padding: 0; margin-bottom: 12px; font-size: 13px;">
                <li style="margin-bottom: 5px;">
                    Current Version: 
                    <strong style="color: #FF6961;">${currentVersion} (Outdated)</strong>
                </li>
                <li>
                    Latest Version: 
                    <strong style="color: #A8D173;">${remoteVersion} (Available)</strong>
                </li>
            </ul>
            
            <p style="font-size: 11px; margin-bottom: 12px; border-top: 1px solid #1b2838; padding-top: 8px;">
                Please update your TF2 Refined Helper for the best experience.
            </p>
            
            <a href="${UPDATE_URL}" target="_blank" style="
                display: block;
                padding: 10px;
                background-color: #5AA13B;
                color: white;
                text-align: center;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#6FB34C'" onmouseout="this.style.backgroundColor='#5AA13B'">
                UPDATE NOW
            </a>
        `;

        document.body.appendChild(popup);


        if (POPUP_DURATION > 0) {
            const timeoutSeconds = POPUP_DURATION * 1000;
            setTimeout(() => {
                popup.style.opacity = 0;
                setTimeout(() => popup.remove(), 500);
            }, timeoutSeconds);
        }
    }



    async function checkUpdate() {
        if (typeof chrome === 'undefined' || !chrome.runtime.sendMessage) {
            console.warn("Chrome Runtime API not available. Skipping update check.");
            return;
        }

        const currentVersion = getCurrentVersion();


        try {
            const response = await chrome.runtime.sendMessage({ action: "check_update" });

            if (response && response.success) {
                const remoteVersion = response.version;

                if (isNewerVersion(currentVersion, remoteVersion)) {
                    showUpdateNotification(remoteVersion);
                } else {
                    console.log(`TF2 Refined Helper: Running latest version (${currentVersion}).`);
                }
            } else if (response && response.error) {
                console.error("TF2 Refined Helper: Error from Background Script:", response.error);
            }
        } catch (error) {
            console.error("TF2 Refined Helper: Communication/Extension initialization error:", error);
        }
    }


    checkUpdate();
})();