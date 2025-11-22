var bp = "backpack_spells";
var out = "outpost_spells";
var scm = "scm_spells";
var itemUsed = "itemUsed";
var defaultSteamURL = "https://steamcommunity.com/profiles/";


let isRunnerInjected = false;
function sendCodeMessage(code) {
	const codeToRun = '(' + code + ')();';

	window.postMessage({
		type: 'EXECUTE_PAGE_SCRIPT',
		code: codeToRun
	}, window.location.origin);
}

function runPageCode(code) {
	if (!isRunnerInjected) {
		var script = document.createElement('script');
		script.src = chrome.runtime.getURL('js/page_runner.js');
		(document.head || document.documentElement).appendChild(script);
		script.onload = function () {
			sendCodeMessage(code);
		};
		isRunnerInjected = true;
	} else {
		sendCodeMessage(code);
	}
}

function GrabDOM(content_id, URL, arg) {
	return $.ajax({
		url: URL,
		dataType: 'text',
		success: function (data) {
			//console.log(data);
			(arg[0])[arg[1] - 1] = data;
		}, error: function () {
			if (content_id == 0) {
				bpMsg("<br><font color='red'>\
                Note: Page "+ arg[1] + " failed to load. " +
					"It may be because of backpack server or a bug. " +
					"Please refresh and try again.</font>");
			} else if (content_id == 1) {
				outpostMsg("<br><font color='red'>\
                Note: Page "+ arg[1] + " failed to load. " +
					"It may be because of outpost server or a bug. " +
					"Please refresh and try again.</font>");
			} else if (content_id == 2) {
			}
		}
	});
}

function getUrlParam(url, paramName) {
	var params = url.split(/\?|\&/);
	for (i = 0; i < params.length; i++) {
		var currentParam = params[i].split("=");
		if (currentParam[0] === paramName) {
			return currentParam[1];
		}
	}
}

function setURLParameter(url, key, value) {
	var l_url = url.split('&'), query = {}, new_url = "";
	//console.log(url_list);
	for (var i = 0; i < l_url.length; i++) {
		if (l_url[i].indexOf('=') !== -1) {
			var param = l_url[i].split('=');
			query[param[0]] = param[1];
			//console.log(param);
		} else if (i !== l_url.length - 1) {
			new_url += str + "&";
		}
	}
	query[key] = value;
	new_url += $.param(query);
	new_url = decodeURIComponent(new_url);
	//console.log(new_url);
	return new_url;
}