var sites = {
    rep: {
        url: "https://rep.tf/",
        text: "Rep.tf",
        class: "btn_rep_custom"
    },
    bp: {
        url: "https://backpack.tf/profiles/",
        text: "Backpack.tf",
        class: "btn_bp_custom"
    },
    hist: {
        url: "https://steamhistory.net/id/",
        text: "SteamHistory.net",
        class: "btn_hist_custom"
    }
};

async function getSteamID64() {
    let url = window.location.href.replace(/\/$/, "");
    let parts = url.split("/");
    let last = parts[parts.length - 1];
    if (url.includes("tradeoffer")) {
        let partnerLink = document.querySelector(".offerheader .avatarIcon a");
        if (partnerLink) {
            let partnerUrl = partnerLink.href.replace(/\/$/, "");
            let partnerParts = partnerUrl.split("/");
            let partnerId = partnerParts[partnerParts.length - 1];

            if (/^\d{17}$/.test(partnerId)) {
                return partnerId;
            }
            try {
                let xml = await fetch(`https://steamcommunity.com/id/${partnerId}/?xml=1`).then(r => r.text());
                let match = xml.match(/<steamID64>(\d+)<\/steamID64>/);
                return match ? match[1] : null;
            } catch {
                return null;
            }
        }
    }

    if (/^\d{17}$/.test(last)) return last;

    try {
        let xml = await fetch(`https://steamcommunity.com/id/${last}/?xml=1`).then(r => r.text());
        let match = xml.match(/<steamID64>(\d+)<\/steamID64>/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

function injectCustomCSS() {
    if (document.getElementById("custom_btn_colors")) return;
    const css = `
        .custom_trade_warning {
            color: #ffff00d3 !important;
            font-weight: bold;
            display: block;
            margin-top: 10px;
            margin-bottom: 10px; 
        }
        
        div.tradeoffer_partner_ready_note {
            text-align: center;
        }
        
        .btn_rep_custom, .btn_bp_custom, .btn_hist_custom {
            padding: 4px 8px; 
            margin-left: 5px;
            display: inline-block; 
            color: white !important;
            border-radius: 3px;
            font-size: 12px; 
            line-height: normal;
        }
        
        div.header_real_name.ellipsis .btn_rep_custom,
        div.header_real_name.ellipsis .btn_bp_custom,
        div.header_real_name.ellipsis .btn_hist_custom {
            margin-top: 3px; 
        }
        
        div.tradeoffer_partner_ready_note .btn_rep_custom,
        div.tradeoffer_partner_ready_note .btn_bp_custom,
        div.tradeoffer_partner_ready_note .btn_hist_custom {
            margin-top: 5px; 
        }
        
        .btn_rep_custom { background-color: #2ecc71 !important; }
        .btn_bp_custom { background-color: #3498db !important; }
        .btn_hist_custom { background-color: #e74c3c !important; }

        .btn_rep_custom:hover,
        .btn_bp_custom:hover,
        .btn_hist_custom:hover {
            opacity: 0.85;
        }
    `;
    let tag = document.createElement("style");
    tag.id = "custom_btn_colors";
    tag.textContent = css;
    document.head.appendChild(tag);
}

async function addButtons() {
    let steamID = await getSteamID64();
    if (!steamID) return console.log("No SteamID64.");

    injectCustomCSS();

    const warningText = "Please consider carefully before every trade transaction, check the partner's reputation before proceeding";
    
    let readyNote = document.querySelector(".tradeoffer_partner_ready_note");
    let tradeOfferContainer = null; 

    if (readyNote) {
        readyNote.textContent = warningText; 
        readyNote.classList.add('custom_trade_warning');
        readyNote.style.display = 'block';
        
        tradeOfferContainer = readyNote; 
    }
    
    let containers = [
        document.querySelector("div.header_real_name.ellipsis") 
    ].filter(el => el != null);

    if (tradeOfferContainer) {
    }


    containers.forEach(container => {
        if (container.querySelector(".btn_rep_custom")) return;

        if (container.classList.contains('header_real_name')) {
             container.appendChild(document.createElement("br"));
        }

        Object.values(sites).forEach(site => {
            let a = document.createElement("a");
            a.className = site.class;
            a.href = site.url + steamID;
            a.target = "_blank";
            a.textContent = site.text;
            container.appendChild(a);
        });
    });

    if (tradeOfferContainer) {
        let buttonWrapper = document.createElement("div");
        buttonWrapper.id = "custom_trade_buttons_wrapper";
        buttonWrapper.style.textAlign = "center";

        Object.values(sites).forEach(site => {
            let a = document.createElement("a");
            a.className = site.class;
            a.href = site.url + steamID;
            a.target = "_blank";
            a.textContent = site.text;
            buttonWrapper.appendChild(a);
        });

        tradeOfferContainer.insertAdjacentElement('afterend', buttonWrapper);
    }
}

addButtons();