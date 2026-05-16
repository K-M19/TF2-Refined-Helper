// File: CheckUpdate.js (Content Script)

(function () {
    'use strict';

    const POPUP_DURATION = 10;
    const UPDATE_URL = "https://github.com/K-M19/TF2-Refined-Helper";

    function getCurrentVersion() {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
            return chrome.runtime.getManifest().version;
        }
        return 'unknown';
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
            top: 24px;
            left: 24px;
            width: min(360px, calc(100vw - 48px));
            background: linear-gradient(165deg, #1b2b3f 0%, #0f1d30 100%);
            color: #d6e4f1;
            border: 1px solid rgba(102, 192, 244, 0.35);
            border-radius: 14px;
            padding: 16px;
            z-index: 99999;
            box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45);
            font-family: Inter, 'Segoe UI', Arial, sans-serif;
            opacity: 0;
            transform: translateY(-8px);
            transition: opacity 220ms ease, transform 220ms ease;
            backdrop-filter: blur(2px);
        `;

        popup.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;">
                <div style="font-size:15px;font-weight:700;color:#66c0f4;letter-spacing:0.2px;">TF2 Refined Helper Update</div>
                <button id="tf2rh-close-update" style="background:transparent;border:none;color:#7f97ac;font-size:18px;cursor:pointer;line-height:1;padding:0;">×</button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                <div style="background:rgba(255,255,255,0.04);padding:10px;border-radius:10px;">
                    <div style="font-size:11px;color:#9bb0c2;text-transform:uppercase;letter-spacing:0.6px;">Current</div>
                    <div style="font-weight:700;color:#ff8a8a;margin-top:3px;">${currentVersion}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04);padding:10px;border-radius:10px;">
                    <div style="font-size:11px;color:#9bb0c2;text-transform:uppercase;letter-spacing:0.6px;">Latest</div>
                    <div style="font-weight:700;color:#8be78b;margin-top:3px;">${remoteVersion}</div>
                </div>
            </div>

            <p style="margin:0 0 14px;font-size:12px;line-height:1.45;color:#c0cfdb;">
                New version available. Update now for new fixes and smoother trading experience.
            </p>

            <a href="${UPDATE_URL}" target="_blank" rel="noopener noreferrer" style="
                display:block;
                text-align:center;
                text-decoration:none;
                font-weight:700;
                color:white;
                background:linear-gradient(90deg,#3aa6e4,#57c0ff);
                border-radius:10px;
                padding:10px 12px;
                box-shadow:0 8px 18px rgba(58,166,228,0.35);
            ">Update on GitHub</a>
        `;

        document.body.appendChild(popup);
        requestAnimationFrame(() => {
            popup.style.opacity = 1;
            popup.style.transform = 'translateY(0)';
        });

        const closeBtn = popup.querySelector('#tf2rh-close-update');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.style.opacity = 0;
                popup.style.transform = 'translateY(-8px)';
                setTimeout(() => popup.remove(), 220);
            });
        }

        if (POPUP_DURATION > 0) {
            setTimeout(() => {
                popup.style.opacity = 0;
                popup.style.transform = 'translateY(-8px)';
                setTimeout(() => popup.remove(), 220);
            }, POPUP_DURATION * 1000);
        }
    }

    async function checkUpdate() {
        if (typeof chrome === 'undefined' || !chrome.runtime.sendMessage) {
            console.warn('Chrome Runtime API not available. Skipping update check.');
            return;
        }

        const currentVersion = getCurrentVersion();

        try {
            const response = await chrome.runtime.sendMessage({ action: 'check_update' });

            if (response && response.success) {
                const remoteVersion = response.version;

                if (isNewerVersion(currentVersion, remoteVersion)) {
                    showUpdateNotification(remoteVersion);
                } else {
                    console.log(`TF2 Refined Helper: Running latest version (${currentVersion}).`);
                }
            } else if (response && response.error) {
                console.error('TF2 Refined Helper: Error from Background Script:', response.error);
            }
        } catch (error) {
            console.error('TF2 Refined Helper: Communication/Extension initialization error:', error);
        }
    }

    checkUpdate();
})();
