var sites = {
    rep: {
        url: "https://rep.tf/",
        text: "Rep.TF",
        class: "btn_rep_custom"
    },
    bp: {
        url: "https://backpack.tf/profiles/",
        text: "Backpack.TF",
        class: "btn_bp_custom"
    },
    hist: {
        url: "https://steamhistory.net/id/",
        text: "SteamHistory",
        class: "btn_hist_custom"
    }
};

async function getSteamID64() {
    let url = window.location.href.replace(/\/$/, "");
    let parts = url.split("/");
    let last = parts[parts.length - 1];

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
        .btn_rep_custom, .btn_bp_custom, .btn_hist_custom {
            padding: 6px 12px;
            margin-left: 5px;
            margin-top: 3px;
            color: white !important;
            border-radius: 3px;
            display: inline-block;
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

    let container = document.querySelector("div.header_real_name.ellipsis");
    if (!container) return;
    if (container.querySelector(".btn_rep_custom")) return;

    container.appendChild(document.createElement("br"));

    Object.values(sites).forEach(site => {
        let a = document.createElement("a");
        a.className = site.class;
        a.href = site.url + steamID;
        a.target = "_blank";
        a.textContent = site.text;
        container.appendChild(a);
    });
}

addButtons();
