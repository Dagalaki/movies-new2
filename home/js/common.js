var ENABLE_CONSENTFRAME=0, ENABLE_CONSENT = 0, ENABLE_SPONSOR = 0, ENABLE_MIDDLE =1 , VIDEO_PREVIEW = 0, ENABLE_WATCHED=1;
function getCookie(Name) {
	try {
		var offset, end, search = Name + "="
		if (document.cookie.length > 0) {
			offset = document.cookie.indexOf(search)
			if (offset != -1) {
				offset += search.length
				end = document.cookie.indexOf(";", offset)
				if (end == -1)
					end = document.cookie.length
				return unescape(document.cookie.substring(offset, end))
			}
			return ('');
		}
	} catch (e) {};
	return ('');
}
function getVersion() {
	var version = "",
		useragent = navigator.userAgent.toLowerCase();
	if (navigator.userAgent.indexOf('AppleWebKit/535.20') != -1) return ("1.2.1");
	var arr = useragent.split("hbbtv/");
	if (arr.length > 1) {
		version = arr[1].substr(0, 5);
	}
	return version;
}
function checkWhitelistAndRedirect(targetUrl) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "stats/json/whitelist.json?ts="+new Date().getTime(), true); // <-- change path if needed

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            try {
                var data = JSON.parse(xhr.responseText);
            } catch (e) {
                console.log("Invalid JSON from whitelist");
                return;
            }

            if (!data || !data.items) {
                console.log("Whitelist not available");
                return;
            }

            var list = data.items;
		console.log(smid, list);
            var allowed =
                (clientIP && list.indexOf(clientIP) !== -1) ||
                (smid && list.indexOf(String(smid)) !== -1);

            if (allowed) {
                window.location.href = targetUrl;
            } else {
                console.log("Not allowed. IP or SmartID not in whitelist.");
            }
        }
    };

    xhr.send(null);
}
function timeStringToSeconds(hms){
    
    var a = hms.split(':'); 

    var seconds = parseInt(a[0] * 60 * 60) + parseInt(a[1] * 60) + parseInt(a[2]);
    if(GLOBALS.brtyp) return parseInt(seconds * 1000);
    else return parseInt(seconds);
}
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    // return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    return hours + ":" + minutes + ":" + seconds;
}
function jsFehler(Nachricht, Datei, Zeile) {
	if (GLOBALS.dev) {
		debug(Datei +' '+ Nachricht + ' line '+ Zeile);
		return;
	}
	var agt = navigator.userAgent.toLowerCase();
	var xtt = new Image;
	if (typeof Zeile == 'undefined') Zeile = 'movie-anixa-tv';
	var date = new Date();
	//var str = '[TIME: '+ date.getHours() +':'+date.getMinutes() + ']';
	var str = "";
	xtt.src = '/err.php?U=cretetv&P=jsErr:' + Zeile + '&M=' + escape(str + ' : ' + Nachricht + ':' + agt + ':' + Datei);
	return true;
}
try {
	if (location.host != "127.0.0.1") window.onerror = jsFehler;

} catch (e) {}

function cleardebug() {
	if (GLOBALS.dev) {
		var deb = document.getElementById("debug");
		deb.innerHTML = '';
		GLOBALS.debugCnt = 0;
	}
}

// function debug(s) {
	
// 	if(GLOBALS.debugCnt > 24 ) {
// 		var a = document.getElementById("debug").innerHTML.split('<br>');
// 		//console.log('cnt '+ GLOBALS.debugCnt);
// 		//console.log(a);
// 		a.shift();
// 		document.getElementById("debug").innerHTML = a.join('<br>');
// 	}

// 	var a = navigator.userAgent;
// 	if (GLOBALS.dev) {
// 		var deb = document.getElementById("debug");
// 		deb.innerHTML += s + '<br>';
// 		GLOBALS.debugCnt++;

// 	}
// }
function debug(s, color) {
	if(!GLOBALS.debLines) GLOBALS.debLines = 0;
	if(location.host == "127.0.0.1" ) {
		document.getElementById("debug").style.display = "block!important";
	}
	//if (navigator.userAgent.indexOf('firetv') == -1) return;
	//if (navigator.userAgent.indexOf('Samsung') != -1 && s.indexOf('<') != -1) return;

	if (GLOBALS.dev) {
return true;
		var deb = document.getElementById("debug");
		GLOBALS.debLines++;
		//console.log(deb.innerHTML);
		if(GLOBALS.debLines > 21 ) {
			var a = deb.innerHTML.split('<br>');
			a.shift();
			deb.innerHTML = a.join('<br/>');
		}

		if(typeof profile != "undefined"){
			if(profile.hbbtv == "1.1"){
				if(color){
					deb.innerHTML +=  '<span style="color:' +color+ '!important">' + s + '</span><br/>';
				} else{
					deb.innerHTML += s + '<br/>';
				}
			}else{

				if(color){
					deb.innerHTML += "["+ performance.now() +'ms]: <span style="color:' +color+ '!important">' + s + '</span><br/>';
				} else{
					deb.innerHTML += "["+ performance.now() +"ms]: "+ s + '<br/>';
				}
			}
		}else{
			if(color){
				deb.innerHTML += "["+ performance.now() +'ms]: <span style="color:' +color+ '!important">' + s + '</span><br/>';
			} else{
				deb.innerHTML += "["+ performance.now() +"ms]: "+ s + '<br/>';
			}
		}

		GLOBALS.debugCnt++;
	}

}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function jsLog(Nachricht, Datei, Zeile) {

	var agt = navigator.userAgent.toLowerCase();
	var xtt = new Image;
	if (typeof Zeile == 'undefined') Zeile = 'movie-anixa-tv';
	var date = new Date();
	//var str = '[TIME: '+ date.getHours() +':'+date.getMinutes() + ']';
	var str = "";
	xtt.src = '/err.php?U=MovieAnixa&P=jsErr:' + Zeile + '&M=' + escape(str + ' : ' + Nachricht + ':' + agt + ':' + Datei);
	return true;
}
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
    	if(this && this.parentNode)
        this.parentNode.removeChild(this);
    };
}
var FORMULA_APP_ID = 4;

var addTimer = false;
var NEW_FEATURE = false;
var CYCLIC_ON = false;
var IN_V2 = false;
var INFO_FEATURE = false;
var ctrl = 1;
var BTN_FULLSCREEN = 0;
var BTN_PLAY_PAUSE = 1;
var BTN_STOP = 2;
var BTN_REWIND = 3;
var BTN_FASTFORWARD = 4;

var SEL_OPEN = 0;
var SEL_CLOSED = 1;

var ON_XENES_SEIRES = 1;
var ON_EIDISEIS = 2;

var ON_VOD = 0;
var ON_MOSAIC = 1;
var ON_TRAILER = 2;
var ON_TABS = 3;

var isPlaying = false;
var invideoplayer = false;
var vid, full, anzeige;
var jumpInterval = 5;
var inicons = false;
var iconSel = 0;
var brtyp = navigator.userAgent.search(/TV/i) >= 0;
var tvbildPos = 134;

function hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

function addClass(elem, className) {
    if (!hasClass(elem, className)) {
        elem.className += ' ' + className;
    }
}

function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
  
    if (hasClass(elem, className) ) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}

/*
Object.prototype.addClass = function (className) {
	if (!this.hasClass(className)) {
		if (this.className) this.className += " " + className;
		else this.className = className;
	}
};
Object.prototype.removeClass = function (className) {
	var regexp = this.addClass[className];
	if (!regexp) regexp = this.addClass[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
	if(this.className && typeof this.className.replace === "function") this.className = this.className.replace(regexp, "$2");
};

Object.prototype.hasClass = function (className) {
	var regexp = this.addClass[className];
	if (!regexp) regexp = this.addClass[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
	return regexp.test(this.className);
};*/
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
function moves(tit) {

	if(location.host == '127.0.0.1') console.log('[moves] tit: ' + tit);
	if (tit == "") return;

	var piwik = new Image;
	sm = '';
	if (GLOBALS.smid)
		sm = '&uid=' + GLOBALS.smid;
	llog('[moves] tit: '+ tit);
	piwik.src = "http://smarttv.anixa.tv/cretetv/DEV/move.php?path="+ encodeURIComponent(tit) +"&smid="+smartid;
	
	return true;
}

function shortTime(totalSeconds) {
	if (totalSeconds >= 3600) {
		hours = Math.floor(totalSeconds / 3600);
	}
	totalSeconds %= 3600;
	minutes = Math.floor(totalSeconds / 60);
	seconds = totalSeconds % 60;
	if (totalSeconds >= 3600) return "" + hours + ":" + minutes + ":" + seconds + "";
	else return "" + minutes + ":" + seconds + "";
}

function devmode(msg, obj) {
	return true;
}

function devmode2(msg, obj) {
	if (document.getElementById("log-message")) {
		if (location.host == "127.0.0.1" || location.host == "195.211.203.122") {
			var inner = document.getElementById("log-message").innerHTML;
			document.getElementById("log-message").innerHTML += msg + "<br/>";
			if (inner.length > 3000) document.getElementById("log-message").innerHTML = "";
		}


	}
}

function llog(msg, obj) {
	if (location.host == "127.0.0.1" || location.host == "195.211.203.122") {
		if (!obj) console.log(msg);
		else console.log(msg, ", ", obj);

	}

}

function lalert(msg) {
	if (location.host == "127.0.0.1") {
		alert(msg);
	} else llog(msg);

}




var GLOBALS = {
	"sid": null,
	"smid": 0,
	"lastVidId" : 0,
	"debugCnt" : 0,
	"tsid": null,
	"onid": null,
	"user_country": "GR",
	"brtyp": navigator.userAgent.search(/TV/i) >= 0,
	"pageId": 0,
	"posi": null,
	"mode": null,
	"offset": 0,
	"upperLimit": 0,
	"baseurl": "",
	"focusmgr": null,
	"scenemgr": null,
	"demomode": null,
	"allowbroadcast": true,
	"keyevent": "",
	"philipsbug": false,
	"nosoundOn": false,
	"videoplayer": null,
	"muter": null,
	"setVidPos": 0,
	"middleTimer": null,
	"jumpTimer": null,
	"ignoreKeyCodes": {},
	"dash":true,
	"ui" : 2,
	"keyeventlistener": function (e) {

		if (GLOBALS.demomode && (e.ctrlKey || e.altKey || e.metaKey)) {
			return;
		}
		var kc = e.keyCode,
			handled;
		if (!kc) {
			kc = e.charCode;
			alert(kc);
		}
		handled = GLOBALS.focusmgr.handleKeyCode(kc);
		if (handled) {

			e.preventDefault();
		}


		return handled;
	}
};

if (typeof KeyEvent !== 'undefined') {
	if (typeof KeyEvent.VK_LEFT !== 'undefined') {
		var VK_LEFT = KeyEvent.VK_LEFT;
		var VK_UP = KeyEvent.VK_UP;
		var VK_RIGHT = KeyEvent.VK_RIGHT;
		var VK_DOWN = KeyEvent.VK_DOWN;
	}
	if (typeof KeyEvent.VK_ENTER !== 'undefined') {
		var VK_ENTER = KeyEvent.VK_ENTER;
	}
	if (typeof KeyEvent.VK_RED !== 'undefined') {
		var VK_RED = KeyEvent.VK_RED;
		var VK_GREEN = KeyEvent.VK_GREEN;
		var VK_YELLOW = KeyEvent.VK_YELLOW;
		var VK_BLUE = KeyEvent.VK_BLUE;
	}
	if (typeof KeyEvent.VK_PLAY !== 'undefined') {
		var VK_PLAY = KeyEvent.VK_PLAY;
		var VK_PAUSE = KeyEvent.VK_PAUSE;
		var VK_STOP = KeyEvent.VK_STOP;
	}
	if (typeof KeyEvent.VK_FAST_FWD !== 'undefined') {
		var VK_FAST_FWD = KeyEvent.VK_FAST_FWD;
		var VK_REWIND = KeyEvent.VK_REWIND;
	}
	if (typeof KeyEvent.VK_NEXT !== 'undefined') {
		var VK_NEXT = KeyEvent.VK_NEXT;
		var VK_PREV = KeyEvent.VK_PREV;
	}
	if (typeof KeyEvent.VK_BACK !== 'undefined') {

		var VK_BACK = KeyEvent.VK_BACK;
	}
	if (typeof KeyEvent.VK_0 !== 'undefined') {
		var VK_0 = KeyEvent.VK_0;
		var VK_1 = KeyEvent.VK_1;
		var VK_2 = KeyEvent.VK_2;
		var VK_3 = KeyEvent.VK_3;
		var VK_4 = KeyEvent.VK_4;
		var VK_5 = KeyEvent.VK_5;
		var VK_6 = KeyEvent.VK_6;
		var VK_7 = KeyEvent.VK_7;
		var VK_8 = KeyEvent.VK_8;
		var VK_9 = KeyEvent.VK_9;
	}
}
if (typeof VK_LEFT === 'undefined') {
	var VK_LEFT = 0x25;
	var VK_UP = 0x26;
	var VK_RIGHT = 0x27;
	var VK_DOWN = 0x28;
}
if (typeof VK_ENTER === 'undefined') {
	var VK_ENTER = 0x0d;
}
if (typeof VK_RED === 'undefined') {
	var VK_RED = 0x74;
	var VK_GREEN = 0x75;
	var VK_YELLOW = 0x76;
	var VK_BLUE = 0x77;
}
if (typeof VK_PLAY === 'undefined') {
	var VK_PLAY = 0x50;
	var VK_PAUSE = 0x51;
	var VK_STOP = 0x53;
}
if (typeof VK_FAST_FWD === 'undefined') {
	var VK_FAST_FWD = 0x46;
	var VK_REWIND = 0x52;
}
if (typeof VK_NEXT === 'undefined') {
	var VK_NEXT = -1;
	var VK_PREV = -1;
}
if (typeof VK_BACK === 'undefined') {
	var VK_BACK = 0xa6;
}
if (typeof VK_0 === 'undefined') {
	var VK_0 = 0x30;
	var VK_1 = 0x31;
	var VK_2 = 0x32;
	var VK_3 = 0x33;
	var VK_4 = 0x34;
	var VK_5 = 0x35;
	var VK_6 = 0x36;
	var VK_7 = 0x37;
	var VK_8 = 0x38;
	var VK_9 = 0x39;
}

function FocusManager(basekeyset) {
	this.allObjects = {};
	this.focusableObjects = {};
	this.currentFocus = null;
	this.onFocusChange = null;
	this.patchThruEventsIfHidden = false;
	this.hidden = false;
	this.currentKeyset = 0;
	this.keysethidden = 0;
	this.keysets = [basekeyset];
	this.keysetslen = 1;
	this.handleGlobalKey = null;
}
FocusManager.KEYSET_DISABLED = 0;
FocusManager.KEYSET_ENABLED = 1;
FocusManager.KEYSET_ENHNAVIG = 2;
FocusManager.KEYSET_TEXTENTRY = 3;
FocusManager.KEYSET_PLAYBACK = 4;
FocusManager.prototype.setBaseKeyset = function (stage) {
	this.keysets[0] = stage;
	if (this.keysetslen === 1 && !this.hidden) {
		this.registerKeysInternal(stage);
	}
};
FocusManager.prototype.pushKeyset = function (stage) {
	this.keysets[this.keysetslen++] = stage;
	if (!this.hidden) {
		this.reconfigKeyset();
	}
};
FocusManager.prototype.popKeyset = function () {
	if (this.keysetslen > 1) {
		this.keysetslen--;
	}
	if (!this.hidden) {
		this.reconfigKeyset();
	}
};
FocusManager.prototype.setHidden = function (newhidden) {
	this.hidden = newhidden;
	this.reconfigKeyset();
};
FocusManager.prototype.reconfigKeyset = function () {
	this.registerKeysInternal(this.hidden ? this.keysethidden : this.keysets[this.keysetslen - 1]);
};
FocusManager.prototype.calculateKeyMaskInternal = function (stage) {

	var mask = 0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x100 + 0x400;
	return mask;
};
FocusManager.prototype.registerKeysInternal = function (stage) {
	this.currentKeyset = stage;
	var mask = this.calculateKeyMaskInternal(stage);
	try {
		var app = document.getElementById('appmgr').getOwnerApplication(document);
		app.privateData.keyset.setValue(mask);
	} catch (e) {}
	try {
		document.getElementById('oipfcfg').keyset.value = mask;
	} catch (e2) {}
};
FocusManager.prototype.getObject = function (idnam) {
	return this.allObjects[idnam];
};
FocusManager.prototype.focusObject = function (idnam) {

	if (this.currentFocus && this.currentFocus.idnam === idnam) {
		return;
	}
	var oldFocus = this.currentFocus;
	var newFocus = this.allObjects[idnam];
	if (1 && this.currentFocus) {
		debug(this.currentFocus.idnam +' '+ idnam);
	}

	if (oldFocus) {

		oldFocus.setFocused(newFocus, false);
	}

	oldFocus = this.currentFocus;
	this.currentFocus = newFocus || null;


	if (newFocus) {
		//moves('active/' + idnam);
		newFocus.setFocused(oldFocus, true);
	}

	if (this.onFocusChange) {
		try {
			this.onFocusChange();
		} catch (e) {}
	}
};
FocusManager.prototype.unregisterObject = function (obj) {
	var idnam = obj.idnam;
	if (this.currentFocus && this.currentFocus.idnam === idnam) {
		this.currentFocus.setFocused(false, false);
		this.currentFocus = null;
	}
	delete this.allObjects[idnam];
	delete this.focusableObjects[idnam];
};
FocusManager.prototype.findNewFocus = function (direction) {

	var currentx, currenty, currentw, currenth;
	var currentpx, currentpy;
	if (this.currentFocus) {
		this.currentFocus.updateBounds();
		currentx = this.currentFocus.xpos;
		currenty = this.currentFocus.ypos;
		currentw = this.currentFocus.width;
		currenth = this.currentFocus.height;
		currentpx = currentx + currentw - 1;
		currentpy = currenty + currenth - 1;
	} else {
		currentx = 0;
		currenty = 0;
		currentw = 1280;
		currenth = 0;
		currentpx = 1280;
		currentpy = 0;
	}
	var mindiffx = -currentw + 3;
	var mindiffy = -currenth + 3;
	var ret = null;
	var mindist = 10000000;
	var px, py, celem, dist;
	var currentFocusIdnam = this.currentFocus ? this.currentFocus.idnam : null;
	var idnam;
	for (idnam in this.focusableObjects) {
		if (idnam === currentFocusIdnam) {
			continue;
		}

		celem = this.focusableObjects[idnam];
		celem.updateBounds();
		px = celem.xpos + celem.width - 1;
		py = celem.ypos + celem.height - 1;
		switch (direction) {
			case 1:
				dist = this.calcFocusDist(currenty - py, mindiffy, currentx, currentpx, celem.xpos, px);
				break;
			case 2:
				dist = this.calcFocusDist(celem.ypos - currentpy, mindiffy, currentx, currentpx, celem.xpos, px);
				break;
			case 3:
				dist = this.calcFocusDist(currentx - px, mindiffx, currenty, currentpy, celem.ypos, py);
				break;
			default:
				dist = this.calcFocusDist(celem.xpos - currentpx, mindiffx, currenty, currentpy, celem.ypos, py);
				break;
		}
		if (mindist > dist) {
			ret = celem;
			mindist = dist;
		}
	}
	return ret;
};
FocusManager.prototype.calcFocusDist = function (walkDiff, minWalkDiff, myPos1, myPos2, otherPos1, otherPos2) {
	var isbad = false;
	if (walkDiff < minWalkDiff) {
		return 10000000;
	}
	if (walkDiff < 0) {
		walkDiff = -walkDiff * 2;
		isbad = true;
	}
	if ((myPos1 <= otherPos1 && myPos2 >= otherPos2) || (myPos1 >= otherPos1 && myPos2 <= otherPos2)) {
		return walkDiff;
	}
	var otherDiff = myPos1 + myPos2 - otherPos1 - otherPos2;
	if (otherDiff < 0) {
		otherDiff = -otherDiff;
	}
	if (!isbad && ((myPos1 < otherPos1 && otherPos1 < myPos2) || (myPos1 < otherPos2 && otherPos2 < myPos2))) {
		otherDiff /= 3;
	} else {
		otherDiff *= 2;
		walkDiff *= 3;
	}
	return otherDiff + walkDiff;
};
FocusManager.prototype.handleOkPress = function () {
	if (this.currentFocus) {
		this.currentFocus.handleKeyPress(VK_ENTER);
	}
};
FocusManager.prototype.handleFocusMove = function (direction) {
	var newFocus = this.findNewFocus(direction);
	if (newFocus) {
		this.focusObject(newFocus.idnam);
	}
};
FocusManager.prototype.handleKeyCode = function (keyCode) {
	if(GLOBALS.vplayer && GLOBALS.vplayer.isVisible() && GLOBALS.vplayer.isFullscreen() && !GLOBALS.vplayer.muted){
        if(!GLOBALS.vplayer.onExtraBtns && !GLOBALS.vplayer.onEpgList) GLOBALS.vplayer.navigate(keyCode);
        else if(!GLOBALS.vplayer.onEpgList) GLOBALS.vplayer.navigateBottom(keyCode);
        else GLOBALS.vplayer.navigateEpg(keyCode);
        return true;
    }
	if (this.currentFocus && this.currentFocus.handleKeyPress(keyCode)) {

		return true;
	}

	return false;

	/*
	    if (GLOBALS.ignoreKeyCodes.hasOwnProperty(keyCode)) {
	   
	        return false;
	    }
	if (this.hidden && !this.patchThruEventsIfHidden) {
	   
	        
	        if (this.handleGlobalKey && this.handleGlobalKey(keyCode)) {
	            return true;
	        }
	        return false;
	    }
	    if (this.currentFocus && this.currentFocus.handleKeyPress(keyCode)) {
	    
	        return true;
	    }
	    if (this.handleGlobalKey && this.handleGlobalKey(keyCode)) {
	       
	       
	     
	        return true;
	    }
	    if (this.patchThruEventsIfHidden && this.hidden) {
	     
	        return false;
	    }
	    if (keyCode === VK_LEFT || keyCode === VK_RIGHT || keyCode === VK_UP || keyCode === VK_DOWN || keyCode === VK_ENTER) {
	      
	        return true;
	    }
	   
	    return false;
	    */
};
FocusManager.prototype.numberKeyToInt = function (keyCode) {
	if (keyCode === VK_0) {
		return 0;
	}
	if (keyCode === VK_1) {
		return 1;
	}
	if (keyCode === VK_2) {
		return 2;
	}
	if (keyCode === VK_3) {
		return 3;
	}
	if (keyCode === VK_4) {
		return 4;
	}
	if (keyCode === VK_5) {
		return 5;
	}
	if (keyCode === VK_6) {
		return 6;
	}
	if (keyCode === VK_7) {
		return 7;
	}
	if (keyCode === VK_8) {
		return 8;
	}
	if (keyCode === VK_9) {
		return 9;
	}
	return -1;
};
FocusManager.prototype.charKeyToString = function (keyCode) {
	if (GLOBALS.samsungav) {
		return null;
	}
	if ((keyCode > 0x40 && keyCode < 0x5b) || keyCode === 0x20) {
		return String.fromCharCode(keyCode);
	}
	return null;
};

function HideManager(hideelemid, appelemid) {
	this.hidemsgtimer = null;
	this.hidemsgelem = hideelemid ? document.getElementById(hideelemid) : null;
	this.appscreenelem = appelemid ? document.getElementById(appelemid) : null;
	this.onchangelisteners = [];
	this.hidemsgtimeout = 7000;
}
HideManager.prototype.setHidden = function (hidden, hidemsgtimeout) {
	if (this.hidemsgtimer) {
		clearTimeout(this.hidemsgtimer);
		this.hidemsgtimer = null;
	}
	GLOBALS.focusmgr.setHidden(hidden);
	if (this.appscreenelem) {
		this.appscreenelem.style.visibility = hidden ? 'hidden' : 'inherit';
		if (!hidden) {
			this.appscreenelem.style.display = 'block';
		}
	}
	if (this.hidemsgelem) {
		this.hidemsgelem.style.display = hidden ? 'block' : 'none';
		if (hidden) {
			var me = this;
			var timout = hidemsgtimeout || this.hidemsgtimeout;
			this.hidemsgtimer = setTimeout(function () {
				me.hidemsgtimer = null;
				me.hidemsgelem.style.display = "none";
			}, timout);
		}
	}
	this.onchange(hidden);
};
HideManager.prototype.onchange = function (hidden) {
	/* if (hidden) {
	     GLOBALS.videohandler.setFullSize();
	 } else {
	     GLOBALS.videohandler.restoreSize();
	 }*/
	var i;
	for (i = 0; i < this.onchangelisteners.length; i++) {
		try {
			this.onchangelisteners[i](hidden);
		} catch (e) {}
	}
};

function BaseObject() {}
BaseObject.prototype.baseInit = function (elem) {
	if (elem || !this.elem) {
		this.elem = elem || document.getElementById(this.idnam);
	}
	this.focusable = false;
	this.requireUpdateBounds = true;
};
BaseObject.prototype.register = function () {
	//console.log("[register] , Register object ", this.idnam);
	//llog("[BaseObject.prototype.register] register object : "+ this.idnam);
	GLOBALS.focusmgr.allObjects[this.idnam] = this;
};
BaseObject.prototype.unregister = function () {
	this.focusable = false;
	GLOBALS.focusmgr.unregisterObject(this);
};
BaseObject.prototype.setFocusable = function (enabled) {
	this.focusable = enabled;
	if (enabled) {
		GLOBALS.focusmgr.focusableObjects[this.idnam] = this;
	} else {
		delete GLOBALS.focusmgr.focusableObjects[this.idnam];
	}
};
BaseObject.prototype.updateBounds = function () {
	if (!this.requireUpdateBounds) {
		return false;
	}
	this.requireUpdateBounds = false;
	var cobj = this.elem;
	this.width = cobj.offsetWidth;
	this.height = cobj.offsetHeight;
	var x, y;
	if (!this.width || !this.height) {
		this.xpos = parseInt(cobj.style.left, 10);
		this.ypos = parseInt(cobj.style.top, 10);
		this.width = parseInt(cobj.style.width, 10);
		this.height = parseInt(cobj.style.height, 10);
		if (isNaN(this.width) || isNaN(this.height)) {
			this.width = 0;
			this.height = 0;
			return true;
		}
		while (cobj.parentNode && cobj.parentNode !== document.body) {
			cobj = cobj.parentNode;
			x = parseInt(cobj.style.left, 10);
			y = parseInt(cobj.style.left, 10);
			if (isNaN(x) || isNaN(y)) {
				break;
			}
			this.xpos += x;
			this.xpos += y;
		}
		return true;
	}
	this.xpos = 0;
	this.ypos = 0;
	while (cobj.offsetParent) {
		this.xpos += cobj.offsetLeft;
		this.ypos += cobj.offsetTop;
		cobj = cobj.offsetParent;
	}
	return true;
};
BaseObject.prototype.setBounds = function (xpos, ypos, width, height) {
	this.elem.style.width = width + 'px';
	this.elem.style.height = height + 'px';
	this.setPosition(xpos, ypos);
};
BaseObject.prototype.setPosition = function (xpos, ypos) {
	this.elem.style.left = xpos + 'px';
	this.elem.style.top = ypos + 'px';
	this.requireUpdateBounds = true;
};
BaseObject.prototype.setDimension = function (width, height) {
	this.elem.style.width = width + 'px';
	this.elem.style.height = height + 'px';
	this.requireUpdateBounds = true;
};
BaseObject.prototype.setFocused = function (otherobj, focused) {};
BaseObject.prototype.requestFocus = function () {
	GLOBALS.focusmgr.focusObject(this.idnam);
};
BaseObject.prototype.handleKeyPressInternal = function (keyCode) {
	if (keyCode === VK_RED) {
		llog("[BaseObject.prototype.handleKeyPressInternal] VK_RED");
		this.onRed();
	}
	if (keyCode === VK_GREEN) {
		this.onGreen();

		return true;
	}
	if (keyCode === VK_YELLOW) {
		this.onYellow();
		return true;
	}
	if (keyCode === VK_BLUE) {
		this.onBlue();
		return true;
	}
	if (keyCode === VK_LEFT) {
		if (this.onleft) {
			this.onleft();
		} else {
			GLOBALS.focusmgr.handleFocusMove(3);
		}
		return true;
	}
	if (keyCode === VK_RIGHT) {
		if (this.onright) {
			this.onright();
		} else {
			GLOBALS.focusmgr.handleFocusMove(4);
		}
		return true;
	}
	if (keyCode === VK_UP) {
		if (this.onup) {
			this.onup();
		} else {
			GLOBALS.focusmgr.handleFocusMove(1);
		}
		return true;
	}
	if (keyCode === VK_DOWN) {
		if (this.ondown) {
			this.ondown();
		} else {
			GLOBALS.focusmgr.handleFocusMove(2);
		}
		return true;
	}
	if (keyCode === VK_ENTER) {
		if (this.onok) {
			this.onok();
		}
		return true;
	}
	if (keyCode === VK_BACK && this.onback) {

		this.onback();
		return true;
	}
	return false;
};

BaseObject.prototype.onRed = function () {
	if (dvbi) {
		window.setTimeout(function () {
			var url = 'http://hbbtv.anixe.net/channel.php?s=' + ON_Channel;
			window.location.href = url;
		}, 300);
	} else {
		var mgr = document.getElementById('appmgr');
		var app = mgr.getOwnerApplication(document);
		app.destroyApplication();
	}
	return true;

}

BaseObject.prototype.onGreen = function () {
	var streamUrl = (1 || getVersion() == '1.1.1' ? 'http://195.226.218.165/regio/CreteTV/mpeg.2ts' : 'http://195.226.218.165/regio/CreteTV/manifest.mpd'),
				item = {id:1, title: 'CreteTV Live HD', show: 'Live HD', title: 'Live HD', url: streamUrl, episode: '-'};
			GLOBALS.item = item;
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'LIVE', null, true);
	return true;

}

BaseObject.prototype.onYellow = function () {
	return true;

}

BaseObject.prototype.onBlue = function () {
	if(ENABLE_CONSENTFRAME){

		var consentFrame = new ConsentFrame("consentFrame");
		consentFrame.init(document.body,"","");
		return true;
	}else if (GLOBALS.dev){
		var deb = document.getElementById("debug");
		if (deb.style.display == 'block')
			deb.style.display = 'none';
		else
			deb.style.display = 'block';
		return true;

	}else this.onBlue2();
}
BaseObject.prototype.onBlue2 = function () {
	cleardebug();
	var res = document.getElementById('show-smid');
	if (res) {
		var bl = res.style.display;
		if (bl == 'none') {
			res.style.display = 'block';
			document.getElementById("speed-result").innerHTML = 'Μέτρηση ταχύτητας...';

			testDownload();
		} else
			res.style.display = 'none';
	} else {
		var e = createClassDiv("", "", "show-smid");
		e.id = 'show-smid';

		var sp = createClassDiv("", "", "speed");
		sp.id = 'speed-result';
		sp.innerHTML = 'Μέτρηση ταχύτητας...';

		e.innerHTML = 'SmartID: '+ GLOBALS.smid;
		e.appendChild(sp);
		var ag = createClassDiv("", "", "agent-res");
		ag.id = 'agent-result';
		ag.innerHTML = navigator.userAgent;
		e.appendChild(ag);

		if(document.getElementById("appscreen"))
			document.getElementById("appscreen").appendChild(e);

		testDownload();
	}

	function testDownload() {
		var start = 0, FILE_URL_SPEED_TEST = "testfile.m4v";
		var end = 0;
		start = new Date().getTime();
		var msg = null;

		var xhr = new XMLHttpRequest();
		xhr.open("GET", FILE_URL_SPEED_TEST + "?id=" + start, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					end = new Date().getTime();
					diff = (end - start) / 1000;

					msg = typeof xhr.response == "undefined" ? xhr.responseText : xhr.response;
					bytes = msg.length;

					speed = (bytes / diff) / 1024 / 1024 * 8;
					speed = Math.round(speed*100)/100;

					setDownloadResult(speed);
				} else {
					setDownloadResult(0);
				}
			}
		}
		xhr.send();
	};

	function setDownloadResult(speed) {
		var spdRes = document.getElementById('speed-result');
		if(spdRes){
			if (speed > 0) {
				spdRes.innerHTML = 'Η ταχύτητα download βρέθηκε να είναι <b>' + speed + ' Mbit/sec.</b><br/>Το λιγότερο που χρειάζεται είναι 5 Mbit/sec για HD περιεχόμενο, 8 Mbit/sec<br/>για Full-HD και 10 Mbit/sec για UHD περιεχόμενο.';

				sendSpeed(speed);
			}
			if (speed == 0) {
				spdRes.innerHTML = 'Σφάλμα στην μέτρηση download!';
			}
		}
	}
}
function sendSpeed(speed) {
	debug('send speed '+ speed);
	var xhr = new XMLHttpRequest(), o = {};
	o.speed = speed;
	o.url = 'speed';
	o.smid = GLOBALS.smid;
	o.ua = navigator.userAgent;
	var data = JSON.stringify(o), url = 'smidlog.php';

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200) {
				var j = JSON.parse(this.responseText);
				//debug('Got response :'+ JSON.stringify(j));
			} else {
				debug('status '+this.status);
			}
		}
	}
	xhr.send(data);
}
BaseObject.prototype.handleKeyPress = function (keyCode) {
	return this.handleKeyPressInternal(keyCode);
};

function initHbbTV(basekeyset) {


	try {
		if (navigator && navigator.appVersion && navigator.appVersion.indexOf("PHILIPS_OLS_") > 0) {
			GLOBALS.philipsbug = true;
			if (GLOBALS.keyevent === "") {
				GLOBALS.keyevent = "keypress";
			}
		}
	} catch (e) {}
	if (GLOBALS.keyevent === "") {
		GLOBALS.keyevent = "keydown";
	}
	GLOBALS.focusmgr = new FocusManager(basekeyset);
//	document.addEventListener(GLOBALS.keyevent, GLOBALS.keyeventlistener, false);

	//EVI - new video timer
	var ag = navigator.userAgent.toUpperCase();
	if (ag.indexOf("SHARP") < 0) {
		document.addEventListener("keyup", function (e) {
			var o = GLOBALS.focusmgr.getObject("videoplayer");
			var offset = 0;
			if(o)
				offset = o.rew ? -o.jumpInterval : o.jumpInterval;
			if (o && o.jumpTimer) {
				devmode2("[initHbbTV] Event Listener KEYUP clear jumptimer ");
				var vid = document.getElementById("video");
				if (vid) {
					if (GLOBALS.brtyp) {
						duration = Math.floor(vid.playTime / 1000);
						GLOBALS.posi = Math.floor(vid.playPosition / 1000);
					} else {
						duration = Math.floor(vid.duration);
						GLOBALS.posi = Math.floor(vid.currentTime);
					}

				}

				if (GLOBALS.posi > duration) GLOBALS.posi = duration;
				GLOBALS.offset = GLOBALS.offset + (1 * offset);
				o.videoSeek(parseInt(GLOBALS.offset));
				GLOBALS.offset = 0;
				clearInterval(o.jumpTimer);
				o.jumpTimer = null;
				o.bucketId = 0;
				o.rew = 0;
				o.addTimer = setInterval(function () {
					o.getTimeInfo()
				}, 1000);
			}
		}, false);
	} //not for vestel
	if (ag.indexOf("VESTEL") > 0 && ag.indexOf("LINUX") > 0) {
		document.addEventListener("keydown", function (e) {
			if (e.keyCode == KeyboardEvent.DOM_VK_BACK) {
				e.preventDefault();
				if (GLOBALS.focusmgr && GLOBALS.focusmgr.currentFocus)
					GLOBALS.focusmgr.currentFocus.handleKeyPress(VK_BACK);
			}
		});
	}
document.getElementById('tvbild').style.display = 'block';
document.getElementById('dbg').style.display = 'none';
	//if (ag.indexOf("HISENSE") > 0 || ag.indexOf("SHARP") > 0) { document.getElementById('appscreen').style.zIndex = 2; }
}

function closeHbbTV() {
	try {
		document.removeEventListener(GLOBALS.keyevent, GLOBALS.keyeventlistener, false);
	} catch (e) {}
	try {
		GLOBALS.videohandler.setFullSize();
		GLOBALS.videohandler.setBroadcast();
	} catch (e1) {}
	try {
		GLOBALS.focusmgr.allObjects = null;
		GLOBALS.focusmgr.focusableObjects = null;
	} catch (e2) {}
	GLOBALS.focusmgr = null;
	GLOBALS.videohandler = null;
	GLOBALS.keyeventlistener = null;
}

function showApplication() {
	if (GLOBALS.samsungav) {
		try {
			setTimeout(function () {
				window.curWidget.setPreference("ready", "true");
			}, 1);
		} catch (ignore) {}
	}
	try {
		var app = document.getElementById('appmgr').getOwnerApplication(document);
		app.show();
		app.activate();
		app.show();
	} catch (e) {}
}

function shortenText(txt, maxch) {
	if (txt.length < maxch) {
		return txt;
	}
	if (maxch < 5) {
		return '';
	}
	txt = txt.substring(0, maxch - 4);
	var i = txt.lastIndexOf(' ');
	if (i > 0) {
		txt = txt.substring(0, i + 1);
	} else {
		i = txt.lastIndexOf('&');
		if (i > 0 && i > txt.length - 8) {
			txt = txt.substring(0, i);
		}
	}
	i = txt.lastIndexOf('<');
	if (i > 0) {
		txt = txt.substring(0, i);
	}
	return txt + '...';
}

function wrapTextLines(txt, charsperline) {
	var lines = 1,
		i = 0,
		j, t;
	while (txt.length - i > charsperline) {
		t = txt.substring(i, Math.min(txt.length, i + charsperline));
		j = t.lastIndexOf(" ");
		if (j < 0) {
			j = i + charsperline - 1;
			txt = txt.substring(0, j) + "-<br />" + txt.substring(j);
			i = j + 7;
		} else {
			j += i;
			txt = txt.substring(0, j) + "<br />" + txt.substring(j + 1);
			i = j + 6;
		}
		lines++;
	}
	return [lines, txt];
}

function textHtmlEncode(txt, handleNl) {
	txt = toStr(txt).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	if (handleNl) {
		txt = txt.replace(/\n/g, "<br />");
	}
	return txt;
}

function createDiv(xpos, ypos, width, height, className) {
	var ret = document.createElement("div");
	//  ret.style.overflow = 'hidden ';
	ret.style.left = xpos + 'px';
	ret.style.top = ypos + 'px';
	if (width !== false) {
		ret.style.width = width + 'px';
	}
	if (height !== false) {
		ret.style.height = height + 'px';
	}
	if (className) {
		ret.className = className;
	}
	return ret;
}

function createClassDiv(xpos, ypos, className) {
	var ret = document.createElement('div');
	if (xpos !== false) {
		ret.style.left = xpos + 'px';
	}
	if (ypos !== false) {
		ret.style.top = ypos + 'px';
	}
	ret.className = className;
	return ret;
}

function selectDvbService(onid, tsid, sid) {
	if (GLOBALS.videohandler.url) {
		GLOBALS.videohandler.setBroadcast();
		setTimeout(function () {
			selectDvbService(onid, tsid, sid);
		}, 3000);
	}
	var vid = GLOBALS.videohandler.vid,
		ch = null,
		clist = null;
	try {
		clist = vid.getChannelConfig().channelList;
		ch = clist.getChannelByTriplet(onid, tsid, sid);
		if (ch && vid.setChannel) {
			vid.setChannel(ch, false);
			return true;
		}
	} catch (e) {}
	try {
		vid.setChannelByTriplet(onid, tsid, sid, true);
		return true;
	} catch (e2) {}
	return false;
}

function buildCssUrl(url, doescape) {
	if (!url) {
		return "";
	}
	if (doescape) {
		url = url.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\"/g, "%22").replace(/'/g, "%27");
	}
	return 'url("' + url + '")';
}

function toStr(o) {
	return "" + o;
}

function abortHttpRequest(req) {
	if (req) {
		try {
			req.abort();
		} catch (ignore) {}
	}
}

function createHttpRequest(url, callback, options) {
	var req = new XMLHttpRequest();
	//req.timeout = 500;
	if (callback) {
		req.onreadystatechange = function () {
			if (req.readyState !== 4) {
				return;
			}
			if (callback) {
				try {
					if (req.status >= 200 && req.status < 300) {
						callback(req.responseText);
					} else {
						callback(null);
					}
				} catch (e) {
					if (console && console.log) {
						console.log('Error while processing URL ' + url + ': ' + e + ' - Result was: ' + req.status + '/' + req.responseText);
						console.log(e);
					}
				}
			}
			req.onreadystatechange = null;
			req = null;
		};
	}
	if (GLOBALS.baseurl && url.indexOf(':/') < 1) {
		url = GLOBALS.baseurl + url;
	}
	try {
		req.open((options ? options.method : null) || 'GET', url, true);
		if (!options || !options.dosend) {
			req.send(null);
		} else {
			options.dosend(req);
		}
	} catch (e) {
		req.onreadystatechange = null;
		if (GLOBALS.demomode && console && console.log) {
			console.log(["Cannot open URL " + url, e]);
		}
		try {
			callback(null);
		} catch (e2) {}
		req = null;
	}
	return req;
}

function parseJSON(txt) {
	if (!txt) {
		return null;
	}
	var startpos = 0,
		endpos = txt.length - 1,
		fchar, lchar;
	while (startpos + 1 < endpos && txt.charCodeAt(startpos) < 33) {
		startpos++;
	}
	while (endpos - 1 > startpos && txt.charCodeAt(endpos) < 33) {
		endpos--;
	}
	fchar = txt.substring(startpos, startpos + 1);
	lchar = txt.substring(endpos, endpos + 1);
	if ((fchar === '[' && lchar === ']') || (fchar === '{' && lchar === '}')) {
		try {
			txt = txt.substring(startpos, endpos + 1);
			return eval('(' + txt + ')');
		} catch (e) {}
	}
	return null;
}


function TimeHelper() {
	this.timediffLocal = 0;
	this.timediffUTC = 0;
	this.progdaystart = 5.5;
	this.daynames = ["ÎšÎ¥Î¡Î™Î‘ÎšÎ—", "Î”Î•Î¥Î¤Î•Î¡Î‘", "Î¤Î¡Î™Î¤Î—", "Î¤Î•Î¤Î‘Î¡Î¤Î—", "Î Î•ÎœÎ Î¤Î—", "Î Î‘Î¡Î‘Î£ÎšÎ•Î¥Î—", "Î£Î‘Î’Î’Î‘Î¤ÎŸ"];
}
TimeHelper.prototype.init = function (onfinished) {
	return;
	var me = this;
	var now = new Date();
	var mytim = "d=" + now.getDate() + "&m=" + now.getMonth() + "&y=" + now.getFullYear() + "&h=" + now.getHours() + "&i=" + now.getMinutes() + "&s=" + now.getSeconds() + "&t=" + Math.floor(now.getTime() / 1000);

	createHttpRequest("timediff.php?" + mytim, function (txt) {
		var config = parseJSON(txt);

		if (config && config.length > 0) {
			config[0] = parseInt(config[0], 10);
			config[1] = parseInt(config[1], 10);
			if (!isNaN(config[0]) && !isNaN(config[1])) {
				me.timediffLocal = config[0] * 1000;
				me.timediffUTC = config[1] * 1000;
			}
		}
		if (onfinished) {
			onfinished();
		}
	});
};
TimeHelper.prototype.getNowDate = function () {
	if (this.timediffLocal === 0) {
		return new Date();
	}
	return new Date(new Date().getTime() + this.timediffLocal);
};
TimeHelper.prototype.getJSONDate = function (d) {
	return new Date(d * 1000 + this.getTimezoneDiff());
};
TimeHelper.prototype.getQueryTime = function (dat) {
	return Math.floor((dat.getTime() - this.getTimezoneDiff()) / 1000);
};
TimeHelper.prototype.getTimezoneDiff = function () {
	return Math.round((this.timediffLocal - this.timediffUTC) / 1800000) * 1800000;
};
TimeHelper.prototype.formatTime = function (tim) {
	var hrs = tim.getHours();
	if (hrs < 10) {
		hrs = "0" + hrs;
	}
	var mins = tim.getMinutes();
	if (mins < 10) {
		mins = "0" + mins;
	}
	return hrs + ":" + mins;
};
TimeHelper.prototype.formatDate = function (tim) {
	var day = tim.getDate();
	if (day < 10) {
		day = "0" + day;
	}
	var mon = tim.getMonth() + 1;
	if (mon < 10) {
		mon = "0" + mon;
	}
	return day + "." + mon + "." + tim.getFullYear();
};
TimeHelper.prototype.getMidnight = function (now) {
	var ret = now.getTime();
	var h = now.getHours() + now.getMinutes() / 60 - this.progdaystart;
	var m = now.getMinutes() - (this.progdaystart * 60) % 60;
	if (h < 0) {
		h += 24;
	}
	if (m < 0) {
		h++;
	}
	ret -= Math.floor(h) * 3600000;
	ret -= now.getSeconds() * 1000;
	ret -= m * 60000;
	ret -= ret % 1000;
	return ret;
};
TimeHelper.prototype.getDayName = function (midnight, d, shorttxt) {
	if (!d) {
		return "";
	}
	var diff = d.getTime() - midnight;
	var hrsdiff = diff / 3600000;
	d = new Date(d.getTime() - this.progdaystart * 3600000);
	var ret = this.daynames[d.getDay() % 7];
	if (shorttxt) {
		if (!IN_V2) ret = ret.substring(0, 2);
	}
	if (hrsdiff >= -24) {
		if (diff < 0) {
			ret = shorttxt ? "Î§Î˜Î•Î£" : "Î§Î˜Î•Î£";
		} else if (hrsdiff < 24) {
			ret = shorttxt ? "Î£Î—ÎœÎ•Î¡Î‘" : "Î£Î—ÎœÎ•Î¡Î‘";
		} else if (hrsdiff < 48) {
			ret = shorttxt ? "Î‘Î¥Î¡Î™ÎŸ" : "Î‘Î¥Î¡Î™ÎŸ";
		}
	}

	if (IN_V2) ret += "<br>";
	else ret += ", ";
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getYear() + 1900;
	return ret + (day < 10 ? " 0" : " ") + day + (month < 10 ? ".0" : ".") + month; //+ "."+year;
};

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}


var basicmenu = [{
		"image": "img/RED_B1.png",
		"text": "Έξοδος",
		"pageId": -1,
		"xpos": 120,
		"ypos": 10,
		"width": 98
	},
	{
		"image": "img/GREEN_B1.png",
		"text": "Live HD",
		"pageId": 1,
		"xpos": 234,
		"ypos": 10,
		"width": 125
	}/*,
	{
		"image": "img/YELLOW_B1.png",
		"text": "Movies",
		"pageId": -1,
		"xpos": 425,
		"ypos": 10,
		"width": 121
	},
	{
		"image": "img/BLUE_B1.png",
		"text": "Shows",
		"pageId": 0,
		"xpos": 561,
		"ypos": 10,
		"width": 90
	},*/
];


function BasicMenu(idnam) {
	this.idnam = idnam;
	this.newmenu = null;
}

BasicMenu.prototype = new BaseObject();
BasicMenu.prototype.init = function (parent, xpos, ypos, newmenu) {
	this.parent = parent;
	var e = createClassDiv(662, 644, "basic-menu-container");
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	this.focusedId = 0;

	if (newmenu) {
		this.newmenu = newmenu;
	}

	if (this.newmenu) basicmenu = this.newmenu;

	for (var i = 0; i < basicmenu.length; i++) {
		var inner = createClassDiv( /*basicmenu[i].xpos,basicmenu[i].ypos*/ "", "", "inner");
		inner.style.width = basicmenu[i].width + "px";
		var imgDiv = createClassDiv(0, 0, "imgDiv");
		var img = document.createElement("img");
		img.setAttribute("src", basicmenu[i].image);
		imgDiv.appendChild(img);
		var textDiv = createClassDiv(27, -3, "textDiv");
		var text = basicmenu[i].text;

		textDiv.innerHTML = "<span>" + text + "</span>";
		inner.appendChild(imgDiv);
		inner.appendChild(textDiv);
		this.elem.appendChild(inner);
		this.buttons[i] = inner;
	}


}
BasicMenu.prototype.destroy = function () {
	this.parent.removeChild(this.elem);
}
BasicMenu.prototype.setFocused = function (otherobj, focused) {
	for (i = 0; i < this.buttons.length; i++) {
		if (focused) {
			if (i == this.focusedId) this.buttons[i].addClass("focused");
			else this.buttons[i].removeClass("focused")
		} else this.buttons[i].removeClass("focused");
	}
}

BasicMenu.prototype.handleKeyPress = function (keyCode) {
	switch (keyCode) {
		case VK_RIGHT:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				GLOBALS.focusmgr.focusObject("mainmenu");
			}
			this.setFocused(this.idnam, true);
			break;
		case VK_LEFT:
			this.focusedId--;
			if (this.focusedId < 0) this.focusedId = 0;
			this.setFocused(this.idnam, true);
			break;
		case VK_UP:
			if (GLOBALS.pageId == 1) {
				GLOBALS.focusmgr.focusObject("epg3");
				break;
			}
			GLOBALS.scenemgr.obtainFocus();
			break;
		case VK_ENTER:
			if (this.focusedId == 3) {
				GLOBALS.focusmgr.focusObject("mainmenu");
				break;
			}
			GLOBALS.pageId = basicmenu[this.focusedId].pageId;
			GLOBALS.scenemgr.baseInit(GLOBALS.pageId);
			break;
		default:
			break;
	}
}


/**
 * Scene Manager is responsible to initialize each scene. <br>
 * A service like 24plus may have more than 1 scenes.<br>
 * All scenes are stored in a stack and previous scenes are retrieved from there.<br>
 * Each scene is identified by a pageId  <br>
 * RADIO page id : 3 <br>
 * EPG page id : 1 <br>
 * 24PLUS page id : 0 <br>
 * SUPER LEAGUE page id : 20 <br>
 * ON DEMAND page id : 2 <br>
 * WEATHER page id : 5 <br>
 * SEARCH page id : 7 <br>
 * ERTPLAY page id : 4 <br>
 * INFO page id : 6 <br>
 * ARCHIVE page id : 11 <br>
 * @constructor
 */
function SceneManager() {
	this.parent = document.getElementById("appscreen");
	this.container = createDiv(0, 0, 1280, /*632*/ 659, "scene-container");
	//this.bgColor = "rgb(60,63,168)";
	//this.bgColor= "rgb(113, 113, 113)";
	this.container.style.background = this.bgColor;
	this.parent.appendChild(this.container);
	this.sceneStack = [];
	this.sceneId = GLOBALS.pageId;
	this.focus = {
		url : null,
		la_url : null
	}
}
SceneManager.prototype.initVPlayerSession = function( title, url, titleHeader, subs, isLive, item) {
	debug("Init session vplayer");
	if(!GLOBALS.vplayer) GLOBALS.scenemgr.initVideoPlayer();

	GLOBALS.vplayer.currentItem = {
		"title" : title,
		"category" : titleHeader,
		"url" : url,
		"subs" : subs,
		"drm" : false,
		"la_url" : null,
		"thumb": (item ? item.thumb : null)
	};
	GLOBALS.scenemgr.focus.url = url;
	GLOBALS.scenemgr.focus.la_url = "";
	var me = this, live = isLive;

	if (url.indexOf('.2ts') > 0)
		live = true;
	GLOBALS.vplayer.live = live;
	GLOBALS.vplayer.todo = GLOBALS.vplayer.currentItem;
	GLOBALS.vplayer.ad = true;
	ENABLE_MIDDLE = 0;
	ENABLE_PREROLL = 0;

if(location.host == "127.0.0.1") {
	ENABLE_PREROLL = 0;
	ENABLE_MIDDLE = 0;
}
	GLOBALS.scenemgr.prepareVideoStart(GLOBALS.vplayer.currentItem);

	if(ENABLE_MIDDLE || ENABLE_PREROLL){
		var adBreaks = [{ "position" : "preroll", "ads" : 1 }];
		if (0) { // tests
			adBreaks.push( { "position" : (10), "ads" : 1 });
			adBreaks.push( { "position" : (70*60), "ads" : 1 });
			//adBreaks.push( { "position" : 60, "ads" : 1 });
		} else {
			var tim = 5, end = 60*60*3; // add midrolls per 10 mins for max 3 hours

			for(var i = 5; i < end; i+= 10) {

	adBreaks.push( { "position" : i*60, "ads" : 1 });
			}
		}
		GLOBALS.vplayer.setAdBreaks(adBreaks);
	}
	setTimeout(function() {
		if(profile.version == "oipf") {
			GLOBALS.vplayer.checkAds();
			if(!GLOBALS.vplayer.onAdBreak) GLOBALS.vplayer.startVideo(live, 0);
		}else{
			GLOBALS.vplayer.startVideo(live, 0);
		} 

	}, 800); // give some time for subtitles to load
}

SceneManager.prototype.initVideoPlayer = function (){
	debug("INITIALIZE VIDEO PLAYER", "green");
	debug(GLOBALS.useRef);
	if(!GLOBALS.useRef) return true;
	try{    
		if( profile.hbbtv == "1.5" || profile.hbbtv == "1.1"){
			debug("Load oipf videoplayer");
			try{
				GLOBALS.vplayer = new VideoPlayer("videodiv", profile, 1280, 720);
			}catch(e){
				debug(e.message);
			}
		}
		else if( profile.hbbtv == false ) {
			debug("Load EME videoplayer", "yellow");
			GLOBALS.vplayer = new VideoPlayerEME("videodiv", profile);
		}
		else {
			debug("Load HTML5 videoplayer", "yellow");
			GLOBALS.vplayer = new VideoPlayerHTML5("videodiv", profile);
		}

		if(GLOBALS.vplayer){
			debug("videoplayer was successfully initialized, element id: " + GLOBALS.vplayer.element_id);
			GLOBALS.vplayer.populate();
			GLOBALS.vplayer.clearVideo();
		}else{
			debug("videoplayer was not initialized");
		}
	} catch(e){
		debug("[initVideoPlayer] error "+ profile.hbbtv +" " + e.message + e.lineNumber + " vplayer " );
		debug( e.message );
	}   
	if(GLOBALS.vplayer){
		GLOBALS.vplayer.visible = true;
		GLOBALS.vplayer.setFullscreen(true);
	}

}

SceneManager.prototype.prepareVideoStart = function (item){
	if(!GLOBALS.vplayer){
		this.initVideoPlayer();
	}
	$('.thumbnail').attr("style", "none");
	var self = this;
	if(GLOBALS.vplayer.video == null){
		GLOBALS.vplayer.createPlayer();
	}
	GLOBALS.vplayer.currentItem = item;
	if (item && item.title=='Ad'){

		GLOBALS.vplayer.onAdBreak = true;
	}
			console.log(profile);
			console.log(item);
	if( profile.version == "mse-eme" ){
		if( self.focus.la_url ){
			GLOBALS.vplayer.setDRM( self.focus.drm, self.focus.la_url );
			GLOBALS.vplayer.sendLicenseRequest();
		} else{
			GLOBALS.vplayer.setDRM( false );
		}
		GLOBALS.vplayer.setSubtitles( item.subs );
		GLOBALS.vplayer.setURL( self.focus.url );

	} else{

		llog("[SceneManager.prototype.prepareVideoStart]");
		if( item.subs){
			llog("[prepareVideoStart] set Subtitles");
			llog(item.subs);
			GLOBALS.vplayer.setSubtitles(item.subs); 
		} else {
			$('#extra2').hide();
		}

		if(item && item.thumb ){
			GLOBALS.vplayer.timelinePreview = true;
			$(".thumbnail").css("background", "url('" + item.thumb + "') repeat scroll ");
			$(".thumbnail").css("backgroundSize", "auto auto");
		}

		GLOBALS.vplayer.setURL( item.url );

		if( self.focus.la_url ){
			GLOBALS.vplayer.setDRM( self.focus.drm, self.focus.la_url );
		}
		else{
			GLOBALS.vplayer.setDRM( false );
		}
	}
}

SceneManager.prototype.getCurrentScene = function () {
	return this.sceneStack[this.sceneStack.length - 1];
}

SceneManager.prototype.obtainFocus = function () {

	if (GLOBALS.pageId != 1 && !GLOBALS.focusmgr.getObject("epg-menu") && GLOBALS.focusmgr.getObject("episodes-list")) {
		GLOBALS.focusmgr.focusObject("episodes-list");
		return;
	} else if (GLOBALS.pageId != 1 && !GLOBALS.focusmgr.getObject("epg-menu") && GLOBALS.focusmgr.getObject("xenes-seires-list")) {
		GLOBALS.focusmgr.focusObject("xenes-seires-list");

		return;
	}

	if (GLOBALS.focusmgr.getObject("epg-menu")) {
		var o = GLOBALS.focusmgr.getObject("epg");
		GLOBALS.focusmgr.focusObject("epg-list-" + o.activeId);
		return true;
	}

	if (this.sceneStack.length > 0) {
		if (GLOBALS.pageId == 2) {
			GLOBALS.focusmgr.focusObject("video-categories");
			return;
		}
		if (GLOBALS.pageId == 15) {
			var o = GLOBALS.focusmgr.getObject("fifa-films");
			GLOBALS.focusmgr.focusObject("fifa-films-" + o.focusedId);
			//GLOBALS.focusmgr.focusObject("wc-channels-0");
			return;
		}

		if (GLOBALS.pageId == 27) {
			if (GLOBALS.focusmgr.getObject("formula1-videos")) {
				var o = GLOBALS.focusmgr.getObject("formula1-videos");

				GLOBALS.focusmgr.focusObject("formula1-" + o.focusedId);
				return;
			}
		}
		if (this.sceneStack[this.sceneStack.length - 1].obj.idnam == "24plus-horizontallists") {
			var obj = GLOBALS.focusmgr.getObject("24plus-horizontallists");

			if (obj) GLOBALS.focusmgr.focusObject("24plus-list" + obj.focusedId);
			else GLOBALS.focusmgr.focusObject("24plus-dayselector");
			return;
		}
		GLOBALS.focusmgr.focusObject(this.sceneStack[this.sceneStack.length - 1].obj.idnam);
	} else {
		if (GLOBALS.pageId == 1) GLOBALS.focusmgr.focusObject("nowbutton");
		if (GLOBALS.pageId == 15) {
			var o = GLOBALS.focusmgr.getObject("fifa-films");
			GLOBALS.focusmgr.focusObject("fifa-films-" + o.focusedId);
			//GLOBALS.focusmgr.focusObject("wc-channels-0");
			return;
		}

	}
}

SceneManager.prototype.clear = function () {
	if (GLOBALS.pageId != 4) this.emptyStack();
	/*	if(GLOBALS.focusmgr.getObject("videoplayer")){
			
			var obj = GLOBALS.focusmgr.getObject("videoplayer");
			obj.close();
		}*/
	this.container.style.display = "none";
	var dependencies = Array("super-league-all", "360-videos", "wc-buttons", "wc-channels", "fifa-films", "privacy-policy", "radio-categories", "fifa-films-categories", "video-categories", "nowbutton", "timebuttons", "daysel", "ruler", "channel-container", /*"epg0", "epg1", "epg2", "epg3",*/ "24plus-dayselector");
	for (i = 0; i < dependencies.length; i++) {
		var obj = GLOBALS.focusmgr.getObject(dependencies[i]);
		if (obj) {
			GLOBALS.focusmgr.unregisterObject(obj);
			if (obj.elem) this.parent.removeChild(obj.elem);
		}
	}
	var elems = document.getElementsByClassName("sepdiv");
	for (i = 0; i < elems.length; i++) {
		elems[i].style.display = "none";
	}
	if (document.getElementById("container-1")) document.getElementById("container-1").style.display = "none";
	if (document.getElementById("container-2")) document.getElementById("container-2").style.display = "none";
	if (document.getElementById("container-3")) document.getElementById("container-3").style.display = "none";
	if (document.getElementById("container-right")) document.getElementById("container-right").style.display = "none";
	document.getElementById("tvbild").innerHTML = '';
	if (GLOBALS.focusmgr.getObject("rss-ticker")) GLOBALS.focusmgr.getObject("rss-ticker").show();
	if (document.getElementById('mybroadcast')) {
		var dvb = document.getElementById('mybroadcast');

		try {
			dvb.stop();
		} catch (e) {}
		try {
			dvb.release();
		} catch (e) {}
		try {
			dvb.data = "";
			dvb.src = "";
			dvb.vtype = "";
		} catch (e) {}
	}

	document.getElementById("tvbild").removeClass("epg-v2");

	if (document.getElementById('myradio')) {
		var dvb = document.getElementById('myradio');

		try {
			dvb.stop();
		} catch (e) {}
		try {
			dvb.release();
		} catch (e) {}
		try {
			dvb.data = "";
			dvb.src = "";
			dvb.vtype = "";
		} catch (e) {}
	}
}

SceneManager.prototype.parseIPInfo = function (data) {
	var d = JSON.parse(data);
	if (d.country) {
		GLOBALS.user_country = d.country;
	} else GLOBALS.user_country = "GR";

	var j = 0;
	var applist_2 = [];
	if (GLOBALS.user_country != "GR" && location.host != "195.211.203.122") {
		for (var i = 0; i < applist.length; i++) {
			if (applist[i].name == "FORMULA1") continue;
			applist_2[j] = applist[i];
			j++;
		}
		applist = applist_2;
	}

	var j = 0;
	var videocategories_2 = [];
	if (GLOBALS.user_country != "GR") {
		for (var i = 0; i < videocategories.length; i++) {
			if (videocategories[i].name == "ÎžÎ•ÎÎ•Î£ Î£Î•Î™Î¡Î•Î£") continue;
			videocategories_2[j] = videocategories[i];
			j++;
		}
		videocategories = videocategories_2;
	}

	devmode2("[SceneManager.prototype.parseIPInfo] user_country: " + GLOBALS.user_country);
}


SceneManager.prototype.captureChannelChange = function () {

	try {
		var tvbild = document.getElementById("tvbild");
		tvbild.innerHTML = '<object id="mybroadcast"  type="video/broadcast"></object>';
		var dvb = document.getElementById('mybroadcast');
		if (dvb) {
			dvb.bindToCurrentChannel();
			// Get current triplet

			var ch = dvb.currentChannel;
			GLOBALS.sid = ch.sid;
			GLOBALS.tsid = ch.tsid;
			GLOBALS.onid = ch.onid;
		}
	} catch (e) {}


	var aktueller_sender = GLOBALS.channelId;
	try {
		dvb.onChannelChangeSucceeded = function () {
			if (dvb.currentChannel) {
				dvb.onChannelChangeSucceeded = null;
				dvb.onChannelChangeError = null;
				if (GLOBALS.sid != dvb.currentChannel.sid && GLOBALS.pageId != 1 && GLOBALS.pageId != 28) {
					//set new channel
					GLOBALS.channelId = getNewChannel(dvb.currentChannel.sid);
					restartApp();
				}
			}
		};
	} catch (e) {}
}

SceneManager.prototype.baseInit = function (pageid) {
	document.getElementById("appscreen").className = "";
	document.getElementById("appscreen").addClass("default");

	if (GLOBALS.focusmgr.getObject("rss-ticker")) {
		var obj = GLOBALS.focusmgr.getObject("rss-ticker");
		obj.elem.style.visibility = "visible";
	}
	this.clear();

	document.getElementById("tvbild").style.visibility = "hidden";
	var tvbild = document.getElementById("tvbild");
	if (GLOBALS.pageId == 24 || GLOBALS.pageId == 26) {
		tvbild.removeClass("tvbild");
		tvbild.addClass("athletics");
		document.getElementById("tvbild").style.visibility = "visible";
	} else if (GLOBALS.pageId == 1) {
		tvbild.className = "epg-v2";
	} else {
		tvbild.addClass("tvbild");
	}
	if (GLOBALS.focusmgr.getObject("basic-menu")) {
		var o = GLOBALS.focusmgr.getObject("basic-menu");
		o.destroy();
	}

	var sm = new SideMenu("side-menu");
	sm.init(this.parent, "", "");

	var rf = createClassDiv("", "", "rf-div");
	this.parent.appendChild(rf);

	this.parent.appendChild(createClassDiv(0, 636, "bottom-sepdiv"));

	if (GLOBALS.pageId == 1 && GLOBALS.videoplayer) this.disableMute();
	if (GLOBALS.pageId != 1 /*&& !GLOBALS.videoplayer*/ ) this.enableMute();
	document.getElementById("appscreen").className = "";
	document.getElementById("appscreen").removeClass("noindex");
	GLOBALS.pageId = pageid;
	this.container.style.display = 'block';
	this.captureChannelChange();
	var e = new Cretetv("cretetv");
	this.addScene(e);
	this.showCurrentScene("");

	if (action == 'livehd') {
		var blackBG = document.createElement("div");
		GLOBALS.blackBG = blackBG;
		blackBG.id = "blackBG";
		document.body.appendChild(blackBG);
		document.getElementById("appscreen").style.display = "none";
		document.getElementById("tvbild").addClass("hidden");
		setTimeout(function() {
			var streamUrl = (1 || getVersion() == '1.1.1' ? 'http://195.226.218.165/regio/CreteTV/mpeg.2ts' : 'http://195.226.218.165/regio/CreteTV/manifest.mpd'),
				item = {id:1, title: 'CreteTV Live HD', show: 'Live HD', title: 'Live HD', url: streamUrl, episode: '-'};
			GLOBALS.item = item;
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'LIVE', null, true);
		}, 500);
	} else if (action == 'liveevent') {
		setTimeout(function() {
			var streamUrl = 'http://195.226.218.165/creteTVevent/CreteEvent/mpeg.2ts',
				item = {id:1, title: 'Ημιμαραθώνιος Κρήτης Live', show: 'Ημιμαραθώνιος Κρήτης Live HD', title: 'Ημιμαραθώνιος Κρήτης Live HD', url: streamUrl, episode: '-'};
			GLOBALS.item = item;
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'LIVE', null, true);
		}, 500);
	}
	var e = new BasicMenu("basic-menu");
	e.init(this.parent, "", "");
}

SceneManager.prototype.playNosound = function (mode, audio, times, ended) {
	if (times <= 0) {
		return;
	}
	var played = 0;
	audio.addEventListener("ended", function () {

		played++;
		if (played < times) {
			audio.play(1);
		} else if (ended) {
			ended();
		}
		audio.play();
	});
	if (mode == "on") audio.play(1);
	else if (mode == "off") {
		audio.stop();
		audio.pause();
	}
}



/**
 * Enable mute. Stop DVB signal and starts a loop of no sound video
 */
SceneManager.prototype.enableMute = function () {
	return true;

}

/**
 * Disable Mute. Stops the no sound loop. Eg when we exit the HbbTV app.
 */
SceneManager.prototype.disableMute = function () {
	return true;

}

/**
 * Removes all scenes from the stack. Eg when we load a new service. 
 */
SceneManager.prototype.emptyStack = function () {
	for (var i = 0; i < this.sceneStack.length; i++) {
		var elem = this.sceneStack[i];
		if (elem) {
			elem.obj.unregister();
			this.container.removeChild(document.getElementById("scene" + elem.sceneId));
		}
	}
	this.sceneStack = [];
	this.sceneId = 0;
}

/**
 * Adds a new scene in the stack. 
 * @param obj it is the javascript object that instantiates the scene
 */
SceneManager.prototype.addScene = function (obj) {

	this.sceneStack.push({
		"obj": obj,
		"sceneId": this.sceneId
	});
	this.sceneId++;
}

/**
 * Shows the current scene and hides previous ones if they exist.
 * @param index This is the title of the scene appearing on the top left corner 
 * @param top Top position of the scene
 */
SceneManager.prototype.showCurrentScene = function (index, top) {
	var elem = this.sceneStack[this.sceneStack.length - 1];
	if (top) thistop = top;
	else thistop = 0;
	var currentScene = createDiv(0, thistop, 1280, 720, "app-scene");
	currentScene.id = "scene" + elem.sceneId;
	if (document.getElementById("appscreen").getElementsByClassName("index")[0]) {
		if (thistop == 76) document.getElementById("appscreen").getElementsByClassName("index")[0].innerHTML = index;
		else document.getElementById("appscreen").getElementsByClassName("index")[0].innerHTML = "";
	} else {
		var indexDiv = createClassDiv(66, 30, "index");
		indexDiv.innerHTML = index;
		document.getElementById("appscreen").appendChild(indexDiv);
	}
	elem.obj.init(currentScene);

	this.container.appendChild(currentScene);


	this.hidePreviousScenes();

	if(elem.obj.idnam != "epg" && !VIDEO_PREVIEW ) 
		startRF();
	if (elem.obj.idnam == "cretetv") {
		GLOBALS.focusmgr.focusObject("slideshow");
		return true;
	}
	if (elem.obj.idnam == "news" || elem.obj.idnam == "shows" || elem.obj.idnam == "series") {
		GLOBALS.focusmgr.focusObject(elem.obj.idnam + "-list-"+elem.obj.focusedId);
		return true;
	}
	if (elem.obj.idnam == "movies")
		GLOBALS.focusmgr.focusObject("movies-list-0");

	if (elem.obj.idnam == "cat-cont"){
		GLOBALS.focusmgr.focusObject(GLOBALS.focusmgr.getObject("cat-cont").cat+"-list-0");
		return true;
	}
	if (elem.obj.idnam == "show-detail") {
		GLOBALS.focusmgr.focusObject("show-detail");
		return true;
	}
	GLOBALS.focusmgr.focusObject(elem.obj.idnam);
}

SceneManager.prototype.removeLastScene = function () {
	for (var i = 1; i < this.sceneStack.length; i++) {
		var elem = this.sceneStack[i];
		if (elem) {
			elem.obj.unregister();
			this.container.removeChild(document.getElementById("scene" + elem.sceneId));
		}
	}
	this.sceneStack.length = 1;
	this.sceneId = 1;
}

SceneManager.prototype.showLastScene = function () {
	if (!VIDEO_PREVIEW) {
		startRF();
	}
	var elem = this.sceneStack[this.sceneStack.length - 1];
	llog("[SceneManager.prototype.showLastScene] elem : " + elem.obj.idnam);
	if (document.getElementById("scene" + elem.sceneId)) document.getElementById("scene" + elem.sceneId).style.display = 'block';
	if (GLOBALS.pageId == 0 && elem.obj.idnam == "24plus-horizontallists") {
		var obj = GLOBALS.focusmgr.getObject("24plus-horizontallists");
		llog("5. [SceneManager.prototype.showLastScene] new focus : 24plus-list" + obj.focusedId);
		GLOBALS.focusmgr.focusObject("24plus-list" + obj.focusedId);
		return;
	} else if ((GLOBALS.pageId == 2 || GLOBALS.pageId == 8 || GLOBALS.pageId == 22) && elem.obj.idnam == "video-grid") {

		var obj = GLOBALS.focusmgr.getObject("video-grid");
		if (obj) GLOBALS.focusmgr.focusObject("vertical-list-" + obj.focusedId, true);
		else llog("[SceneManager.prototype.showLastScene] No video grid found");
		return true;
	}	else if (GLOBALS.pageId == 7 && GLOBALS.focusmgr.getObject("search-results")) {
		GLOBALS.focusmgr.focusObject("search-results-list");
		return;
	} else if (GLOBALS.focusmgr.getObject("copa-america")) {
		var o = GLOBALS.focusmgr.getObject("copa-america");
		GLOBALS.focusmgr.focusObject("page-" + o.activeId);
		return;
	} else if (GLOBALS.focusmgr.getObject("search-results-list")) {
		GLOBALS.focusmgr.focusObject("search-results-list");
		return;
	} else if (GLOBALS.focusmgr.getObject("fifa-films")) {
		var o = GLOBALS.focusmgr.getObject("fifa-films");
		GLOBALS.focusmgr.focusObject("fifa-films-" + o.focusedId);
		return;
	} else if (GLOBALS.focusmgr.getObject("super-league-videos")) {
		var o = GLOBALS.focusmgr.getObject("super-league-videos");
		GLOBALS.focusmgr.focusObject("super-league-" + o.focusedId);
		return;
	} else if (GLOBALS.focusmgr.getObject("formula1-videos")) {
		var o = GLOBALS.focusmgr.getObject("formula1-videos");
		GLOBALS.focusmgr.focusObject("formula1-" + o.focusedId);
		return;
	} else if (GLOBALS.focusmgr.getObject("vod-horizontal")) {
		GLOBALS.focusmgr.focusObject("vod-horizontal");
		return;
	} else if (elem.obj.idnam == "cretetv") {
		var o = GLOBALS.focusmgr.getObject("list-cont");
		GLOBALS.focusmgr.focusObject("cat-list-" + o.focusedId);
		activeCont = elem.obj;
		return;
	}else if (elem.obj.idnam == "show-detail") {
		GLOBALS.focusmgr.focusObject("episodes-list-0");
		return;
	}else if (elem.obj.idnam == "cat-cont") {
		GLOBALS.focusmgr.focusObject(elem.obj.cat+"-list-"+elem.obj.focusedId);
		return;
	}

	llog("5. [SceneManager.prototype.showLastScene] new focus : " + elem.obj.idnam);
	if (elem.obj) GLOBALS.focusmgr.focusObject(elem.obj.idnam);
}

/**
 * Hides previous scenes. Sets display css property to none.
 */
SceneManager.prototype.hidePreviousScenes = function () {
	for (i = 0; i < this.sceneStack.length - 1; i++) {
		document.getElementById("scene" + i).style.display = 'none';
	}
}

function getAppId() {
	for (var i = 0; i < applist.length; i++) {
		if (applist[i].pageId == GLOBALS.pageId) return i;
	}
}

/**
 * Removes last scene and set focus on the the current object. 
 */
SceneManager.prototype.goBack = function () {
	document.getElementsByClassName("info-cont")[0].removeClass("movies");

	var elem = this.sceneStack[this.sceneStack.length - 1];
	if (this.sceneStack.length < 2) return;

	elem.obj.unregister();

	if(elem.obj.idnam == "epg"){
		var info = document.getElementsByClassName("info-cont")[document.getElementsByClassName("info-cont").length-1];
        info.style.display = "block";

	}
	this.container.removeChild(document.getElementById("scene" + elem.sceneId));
	this.sceneStack.length = this.sceneStack.length - 1;
	this.sceneId--;
	var elem = this.sceneStack[this.sceneStack.length - 1];
	document.getElementById("scene" + elem.sceneId).style.display = "block";



	if (elem.obj.idnam == "cretetv") {
		var o = GLOBALS.focusmgr.getObject("list-cont");
		var s = GLOBALS.focusmgr.getObject("side-menu");
		if(sideicons[s.focusedId].id == "programma") {
			/*var o2 = GLOBALS.focusmgr.getObject("cat-list-" + o.focusedId);
			o2.focusedId = 0;
			o2.animScrollerReset(true);*/
			o.focusedId = 0;
			o.scrollToFocused(o.focusedId);
		}
		//GLOBALS.focusmgr.focusObject("cat-list-" + o.focusedId, true);
		o.scrollToFocused(-1);
		activeCont = elem.obj;
		return true;
	}

	if (elem.obj.idnam == "epg") {
		GLOBALS.focusmgr.focusObject("epg-list");
		activeCont = elem.obj;
		stopRF();
		return true;
	}

	if (elem.obj.idnam == "show-detail") {
		GLOBALS.focusmgr.focusObject("episodes-list");
		activeCont = elem.obj;
		return true;
	}
	if (elem.obj.idnam == "news" || elem.obj.idnam == "shows" || elem.obj.idnam == "series") {
		GLOBALS.focusmgr.focusObject(elem.obj.idnam + "-list");
		return true;
	}
	if (elem.obj.idnam == "cat-cont"){
		var o = GLOBALS.focusmgr.getObject("cat-cont");
		GLOBALS.focusmgr.focusObject(o.cat+"-list-"+o.focusedId);
		return true;
	}
	GLOBALS.focusmgr.focusObject(elem.obj.idnam);
}

/**
 * Opens Video player. Creates the Video player instance and moves focus on the time bar on player buttons.
 */
SceneManager.prototype.openVideoPlayer = function (type) {

	if (GLOBALS.focusmgr.getObject("rss-ticker")) {
		var obj = GLOBALS.focusmgr.getObject("rss-ticker");
		obj.elem.style.visibility = "hidden";
	}

	if (GLOBALS.focusmgr.getObject("24plus-dayselector") && type != "mute") {
		var obj = GLOBALS.focusmgr.getObject("24plus-dayselector");
		obj.elem.style.visibility = "hidden";

	}

	if (GLOBALS.pageId != 28 && GLOBALS.pageId != 27 && GLOBALS.pageId != 33 && type != "mute") {
		for (var i = 0; i < this.sceneStack.length; i++) {
			if(document.getElementById("scene" + i))
				document.getElementById("scene" + i).style.display = 'none';

		}
	}


	if (!GLOBALS.videoplayer) {
		GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, type);
		GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
	}
	if (GLOBALS.pageId != 28 && GLOBALS.pageId != 27 && GLOBALS.pageId != 33 && type != "mute") {

		GLOBALS.focusmgr.focusObject("videoplayer");
	}
}

/**
 * Closes Video player and loads last scene. 
 */
SceneManager.prototype.closeVideoPlayer = function () {
	GLOBALS.videoplayer = null;
	if (GLOBALS.focusmgr.getObject("24plus-dayselector")) {

		var obj = GLOBALS.focusmgr.getObject("24plus-dayselector");
		//llog("4. [SceneManager.prototype.closeVideoPlayer] 24plus case");
		obj.elem.style.visibility = "visible";
	}

	if (GLOBALS.focusmgr.getObject("rss-ticker")) {
		var obj = GLOBALS.focusmgr.getObject("rss-ticker");
		obj.elem.style.visibility = "visible";

	}
	if (document.getElementById("scene" + (this.sceneStack.length - 1))) document.getElementById("scene" + (this.sceneStack.length - 1)).style.display = "block";
	llog("4. [SceneManager.prototype.closeVideoPlayer]");

	this.showLastScene();
	GLOBALS.scenemgr.enableMute();
}

SceneManager.prototype.setBackground = function (bgColor) {
	this.container.style.background = bgColor;
}
SceneManager.prototype.setRF = function () {
	if (GLOBALS.videoplayer) {
		GLOBALS.videoplayer.close();
		GLOBALS.videoplayer = null;
	}

	if (document.getElementById('video')) {
		var vid = document.getElementById('video');
		devmode("[VideoPlayer.prototype.close] vid stop");
		try {
			if(vid) vid.stop();
		} catch (e) {}
		try {
			if(vid) vid.pause();
		} catch (e) {}
		try {
			if(vid && vid.data) vid.data = '';
		} catch (e) {}
		try {
			if(vid && vid.src) vid.src = '';
		} catch (e) {}
	}

	devmode2("BR -------- 1")

	if (location.host != "127.0.0.1") {
		var tvbild = document.getElementById("tvbild");
		tvbild.innerHTML = '<object id="mybroadcast" type="video/broadcast" style="width:480px;height:270px;"></object>';

		tvbild.removeClass("tvbild");
		tvbild.addClass("rf-div");
		document.getElementById("tvbild").style.visibility = "visible";
		document.getElementById("tvbild").style.display = "block!important";
		var dvb = document.getElementById("mybroadcast");
		try {
			dvb.bindToCurrentChannel();
			dvb.stop();
			dvb.style.display = "none";		
		} catch (e) {}
	}

}



var playerBtns = [{
		"name": "back",
		"state": "enabled",
		"on": "img/buttons/control_back_hover2.png",
		"off": "img/buttons/control_back2.png"
	},
	{
		"name": "rewind",
		"state": "enabled",
		"on": "img/buttons/Control_3_HoverBtn.png",
		"off": "img/buttons/Control_3_Btn.png"
	},
	{
		"name": "play_pause",
		"state": "enabled",
		"onPause": "img/buttons/Control_1_HoverBtn.png",
		"offPause": "img/buttons/Control_1_Btn.png",
		"onPlay": "img/buttons/Control_Play_HoverBtn.png",
		"offPlay": "img/buttons/Control_Play_Btn.png"
	},
	{
		"name": "fast_forward",
		"state": "enabled",
		"on": "img/buttons/Control_4_HoverBtn.png",
		"off": "img/buttons/Control_4_Btn.png"
	},
];

function startRF() {

	var tvbild = document.getElementById("tvbild");
	
	tvbild.innerHTML = '<object id="mybroadcast"  type="video/broadcast"></object>';
	try {
		var dvb = document.getElementById("mybroadcast");
		dvb.style.width="480px";
		dvb.style.height="270px";
		if (GLOBALS.dev && ENABLE_SPONSOR) {
			dvb.style.width="420px";
			dvb.style.height="236px";
		}

		if(dvb) dvb.bindToCurrentChannel();
	} catch (e) {}
	var tvbild = document.getElementById("tvbild");
	tvbild.removeClass("tvbild");
	tvbild.addClass("rf-div");
	tvbild.addClass("bordered");
	document.getElementById("tvbild").style.visibility = "visible";
	document.getElementById("tvbild").style.display = "block!important";
	tvbild.style.display = "block";
	if (GLOBALS.dev && ENABLE_SPONSOR) {
		document.getElementById('appscreen').style.transform = 'scale(0.813)';
		document.getElementById('appscreen').style.top = '67px';
		tvbild.style.width = "420px!important";
		tvbild.style.height = "236px!important";
		tvbild.style.top = "178px!important";
		tvbild.style.right = "160px!important";
	}
}
function startRF2() {
	var tvbild = document.getElementById("tvbild");
	tvbild.style.display = "block";
	var dvb = document.getElementById("mybroadcast");
	try{
		dvb.style.width="480px";
		dvb.style.height="270px";
		dvb.bindToCurrentChannel();
	} catch (e) {}
}
function stopRF() {
	var tvbild = document.getElementById("tvbild");
	tvbild.style.display = "none";
}


function getNewChannel(sid) {
	for (var i = 0; i < chdb.length; i++) {
		if (chdb[i].sid == sid) return chdb[i].name;
	}
}

function loadScene(pageid) {

	var e, i, parent = document.getElementById("appscreen");
	parent.style.display = "none";
	GLOBALS.hidemgr.setHidden(false);
	GLOBALS.pageId = parseInt(pageid);
	if (!GLOBALS.scenemgr) GLOBALS.scenemgr = new SceneManager();
	GLOBALS.scenemgr.baseInit(GLOBALS.pageId);
}

function initApp() {


	if(GLOBALS.dev || location.host == "127.0.0.1"){
		ENABLE_CONSENTFRAME = 1;
	}

	if (mode == 'ref'){
		GLOBALS.useRef = true;
	}
	if(GLOBALS.useRef){
		// Monitor instance must be accessible in the application. 
		// If Monitor implementation is not included, empty interface does nothing but must be present
		if( typeof Monitor == "undefined" ){
			Monitor = new monitor( null );
		}
	}
	var pageid = 46;
	GLOBALS.smid = smid;
	if (0 || location.host == "127.0.0.1" || location.href.indexOf('DEV') > 0) {
		document.getElementById("ondev").style.display = "block";
		GLOBALS.dev = 1;
		GLOBALS.smid=1;
		VIDEO_PREVIEW=1;
		//document.getElementById("debug").style.display = "block";
	}
	if (mode == 'ref')
		GLOBALS.useRef = true;
	if (dev) {
		GLOBALS.dev = 1;
		//document.getElementById("debug").style.display = "block";
	}
	moves("Run_APP");
	/*var req = createHttpRequest('runapp.php', function (ret) {
		req = null;
	});*/
	try {
		var dvb = document.getElementById('mybroadcast');
		if (dvb) {
			dvb.bindToCurrentChannel();
			dvb.stop();
			debug("dvb stopped");
			dvb.style.display = "none";
		}
	} catch (e) {
		debug("error stopping broadcast");
	};
		document.getElementById("tvbild").style.visibility = "hidden";
	initHbbTV(FocusManager.KEYSET_ENABLED);
	GLOBALS.timediffLocal = GLOBALS.timediffUTC = 0;
	GLOBALS.hidemgr = new HideManager("hidemsg", "appscreen");


	try {
		var elm = document.getElementById('appmgr');
		var app = elm.getOwnerApplication(document);
		app.privateData.keyset.setValue(0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x100 + 0x400);
	} catch (e) {};

	GLOBALS.timehelper = new TimeHelper();
	GLOBALS.focusmgr.handleGlobalKey = function (keyCode) {
		if (keyCode === VK_RED && !GLOBALS.noclose) {
			if (!GLOBALS.allowbroadcast && !GLOBALS.focusmgr.hidden) {
				try {
					window.close();
				} catch (e) {}
			} else {
				initHbbTV(FocusManager.KEYSET_ENABLED);

			}
			return true;
		}
		if (GLOBALS.focusmgr.hidden) {
			return false;
		}
		if (keyCode === VK_BLUE && GLOBALS.allowbroadcast) {

			closeApp();
			return true;
		}
		if (keyCode === VK_BACK) {

			try {
				if (GLOBALS.destroyonback) {

					document.getElementById("appmgr").getOwnerApplication(document).destroyApplication();
					return true;
				}
				if (GLOBALS.closeonback) {

					window.close();
					return true;
				}
			} catch (ignore) {}
		}
		return false;
	};
	GLOBALS.timehelper.init(function () {
		var hiddenList = document.createElement("ul");
		hiddenList.id = "videoList";
		hiddenList.style.display = 'none';
		document.getElementById("appscreen").appendChild(hiddenList);
		document.getElementById("appscreen").appendChild(createClassDiv(0, 25, "top-sepdiv"));
		var indexDiv = createClassDiv(66, 30, "index");
		document.getElementById("appscreen").appendChild(indexDiv);
		if (!VIDEO_PREVIEW) {
		startRF();
		}
		showApplication();
	});

	document.getElementById("appscreen").style.display = "none";

	/*if (ENABLE_CONSENTFRAME) {
			// FOR TESTING - DELETE FOR PRODUCTION 
			//deleteCookie("cookie_consent_skai");
			if(getCookie("cookie_consent_skai") != ""){
				loadScene(pageid);
			}else {
				
				var consentFrame = new ConsentFrame("consentFrame");
				consentFrame.init(document.body,"","");
				//loadScene(pageid);

			}
		} else*/
			loadScene(pageid);
}

function loadPageAfterMuteIsEnabled() {
	GLOBALS.scenemgr.baseInit(GLOBALS.pageId);
}


function createColButton(parent, x, col, captiontxt) {
	if (!parent) {
		parent = document.getElementById("appscreen");
	}
	var e = createClassDiv(x, 654, "colbuttontxt");
	e.innerHTML = captiontxt;
	e.appendChild(createClassDiv(false, false, "colbutton" + col));
	parent.appendChild(e);
}

function restartApp() {

}

function closeApp() {
	var tvbild = document.getElementById("tvbild");
	tvbild.innerHTML = '<object id="mybroadcast"  type="video/broadcast"></object>';
	if (document.getElementById('mybroadcast')) {
		try {
			var dvb = document.getElementById('mybroadcast');
			dvb.bindToCurrentChannel();
		} catch (e) {}
	}

	return false;

}

function runApplication(appid, appurl, params) {
	closeApp();
	return;

}

function phpDebug(txt) {
	try {} catch (e) {}
}

function mydebug(txt) {
	var elem = document.getElementById("debug");
	if (elem) {
		elem.innerHTML = textHtmlEncode(txt, true);
	}
}
function sendSmid(me, state, error) {
	debug('send smid');
	var xhr = new XMLHttpRequest(), o = {};
	if(GLOBALS.useRef && GLOBALS.vplayer.profile.version=='oipf'){
		var item = GLOBALS.vplayer.currentItem;
		o.url = item.url;
		o.category = item.category;
		o.title = item.show;
		o.episode = item.title;
	} else {
		o.url = me.source;
		o.category = me.category;
		o.title = me.title;
		o.episode = me.episode;
	}
	o.smid = GLOBALS.smid;
	o.state = state;
	o.error = error;
	o.ua = navigator.userAgent;


	
	debug(JSON.stringify(o));


	if (state == STATE_PLAYING && GLOBALS.lastVidId)
		o.lastid = GLOBALS.lastVidId;
	return;
	var data = JSON.stringify(o), url = 'smidlog.php';
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200) {
				var j = JSON.parse(this.responseText);
				if (state == STATE_PLAYING && j['success']) {
					if (!GLOBALS.lastPlayId)
						GLOBALS.lastPlayId = j['id'];
					else
						GLOBALS.lastVidId = j['id'];
				}
				if (state != STATE_PLAYING) {
					GLOBALS.lastVidId = 0;
					GLOBALS.lastPlayId = 0;
				}
			} else {
				debug('status '+this.status);
			}
		}
	}
	xhr.send(data);
}
