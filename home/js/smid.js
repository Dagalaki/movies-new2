var dev = 0, unique_smart_id = 0, cookieBroken = 0;
function getChannelList() {
	var o={}, props={}, a=[], broadcast = document.getElementById("mybroadcast");
	try {
		broadcast.bindToCurrentChannel();
		var lst = broadcast.getChannelConfig().channelList;
		for (var i=0; i<lst.length; i++) {
			var ch = lst.item(i);
			a[i] = ch.name;
			//ret += ch.name;
		}
		props.ccid = broadcast.currentChannel.ccid;
		props.onid = broadcast.currentChannel.onid;
		props.sid = broadcast.currentChannel.sid;
		props.tsid = broadcast.currentChannel.tsid;
		//ret = JSON.stringify(a);
	} catch (e) {
		return;
	}
	o.clist = a;
	o.props = props;
	return o;
}
function setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
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
function are_cookies_enabled() {
	var cookieEnabled = (navigator.cookieEnabled) ? true : false;

	if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled)
	{ 
		document.cookie="testcookie";
		cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
	}
	if (cookieEnabled == true) {
		document.cookie="testcookie";
		cookieBroken = (document.cookie.indexOf("testcookie") == -1) ? true : false;
	}
	return (cookieEnabled);
}

function debugnew(unique, agent){

	var lcErr = cooErr = 0;
	var fromlc = fromcoo = lcinvalid= cooinvalid= 0;
	var lcSupported = cooEnabled = 0;


	if(window.localStorage){
		lcSupported = 1;
		var lc = localStorage.getItem("unique_smart_id");
		if(lc != null){
			fromlc=1;
			if (lc > 0){
				if(lc != unique) lcErr = 1;
			}else{
				lcinvalid = 1;
				lcErr = 1;

			}
		}
	}else lcSupported = 0;

	var cookieEnabled = (navigator.cookieEnabled) ? true : false;
	if(cookieEnabled){
		cooEnabled = 1;
		var coo = getCookie('unique_smart_id');

		if(coo && coo != ""){
			fromcoo = 1;
			if(coo > 0){
				if(coo != unique) cooErr = 1;
			}else{
				cooinvalid = 1;
				cooErr = 1;
			}
		}

	}else cooEnabled =0;
	var url = 'report.php?action=debug_new&unique='+ unique +'&agent=' + agent;
	url += '&cooErr='+ cooErr +'&lcErr='+ lcErr ;
	url += '&fromlc='+ fromlc +'&fromcoo='+ fromcoo +'&lcinvalid='+ lcinvalid +'&cooinvalid='+ cooinvalid ;
	url += '&lcSupported='+ lcSupported +'&cooEnabled='+ cooEnabled ;
	req = createHttpRequest(url, function(ret){
		llog("[debug new ret] "+ret);

	});
}

function supports_video() {
	return !!document.createElement('video').canPlayType;
}
function logUniqueAccess(){
	//console.log("logunique access");
	hbeatTimer = null;
	if (location.host == "127.0.0.1" || location.href.indexOf('DEV') > 0) {
		var el = document.getElementById('dbg');
		el.style.display = 'block';
		el.style.visibility = 'visible';
		el.style.textShadow = '2px 2px #06f';
		dev = 1;
	}
	var unique = 0, cookie_disabled = !(are_cookies_enabled()), medias = 0, cookie_en = (typeof navigator.cookieEnabled != 'undefined' ? navigator.cookieEnabled : -1), lss = 0, isNew = 0, html5=supports_video()?1:0;
	if ("MediaSource" in window)
		medias = 1;
	if(window.localStorage)
		lss = 1;
	if (cookie_en != -1)
		cookie_en = (cookie_en ? 1 : 0);
	var coo = getCookie("unique_smart_id"), d = new Date(), ts = Math.floor(d.getTime()/1000);
	var fromcoo = 0, fromlc = 0, lcinvalid =  0, cooinvalid =0, approxnew=0, lccoovalid = 0, checkcoo = false;

	if(window.localStorage){
		var lc = localStorage.getItem("unique_smart_id");
		if(lc != null){
			fromlc=1;
			if (lc > 0){
				unique = lc;
				debug("unique extracted from local storage: "+lc);
				if(coo && coo!="" && coo>0){
					lccoovalid = 1;
				}
			}else{
				lcinvalid = 1;
				checkcoo = true;
			}
		}else checkcoo = true;
	}else checkcoo = true;

	if(checkcoo){
		if(coo && coo != ""){
			fromcoo = 1;
			if(coo > 0){
				unique = coo;
				debug("unique extracted from cookie "+coo);
			}else{
				unique = 0;
				cooinvalid = 1;
			}
		}else{
			unique = 0;
			approxnew = 1;
		}
	}

	if(unique < 0 ) {
		unique = 0;
	}
	if (!unique)
		isNew = 1;

	//console.log(isNew);
	if (isNew) {
		window.setTimeout(function(){
			// check again
			var coo = getCookie("unique_smart_id");
			if(window.localStorage){
				lc = localStorage.getItem("unique_smart_id");
				if(lc != null){
					fromlc=1;
					if (lc > 0){
						unique = lc;
						debug("unique extracted from local storage: "+lc);
						if(coo && coo!="" && coo>0){
							lccoovalid = 1;
						}
					}else{
						lcinvalid = 1;
						checkcoo = true;
					}
				}else checkcoo = true;
			}else checkcoo = true;

			debug('new check unique = '+ unique);

			var url = "report.php?action=log_access&unique="+unique +'&client_ts='+ ts +'&cookie_en='+ cookie_en + '&lss='+lss+'&ms='+medias+'&h5='+html5;
			if (cookie_disabled)
				url += '&cookie_dis=1';
			if (cookieBroken)
				url += '&cookie_bro=1';
			url += "&fromcoo="+fromcoo+"&fromlc="+fromlc+"&lcinvalid="+lcinvalid+"&lccoovalid="+lccoovalid;
			url += "&approxnew="+approxnew;
			callUrl(url, unique, false);
		}, 1000);
	} else {
		var url = "report.php?action=log_access&unique="+unique +'&client_ts='+ ts +'&cookie_en='+ cookie_en + '&lss='+lss+'&ms='+medias+'&h5='+html5;
	//console.log("not new access");
		if (cookie_disabled)
			url += '&cookie_dis=1';
		if (cookieBroken)
			url += '&cookie_bro=1';
		url += "&fromcoo="+fromcoo+"&fromlc="+fromlc+"&lcinvalid="+lcinvalid+"&lccoovalid="+lccoovalid;
		url += "&approxnew="+approxnew;
		callUrl(url, unique, approxnew);
	}

}
function callUrl(url, unique, approxnew) {
	llog(url);
	var req = createHttpRequest(url, function(ret){
		req = null;
		llog("ret of http request: " + ret);
		if(ret){
			var d = JSON.parse(ret), cookErr = 1, lsErr = 1, agentid = d.agent;

			if(d.isnew === 1){
				llog("DEBUG NEW WILL BE INVOKED IN 1min");
				setTimeout(function() {
					debugnew(d.unique, d.agent);
				}, 60000 );

				debug("New smart ID");
				/*
				setTimeout(function() {
					debug("Retrieve channel list");
					var res = getChannelList();
					debug("Got channel list");
					if (res.clist) {
						var xhr = new XMLHttpRequest(), o = {};
						o.action = 'new_smart_id';
						o.unique = d.unique;
						o.agentid = agentid;
						o.clist = res.clist;
						o.props = res.props;

						xhr.open("POST", 'report.php');
						xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
						xhr.send(JSON.stringify(o));
					}
				}, 5000 );
				*/
			}

			if (d.unique) {
				unique_smart_id = d.unique;					

				//wsEstablish();
				//ioestablish();
			}
			if(window.localStorage) {
				if(d.unique && d.agent){
					localStorage.setItem("unique_smart_id", d.unique);
					localStorage.setItem("tv_agent", d.agent);

					var lc = localStorage.getItem("unique_smart_id");
					debug('---- LS '+ lc);
					if (lc != null && lc > 0)
						lsErr = 0;
				}else if(d.ce || d.ue || d.ae) {
					llog("["+d.ce+","+d.ue+","+d.ae+"]");
				}
			}
			if (d.unique) {
				setCookie('unique_smart_id', d.unique, 360);
				var coo = getCookie('unique_smart_id');

				debug('---- COO '+ coo);
				if (coo && coo > 0)
					cookErr = 0;
			}

			if (cookErr || lsErr) {
				var url = 'report.php?action=after_check&unique='+ unique +'&cookErr='+ cookErr +'&lsErr='+ lsErr +'&agentid='+ agentid;

				req = createHttpRequest(url, function(ret){
					req = null;
				});
			}
		}
	});
}

function llog(message){
	return true;
	if(location.href.indexOf('DEV') > 0) console.log(message);
}

function debug(s) {
        if (dev) {
		//console.log(s);return;
                var deb = document.getElementById("dbg");
		if (deb){
			var d=new Date(),t="";
			try{t=d.toLocaleDateString()+' '+d.toLocaleTimeString()+' ';}catch(e){}
			deb.style.display = 'block';
			deb.style.visibility = 'visible';
			deb.style.textShadow = '2px 2px #06f';
                	deb.innerHTML += t + s + '<br/>';
			//window.setTimeout(function(){document.getElementById("dbg").style.display='none';}, 50000);
		}
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
					if (0 && console && console.log) {
						console.log('Error while processing URL ' + url + ': ' + e + ' - Result was: ' + req.status + '/' + req.responseText);
						console.log(e);
					}
				}
			}
			req.onreadystatechange = null;
			req = null;
		};
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

		try {
			callback(null);
		} catch (e2) {}
		req = null;
	}
	return req;
}

