(function () {
    'use strict';

    const usingit = true;
    const WARNING_ID = 'tf2rh-scammer-warning';

    const STATUS_CONFIG = {
        '1': {
            text: "✅ HIGHLY TRUSTED TRADER",
            color: '#2ecc71', // Green
            border: '#27ae60'
        },
        '2': {
            text: "⚠️ IMPERSONATION RISK",
            color: '#f39c12', // Orange/Yellow
            border: '#e67e22'
        },
        '3': {
            text: "❌ BLACKLISTED SCAMMER!",
            color: '#e74c3c', // Red
            border: '#c0392b'
        }
    };

    const BASE_CSS = `
        border-radius: 6px; /* Slightly smoother corners */
        padding: 12px 15px; /* More padding */
        margin-top: 10px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3); /* Stronger shadow */
        font-size: 15px; /* Slightly larger font */
        line-height: 1.4;
        font-family: 'Arial', sans-serif;
        text-transform: uppercase; /* Make status title more prominent */
    `;


    function getPartnerSteamID64() {
        const urlParams = new URLSearchParams(window.location.search);
        const partnerId = urlParams.get('partner');

        if (partnerId) {
            const baseId = 76561197960265728n;
            try {
                const steamId64 = baseId + BigInt(partnerId);
                return steamId64.toString();
            } catch (e) {
                console.error("Error converting partner ID to SteamID64:", e);
                return null;
            }
        }
        return null;
    }


    function showScammerWarning(type, reason) {
        let container = document.querySelector('div#trade_theirs');
        if (!container) return;

        if (document.getElementById(WARNING_ID)) return;

        const config = STATUS_CONFIG[type];
        if (!config) return;

        let warningDiv = document.createElement('div');
        warningDiv.id = WARNING_ID;

        warningDiv.style.cssText = `
            ${BASE_CSS}
            background-color: ${config.color};
            border: 2px solid ${config.border};
            color: white;
        `;

        warningDiv.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 5px; letter-spacing: 1px;">
                ${config.text}
            </div>
            <div style="font-size: 13px; font-weight: normal; opacity: 0.9;">
                Reason: <strong>${reason || (type === '1' ? 'Confirmed reliable trader.' : 'No detailed reason provided.')}</strong>
            </div>
            ${type === '3' ? '<div style="margin-top: 8px; font-size: 16px; color: #fff; text-shadow: 0 0 5px rgba(0,0,0,0.8);">🛑 ABORT TRADE IMMEDIATELY!</div>' : ''}
            ${type === '2' ? '<div style="margin-top: 5px; font-size: 12px; font-weight: normal;">Verify profile history and item legitimacy carefully.</div>' : ''}
        `;

        container.prepend(warningDiv);
    }


    function checkList(list, targetId64) {
        if (!list || !list.Steamid64) return null;

        for (const entry of list.Steamid64) {
            const key = entry.key;
            const id = Object.keys(entry).find(k => k !== 'key');

            if (id === targetId64) {
                const reason = entry[id];
                return { key, reason };
            }
        }
        return null;
    }


    function removeTradeUIElements() {
        const tradeActiveDiv = document.getElementById('trade_theirs_active');
        const tradeSeparatorDiv = document.getElementById('trade_items_separator');

        if (tradeActiveDiv) {
            tradeActiveDiv.remove();
            console.log('Removed element: trade_theirs_active');
        }

        if (tradeSeparatorDiv) {
            tradeSeparatorDiv.remove();
            console.log('Removed element: trade_items_separator');
        }
    }


    async function checkScammer() {
        if (typeof chrome === 'undefined' || !chrome.runtime.sendMessage) {
            return;
        }

        const targetId64 = getPartnerSteamID64();
        if (!targetId64) return;

        try {
            const response = await chrome.runtime.sendMessage({ action: "check_lists" }); 

            if (response && response.success) {
                const scammerList = response.scammerList;
                const legitList = response.legitList; 

                const legitResult = checkList(legitList, targetId64);
                if (legitResult) {
                    showScammerWarning('1', legitResult.reason);
                    return;
                }

                const scammerResult = checkList(scammerList, targetId64);
                if (scammerResult && scammerResult.key !== '0') {
                    showScammerWarning(scammerResult.key, scammerResult.reason);
                }

            } else if (response && response.error) {
                console.error("Lists Check Error from Background Script:", response.error);
                console.warn("DEBUG HINT: Please open the Service Worker (Background Page) console to see the original network fetch error (e.g., 404, CORS error).");
            }
        } catch (error) {
            console.error("Lists Check Communication Error:", error);
        }
    }

    if (usingit) {
        removeTradeUIElements();
        checkScammer();
    }
})();