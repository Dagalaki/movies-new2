var duration;
var STATE_PLAYING = 1, STATE_STOP = 0, STATE_PAUSE = 2, STATE_CONNECTING = 3, STATE_BUFFERING = 4, STATE_FINISHED = 5, STATE_ERROR = 6;
var playerBtns = [/*{
		"name": "back",
		"state": "enabled",
		"on": "",//"img/buttons/control_back_hover2.png",
		"off": "", //"img/buttons/control_back2.png",
		"text": "Back"
	},*/ {
		"name": "rewind",
		"state": "enabled",
		"on": "img/buttons/Control_3_HoverBtn.png",
		"off": "img/buttons/Control_3_Btn.png",
		"text": "Rewind"
	}, {
		"name": "play_pause",
		"state": "enabled",
		"onPause": "img/buttons/Control_1_HoverBtn.png",
		"offPause": "img/buttons/Control_1_Btn.png",
		"onPlay": "img/buttons/Control_Play_HoverBtn.png",
		"offPlay": "img/buttons/Control_Play_Btn.png",
		"text": "Pause"
	}, {
		"name": "fast_forward",
		"state": "enabled",
		"on": "img/buttons/Control_4_HoverBtn.png",
		"off": "img/buttons/Control_4_Btn.png",
		"text": "Fast Forward"
	}];
/**
 * Represents the Video Player object. In HbbTV applications there can be only one video player object , thus one source loaded each time. When we interchange between videos we actually load a different source on the same video object. More than one videos at the same time cannot exist with the current standard. eg on Mosaic that it seems that 5 videos are playing simultaneously, actually it is one multiplexed video of 5 streams in one.<br/>
 * Inner variable "oncase" indicates the current open service, <br/>
 * 
 * The "oncase" variable defines different actions on the key events. <br/>
 * @contsructor
 * @class
 * @param idnam The name identifier for this object.
 * @param playerClass  
 * @param timerClass 
 * @param playerTop 
 * @param timerTop 
 * @param isPlaying Defines if video is instantiated on playong mode.
 * 
 */
function VideoPlayer(idnam, playerClass, timerClass, playerTop, timerTop, isPlaying) {
	this.idnam = idnam;
	this.focusedId = 1;
	this.isPlaying = isPlaying;
	this.vid = null;
	this.jumpInterval = 10 /*120*/ ;
	this.addTimer = false;
	this.hideTimer = false;
	this.duration = null;
	this.playerClass = playerClass;
	this.timerClass = timerClass;
	this.playerTop = playerTop;
	this.timerTop = timerTop;
	this.newPlayerTop = playerTop;
	this.newTimerTop = timerTop;
	this.source = null;
	this.parent = null;
	this.timer_cc = 0;
	this.firsttime = true;
	this.justStarted = true;
	this.isStopped = false;
	this.isStarted = false;
	this.timelineWidth = 794;
	this.buckets = null;
	this.bucketId = 0;
	this.syncTimer = null;
	this.fifademo = false;
	this.game = null;
	this.gametime = null;
	this.hasMultStreams = false;
	this.matchid = true;
	this.isFirstTime = true;
	this.ffFirst = true;
	this.hasSubtitles = false;
	this.subslist = null;
	this.runner = null;
	this.thumbContainer = null;
	this.thumbleft = 408;
	this.thumbleftStart = 408;
	this.runnerleft = 408;
	this.runnerleftStart = 408;
	this.barleft = 408;
	this.barleftStart = 408;
	this.bar = null;
	this.thumbslist = null;
	this.activeBucketId = 0;
	this.inTrickMode = false;
	this.jumpTimer = null;
	this.connCnts=0;
	this.ad = false;
	this.middleRollTime = 0;
	this.todo = '';
	this.rew = 0;
	this.lastState = 0;
}

VideoPlayer.prototype = new BaseObject();

VideoPlayer.prototype.setSubtitlesInfo = function (info) {
	this.subslist = info;
}

VideoPlayer.prototype.init = function (parent, xpos, ypos) {
	this.parent = parent;

	this.timerClass = (this.playerClass != "trailer") ? this.timerClass + " fullHD" : this.timerClass;

	document.getElementById("player-container").setAttribute("class", (this.playerClass != "trailer") ? this.playerClass + " fullHD" : this.playerClass);
	var videoTimer = document.createElement("div");
	videoTimer.className = this.timerClass;
	videoTimer.id = "basic-videotimer";
	var playerControl = createClassDiv(0, 4, "player_control");
	parent.appendChild(videoTimer);
	this.baseInit(videoTimer);
	this.register();
	this.buttons = [];



	this.elem.style.opacity = 1;

	var inner = createClassDiv("", "", "inner");

	if (this.playerClass != "trailer") {
		this.elem.style.display = "none";
	}

	if (this.playerClass != "trailer") {
		this.labelVid = createClassDiv(0, 0, "labelVid");
		document.getElementById("appscreen").appendChild(this.labelVid);
	}

	document.getElementById("player-container").style.top = this.playerTop + "px";
	document.getElementById("basic-videotimer").style.top = this.timerTop + "px";

	var img;
	var cnt = 0;
	for (var i = 0; i < playerBtns.length; i++) {
		
		img = document.createElement("img");
		if (!playerBtns[i]) continue;
		if (playerBtns[i].state == "disabled") continue;

		if (playerBtns[i].name == "subtitles") img.addClass("subsicon");

		if (playerBtns[i].name == "play_pause") {
			if (this.isPlaying) {
				img.setAttribute("src", playerBtns[i].onPause);
			} else {
				img.setAttribute("src", playerBtns[i].onPlay);
			}
		} else {
			img.setAttribute("src", playerBtns[i].off);
		}
		img.setAttribute("id", playerBtns[i].name);
		playerControl.appendChild(img);
		this.buttons[cnt] = img;
		cnt++;
	}

	inner.appendChild(playerControl);
	this.duration = createClassDiv(0, 0, "duration");
	this.runner = createClassDiv(202, 18, "runner");
	if (NEW_FEATURE) this.thumbContainer = createClassDiv(202, 18, "thumb-container");
	this.bar = createClassDiv(202, 2, "bar");
	var barimg = document.createElement("img");
	barimg.src = "img/timeline.png";
	this.bar.appendChild(barimg);
	var innerspan = document.createElement("span");
	this.runner.appendChild(innerspan);
	var timeline = createClassDiv( /*171*/ 202, 7, "basic-timeline");
	var time = createClassDiv(630, 4, "time");
	timeline.appendChild(this.duration);
	inner.appendChild(this.runner);
	if (NEW_FEATURE) this.elem.appendChild(this.thumbContainer);
	inner.appendChild(this.bar);
	this.title = createClassDiv(83, 59, "video-title");
	
	inner.appendChild(this.title);
	inner.appendChild(timeline);
	inner.appendChild(time);
	this.timer1 = createClassDiv("", "", "timer1");
	this.timer2 = createClassDiv("", "", "timer2");
	inner.appendChild(this.timer1);
	inner.appendChild(this.timer2);
	var outer = createClassDiv("", "", "outer");
	outer.appendChild(inner);
	this.elem.appendChild(outer);
	this.setFocused();

	this.elem.style.opacity = 1;
	this.elem.style.display = "block";
	this.setTimerBarsStyle(408, true);
	this.runner.style.top = "-4px";
	this.runner.style.left = "408px";
	this.bar.style.left = "408px";
	this.bar.style.top = "20px";

	if (NEW_FEATURE) {
		this.thumbContainer.style.top = "110px";
		this.thumbContainer.style.left = "408px";
	}

	this.elem.addClass("modplayer");
}

/**
 *  Creates the html elements for the structure of the video timer bar.
 *  Video timer bar consists of the player buttons which are enable subtitles, fullscreen, stop, start-pause, rewind, fast forward actions.
 *  @method 
 */
VideoPlayer.prototype.init2 = function (parent, xpos, ypos) {
	this.parent = parent;
	this.focusedId = 2;

	this.parent = parent;
	if (this.playerClass == "trailer") {
		this.jumpInterval = 10;
	}

	this.timerClass = (this.playerClass != "trailer") ? this.timerClass + " fullHD" : this.timerClass;
	document.getElementById("player-container").setAttribute("class", (this.playerClass != "trailer") ? this.playerClass + " fullHD" : this.playerClass);
	var videoTimer = document.createElement("div");
	videoTimer.className = this.timerClass;
	videoTimer.id = "basic-videotimer";
	var playerControl = createClassDiv(0, 4, "player_control");
	parent.appendChild(videoTimer);
	this.baseInit(videoTimer);
        this.register();
	this.buttons = [];
	this.lastFocus = 2;

	var inner = createClassDiv("", "", "inner");

	document.getElementById("player-container").style.top = this.playerTop + "px";
	document.getElementById("basic-videotimer").style.top = this.timerTop + "px";
	document.getElementById("basic-videotimer").className = "modplayer";

	var img;
	var cnt = 0;
	
	for (var i = 0; i < playerBtns.length; i++) {
		img = document.createElement("img");
		if (!playerBtns[i]) continue;
		if (playerBtns[i].state == "disabled") continue;

		if (playerBtns[i].name == "subtitles") img.addClass("subsicon");

		if (playerBtns[i].name == "play_pause") {
			if (this.isPlaying) {
				img.setAttribute("src", playerBtns[i].onPause);
			} else {
				img.setAttribute("src", playerBtns[i].onPlay);
			}
		} else {
			img.setAttribute("src", playerBtns[i].off);
		}
		img.setAttribute("id", playerBtns[i].name);
		playerControl.appendChild(img);
		playerControl.className ="modplayer" ;
		this.buttons[cnt] = img;
		cnt++;
	}
	
	inner.appendChild(playerControl);
	this.duration = createClassDiv(0, 0, "duration");
	this.runner = createClassDiv(202, 18, "runner");
	this.bar = createClassDiv(202, 2, "bar");
	var barimg = document.createElement("img");
	barimg.src = "img/timeline.png";
	this.bar.appendChild(barimg);
	var innerspan = document.createElement("span");
	this.runner.appendChild(innerspan);

	var timeline = createClassDiv( /*171*/ 202, 7, "basic-timeline");
	var time = createClassDiv(630, 4, "time");
	timeline.appendChild(this.duration);
	inner.appendChild(this.runner);
	inner.appendChild(this.bar);

	this.titleDiv = createClassDiv(83, 59, "video-title");
	inner.appendChild(this.titleDiv);
	inner.appendChild(timeline);
	inner.appendChild(time);
	this.timer1 = createClassDiv("", "", "timer1");
	this.timer2 = createClassDiv("", "", "timer2");
	inner.appendChild(this.timer1);
	inner.appendChild(this.timer2);
	var outer = createClassDiv("", "", "outer");
	outer.appendChild(inner);

	var playerBG = createClassDiv("","", "playerbgshade");
	this.elem.appendChild(playerBG);
	this.elem.appendChild(outer);

	this.setFocused();

	this.setTimerBarsStyle(408, true);
	this.runner.style.top = "-4px";
	this.runner.style.left = "408px";
	this.bar.style.left = "408px";
	this.bar.style.top = "20px";
}



VideoPlayer.prototype.setLabelVid = function (label) {
	this.labelVid.innerHTML = "<span>" + label + "</span>";
	this.titleDiv.innerHTML = label;
}

VideoPlayer.prototype.scroll = function (diff) {

	this.newPlayerTop = Math.round(this.newPlayerTop + diff);
	this.newTimerTop = Math.round(this.newTimerTop + diff);
	document.getElementById("player-container").style.top = this.newPlayerTop + "px";
	document.getElementById("basic-videotimer").style.top = this.newTimerTop + "px";
}

VideoPlayer.prototype.resetPos = function () {
	if (document.getElementById("player-container")) document.getElementById("player-container").style.top = this.playerTop + "px";
	if (document.getElementById("basic-videotimer")) document.getElementById("basic-videotimer").style.top = this.timerTop + "px";
	this.newPlayerTop = this.playerTop;
	this.newTimerTop = this.timerTop;
}

/**
 * Set the source of the video player object
 * @method
 */
VideoPlayer.prototype.setSource = function (source) {
	if (typeof source == 'string') {
		this.source = source;
		this.isFirstTime = false;
		return;
	}
	this.source = source.mp4;
	if(source.category){
		this.category = source.category;
		this.title = source.show;
		if (!source.show) {
			this.title = source.title
			this.episode = '';
		} else
			this.episode = source.title;
	}else{
		var splitPath = GLOBALS.lastMoves.split("/");
		if (GLOBALS.focusmgr.getObject("show-detail")) {
			this.category = GLOBALS.focusmgr.getObject("show-detail").category;
			this.title = splitPath[0];
			this.episode = splitPath[1];
		} else {
			this.category = splitPath[0];
			this.title = splitPath[1];
		}
	}

	this.isFirstTime = false;
	if (this.playerClass != "trailer") {
		//	document.getElementById("wait").style.display = "block";
	}
}
VideoPlayer.prototype.setType = function (type) {

	this.type = type;
}


VideoPlayer.prototype.createThumbsList = function (data) {
	try {
		var items = JSON.parse(data);
	} catch (e) {}


	this.thumbslist = items;

}

VideoPlayer.prototype.play = function () {
	document.getElementsByClassName('player_control')[0].style.display = 'block';
	document.getElementsByClassName('basic-timeline')[0].style.display = 'block';
	document.getElementsByClassName('timer1')[0].style.display = 'block';
	document.getElementsByClassName('timer2')[0].style.display = 'block';

	if (document.getElementById("player-container")) {
		document.getElementById("player-container").style.display = "block";
	}

	var vid = document.getElementById('video');
	var me = this;
	vid.style.visibility = 'visible';
	if (this.addTimer) clearInterval(this.addTimer);

	this.addTimer = setInterval(function () {
		me.getTimeInfo()
		duration = Math.floor(vid.playTime / 1000);
	}, 1000);

	this.isPlaying = true;
	if (vid && this.isPlaying) {
		try {
			vid.play(1);

			this.isPlaying = true;
			this.isStopped = false;

		} catch (e) {}
	}

	this.isStarted = true;
	var me = this;
	clearTimeout(this.hideTimer);
	this.hideTimer = false;
	window.setTimeout(function () {
		me.showBar()
	}, 2000);
}
VideoPlayer.prototype.preload = function (src, type) {
	var ad = document.createElement("video");
	ad.src = src;
	ad.type = 'application/dash+xml';
	ad.id = "video";
	ad.preload = "auto";
	ad.style.width = '1280px';
	ad.style.height = '720px';
	ad.style.visibility = 'hidden';
	ad.style.zIndex = 1;
	ad.addEventListener("timeupdate", function(e){
		if(ad.duration - ad.currentTime <= 0.5 || ad.currentTime / ad.duration > 0.97){
			//debug("ad ended - alternate");
			videoplayer.stop();
		}
	},false);
	document.getElementById("player-container").appendChild(ad);
	document.getElementById("player-container").style.display = "block";
}
/**
 * Creates the html video object to load the source. 
 * @method
 * @param type sets the type of the object (mp4, mpeg-dash, mpeg)
 * @mosaic boolean to indicate if the source is a mosaic or not 
 */


VideoPlayer.prototype.start = function (type, mosaic) {
	moves("videoplayer_started");
	debug('start video ' + this.source + " ("+ this.oncase +"), title: "+ (this.title?this.title.innerHTML:"noTitle"));
	var islive = this.source.indexOf('.2ts') > 0;
	if (islive)
		type = 'video/mpeg';
	this.islive = islive;
	this.connCnts=0;
	GLOBALS.lastVidId = 0;
	GLOBALS.lastPlayId = 0;

	if (this.elem) this.elem.style.opacity = 1;
	if (this.elem) this.elem.style.display = "block";
	if (!this.ad && (1 || ag.indexOf('SAMSUNG') > 0 || ag.indexOf('KD-55XE7096') > 0 || ag.indexOf('PANAS') > 0 || ag.indexOf('FIRETV') > 0 || ag.indexOf('SHARP') > 0)) {
		var srv=['195.226.218.10','195.226.218.160','195.226.218.163'];
		var server=srv[ Math.floor(Math.random() * 3) ];
		server="195.226.218.165";
		this.source = this.source.replace('cdn.smart-tv-data.com', server);
		this.source = this.source.replace('abr.smart-tv-data.com', server);
	}


	var me = this;
	this.newPlayerTop = this.playerTop;
	this.newTimerTop = this.timerTop;

if(document.getElementsByClassName('player_control')[0]){
	if (this.islive) {
		document.getElementsByClassName('player_control')[0].style.display = 'none';
		document.getElementsByClassName('basic-timeline')[0].style.display = 'none';
		document.getElementsByClassName('timer1')[0].style.display = 'none';
		document.getElementsByClassName('timer2')[0].style.display = 'none';
	} else {
		document.getElementsByClassName('player_control')[0].style.display = 'block';
		document.getElementsByClassName('basic-timeline')[0].style.display = 'block';
		document.getElementsByClassName('timer1')[0].style.display = 'block';
		document.getElementsByClassName('timer2')[0].style.display = 'block';
	}
}


	if(this.ad){
		document.getElementsByClassName('player_control')[0].style.display = "none";
	}

	var inner = '<video id="video" src="' + this.source + '" autoplay=""></video>';
	if (GLOBALS.brtyp) inner = '<object type="video/mp4"  id="video" data="' + this.source + '"></object>';
	if (type) inner = '<object type=' + type + '  id="video" data="' + this.source + '"></object>';

	if (type == "mpeg-dash") {

		if (GLOBALS.brtyp) inner = '<object  type="application/dash+xml"  id="video" data="' + this.source + '"></object>';
		else inner = '<video id="video" type="application/dash+xml" src="' + this.source + '" autoplay=""></video>';
	}

	if (type == "video/mpeg") {

		if (GLOBALS.brtyp) inner = '<object  type="video/mpeg"  id="video" data="' + this.source + '"></object>';
		else inner = '<video id="video" type="video/mpeg" src="' + this.source + '" autoplay=""></video>';


	}


	if (document.getElementById("player-container")) {
		debug("start video  open player container");
		document.getElementById("player-container").innerHTML = inner;
		document.getElementById("player-container").style.display = "block";

		if (type == "mpeg-dash") {

			document.getElementById("player-container").removeClass("fullHD");
			document.getElementById("player-container").addClass("bbstream");
			document.getElementById("player-bg-container").addClass("bbstream");
			document.getElementById("basic-videotimer").addClass("bbstream");
		}
	}


	//document.getElementById("player-bg-container").style.display = "none";

	if (document.getElementById('mybroadcast')) {
		var dvb = document.getElementById('mybroadcast');
		try {
			dvb.stop();
		} catch (e) {}
		try {
			dvb.release();
		} catch (e) {}
	}


	var vid = document.getElementById('video');
	vid.onPlayStateChange = null;
	vid.onPlayStateChange = function(st, err) {
		if (me.oncase != ON_VOD)
			return;
		var state = this.playState, error = (this.error ? this.error.code : 0);
		if (typeof state == 'undefined') {
			state = st;
			error = (err ? err.code : 0);
		}
		debug('new video state '+ state +' smid '+ GLOBALS.smid +(error ? ' error '+ error : ''));

		if (GLOBALS.smid && me.oncase == ON_VOD && state == STATE_CONNECTING) {
			me.connCnts++;

			debug('cnt '+ me.connCnts);
			if (me.connCnts == 5) {
				me.connCnts = 0;
				var start = 0, FILE_URL_SPEED_TEST = "testfile.m4v";
				var end = 0;
				start = new Date().getTime();
				var msg = null;

				debug('set download');
				var req = new XMLHttpRequest();
				req.open("GET", FILE_URL_SPEED_TEST + "?id=" + start, true);
				req.onreadystatechange = function() {
					if (req.readyState == 4) {
						if (req.status == 200) {
							end = new Date().getTime();
							diff = (end - start) / 1000;

							msg = typeof req.response == "undefined" ? req.responseText : req.response;
							bytes = msg.length;

							speed = (bytes / diff) / 1024 / 1024 * 8;
							speed = Math.round(speed*100)/100;

							sendSpeed(speed);
							if (speed < 5) {
								me.handleVKBack();
								if(typeof Lowspeed !== "undefined"){
									var u = new Lowspeed('low-speed', speed);
									GLOBALS.scenemgr.addScene(u);
									GLOBALS.scenemgr.showCurrentScene("");
								}
							}
						} else {
							debug('speed failed');
						}
					}
				}
				req.send();
			}
		}
		if (state == STATE_PLAYING)
			me.connCnts = 0;

		if (GLOBALS.smid && !me.ad) {
			sendSmid(me, state, error);
		}
		if (state == 4 && me.oncase == ON_VOD && !GLOBALS.lowQuality && !me.dash && me.lastState == 1) {
			// was playing and now is buffering
			debug('Setting low quality cookie');
			console.log('Setting low quality cookie');
			GLOBALS.lowQuality = 1;
			//setCookie('lowQuality', 1, 30);
		}

		me.lastState = state;
	};
	if (GLOBALS.smid && this.oncase == ON_VOD && !this.ad ) {
		debug('start smid timer');
		this.smidTimer = setInterval(function () {
			if (me.isPlaying) {
				var vid = document.getElementById('video');
				if(!vid) return;
				sendSmid(me, vid.playState, 0);
			} else {
				debug('clear smidTimer');
				clearInterval(this.smidTimer);
			}
		}, 30000);
	}
	if (this.addTimer) clearInterval(this.addTimer);

	this.addTimer = setInterval(function () {
		me.getTimeInfo()
		if(vid)
			duration = Math.floor(vid.playTime / 1000);
	}, 1000);


	if (vid && this.isPlaying) {

		try {
			vid.play(1);

			this.isPlaying = true;
			this.isStopped = false;

		} catch (e) {}
	}

	var me = this;

	this.isStarted = true;
	var me = this;
	clearTimeout(this.hideTimer);
	this.hideTimer = false;
	if (!this.ad) {
		window.setTimeout(function () {
				me.showBar()
		}, 2000);
	}
	if (GLOBALS.setVidPos) {
		window.setTimeout(function () {
			if (GLOBALS.brtyp) {
				debug("brtyp true "+ GLOBALS.setVidPos);
				GLOBALS.posi = GLOBALS.setVidPos;
				vid.seek(GLOBALS.posi*1000);
			} else {
				debug("brtyp false "+ GLOBALS.setVidPos);
				GLOBALS.posi = GLOBALS.setVidPos;
				vid.currentTime = GLOBALS.posi;
			}
			GLOBALS.setVidPos = 0;
		}, 200);
	}
	if (this.ad)
		document.getElementById("basic-videotimer").style.display = "none";
	if (ENABLE_MIDDLE && !this.ad && !GLOBALS.middleTimer) {
		this.middleTimer = setTimeout(function() {
			GLOBALS.videoplayer.todo = me.source;
			middlerollVideo(me.title);
		}, 5 * 60 * 1000);
	}
}
function sendSmid(me, state, error) {
	var xhr = new XMLHttpRequest(), o = {};
	o.url = me.source;
	o.category = me.category;
	o.title = me.title;
	o.episode = me.episode;
	o.smid = GLOBALS.smid;
	o.state = state;
	o.error = error;
	o.ua = navigator.userAgent;
	if (state == STATE_PLAYING && GLOBALS.lastVidId)
		o.lastid = GLOBALS.lastVidId;
	var data = JSON.stringify(o), url = 'smidlog.php';
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	//debug('send state '+ state +(error ? ' error '+ error : ''));
	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200) {
				var j = JSON.parse(this.responseText);
				//debug('Got response :'+ JSON.stringify(j));
				if (state == STATE_PLAYING && j['success']) {
					if (!GLOBALS.lastPlayId)
						GLOBALS.lastPlayId = j['id'];
					else
						GLOBALS.lastVidId = j['id'];
					//debug('set last video id '+ j['id']);
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
BaseObject.prototype.onBlue = function () {
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
	return true;
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

VideoPlayer.prototype.setMuted = function () {

	var ag = navigator.userAgent.toUpperCase();
	//if(ag.indexOf("LG") > 0 || ag.indexOf("LG") == 0 ) return true;

	this.elem.style.display = "none!important";
	document.getElementById("player-container").style.display = "none";
	document.getElementById("player-bg-container").style.display = "none";
	if (document.getElementById("basic-videotimer")) {
		document.getElementById("basic-videotimer").style.display = "none";
		document.getElementById("basic-videotimer").addClass("muted");
	}
	this.isPlaying = true;
	this.playPause();
}
VideoPlayer.prototype.unsetMuted = function () {
	this.elem.style.display = "block!important";
	document.getElementById("player-container").style.display = "block";
	document.getElementById("player-bg-container").style.display = "block";
	document.getElementById("basic-videotimer").style.display = "block";
	document.getElementById("basic-videotimer").removeClass("muted");
	this.isPlaying = false;
	this.playPause();
}
VideoPlayer.prototype.setTitle = function (title) {
	this.titleTxt = title;
	document.getElementsByClassName("video-title")[0].innerHTML = title;
	if( this.titleDiv) this.titleDiv.innerHTML = title;
}


VideoPlayer.prototype.setFocusedId = function (focusedid) {
	this.focusedId = focusedid;
}

VideoPlayer.prototype.getBtnImage = function (value, on) {

	var ret = "";
	for (var i = 0; i < playerBtns.length; i++) {
		
		if (!playerBtns[i]) continue;
		if (playerBtns[i].name == value) {
			if (on) {
				ret = playerBtns[i].on;
				break;
			} else {
				ret = playerBtns[i].off;
				break;
			}
		}
	}
	return ret;
}

VideoPlayer.prototype.setFocused = function (otherobj, focus) {

if (this.islive) {
		document.getElementsByClassName('player_control')[0].style.display = 'none';
		document.getElementsByClassName('basic-timeline')[0].style.display = 'none';
		document.getElementsByClassName('timer1')[0].style.display = 'none';
		document.getElementsByClassName('timer2')[0].style.display = 'none';
	} else {
		document.getElementsByClassName('player_control')[0].style.display = 'block';
		document.getElementsByClassName('basic-timeline')[0].style.display = 'block';
		document.getElementsByClassName('timer1')[0].style.display = 'block';
		document.getElementsByClassName('timer2')[0].style.display = 'block';
	}


	this.playPauseID = "1";
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (this.focusedId == i) {
				if (this.buttons[i].id == "play_pause") {
					if (this.isPlaying) this.buttons[i].setAttribute("src", playerBtns[this.playPauseID].onPause);
					else this.buttons[i].setAttribute("src", playerBtns[this.playPauseID].onPlay);
				} else this.buttons[i].setAttribute("src", /*playerBtns[i].on*/ this.getBtnImage(this.buttons[i].id, true));
			} else {
				if (this.buttons[i].id == "play_pause") {
					if (this.isPlaying) this.buttons[i].setAttribute("src", playerBtns[this.playPauseID].offPause);
					else this.buttons[i].setAttribute("src", playerBtns[this.playPauseID].offPlay);
				} else this.buttons[i].setAttribute("src", /*playerBtns[i].off*/ this.getBtnImage(this.buttons[i].id, false));
			}
		} else {
			if (this.buttons[i].id == "play_pause") {
				if (this.isPlaying) this.buttons[i].setAttribute("src", playerBtns[this.playPauseID].offPause);
				else this.buttons[i].setAttribute("src", playerBtns[this.playPauseID].offPlay);
			} else {
				this.buttons[i].setAttribute("src", /*playerBtns[i].off*/ this.getBtnImage(this.buttons[i].id, false));
			}
		}
	}
}
VideoPlayer.prototype.handleKeyPress = function (keyCode) {
	if (this.ad) return;
	if (keyCode === VK_RED) {
		this.showBar();
		this.onRed();
	}
	if (keyCode === VK_GREEN) {
		this.showBar();
		this.onGreen();
		return true;
	}
	if (keyCode === VK_YELLOW) {
		this.showBar();
		this.onYellow();
		return true;
	}
	if (keyCode === VK_BLUE) {
		this.showBar();

		if (this.elem.hasClass("fullHD")) this.onRed();
		else this.onBlue();
		return true;
	}



	switch (keyCode) {
		case VK_1:
			if (this.ad) {
				this.stop();
			} else {
				GLOBALS.videoplayer.todo = this.source;
				middlerollVideo();
			}
			break;
		case VK_PAUSE:
		case VK_PLAY:
			if (this.islive) break;
			this.showBar();
			this.focusedId = 1;
			this.playPause();
			this.setFocused(this.idnam, true);
			break;
		case VK_FAST_FWD:
		case VK_RIGHT:
			if (this.islive) break;
			this.showBar();
			this.focusedId = 2;
			this.fastForward();
			this.setFocused(this.idnam, true);
			break;
		case VK_REWIND:
		case VK_LEFT:
			if (this.islive) break;
			this.showBar();
			this.focusedId = 0;
			this.rewind();
			this.setFocused(this.idnam, true);
			break;
		/*case VK_RIGHT:
			if (this.islive) break;
			var basicTimer = document.getElementById("basic-videotimer");
			if(basicTimer && basicTimer.style.display == "none"){
				this.showBar();
				break;
			}
			this.showBar();
			
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
			this.setFocused(this.idnam, true);
			break;
		case VK_LEFT:
			if (this.islive) break;
			var basicTimer = document.getElementById("basic-videotimer");
			if(basicTimer && basicTimer.style.display == "none"){
				this.showBar();
				break;
			}
			this.showBar();
			
			this.handleVKLeft();

			break;
		
		case VK_DOWN:
			if (this.islive) {
				this.focusedId = 0;
				this.setFocused(this.idnam, true);
				break;
			}
			var basicTimer = document.getElementById("basic-videotimer");
			if(basicTimer && basicTimer.style.display == "none"){
				this.showBar();
				break;
			}
			this.showBar();
			this.handleVKDown();
			break;
		*/
		case VK_ENTER:
			var basicTimer = document.getElementById("basic-videotimer");
			if(basicTimer && basicTimer.style.display == "none"){
				this.showBar();
				break;
			}
			this.showBar();
			if (this.islive && this.focusedId != 0) {
				this.focusedId = 0;
				this.setFocused(this.idnam, true);
				break;
			}
			if (this.isStarted == false) {
				var vid = document.getElementById('video');
				if (!vid) this.start();
				this.isStarted = true;
			}
			this.playPause();
			this.focusedId = 1;
			this.setFocused(this.idnam, true);
			break;
			switch (this.buttons[this.focusedId].id) { //switch(this.focusedId){
				case "subtitles":
					this.openSubsMenu();
					break;
				case "fullscreen":
					this.fullScreen();
					break;
				case "play_pause":
					this.playPause();
					break;
				case "stop":
					this.stop();
					break;
				/*case "rewind":
					this.rewind();
					break;
				case "fast_forward":
					this.fastForward();
					break;
				case "back":
					this.handleVKBack();
					break;
				*/
			}
			break;
		case VK_DOWN:
		case VK_UP:
			this.showBar();
			/*this.focusedId = this.lastFocus;*/
			this.focusedId = 1;
			this.setFocused(this.idnam, true);
			break;
		case VK_BACK:

			this.handleVKBack();
			break;
		default:

			break;
	}
}
VideoPlayer.prototype.trickModePause = function () {
    var vid = document.getElementById('video');
    try {
        if (GLOBALS.brtyp) vid.play(0);
        else vid.pause();
    } catch (e) {}

    this.isPlaying = false;
}
VideoPlayer.prototype.trickModePlay = function () {

    var vid = document.getElementById('video');
    try {
        if (GLOBALS.brtyp) vid.play(1);
        else vid.play();
    } catch (e) {}
    this.isPlaying = true;
}
VideoPlayer.prototype.handleVKLeft = function () {
	this.focusedId--;
	if (this.focusedId < 0) this.focusedId = 0;
	this.setFocused(this.idnam, true);
}
VideoPlayer.prototype.handleVKBack = function () {
	if (document.getElementById("subs-container")) {
		document.getElementById("subs-container").innerHTML = "";
	}

	clearTimeout(this.hideTimer);
	clearTimeout(this.middleTimer);
	if (GLOBALS.middleTimer)
		clearInterval(GLOBALS.middleTimer);
	GLOBALS.middleTimer = null;
	this.close();
	GLOBALS.scenemgr.closeVideoPlayer();
	return true;
}

VideoPlayer.prototype.handleVKDown = function () {
	switch (this.oncase) {
		case ON_TABS:
			GLOBALS.focusmgr.focusObject("camera-tabs");
			break;
		default:
			this.lastFocus = this.focusedId;
			this.focusedId = 0;
			this.setFocused(this.idnam, true);
			break;
	}
}

VideoPlayer.prototype.close = function () {
	if (document.getElementById("player-bg-container")) document.getElementById("player-bg-container").style.display = "none";
	if (document.getElementById("player-container")) document.getElementById("player-container").style.display = "none";
	if (document.getElementById("subs-container")) document.getElementById("subs-container").style.display = "none";

	if (document.getElementById('video')) {
		var vid = document.getElementById('video');
		devmode("[VideoPlayer.prototype.close] vid stop");
		try {
			if(vid) vid.stop();
		} catch (e) {}
		//try {vid.release();}catch (e) {}
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
	if (this.addTimer) clearInterval(this.addTimer);
	if (this.smidTimer) {
		debug('clear smidTimer');
		clearInterval(this.smidTimer);
	}
	this.isPlaying = false;
	document.getElementById('player-container').innerHTML = '';
	document.getElementById('stop-img').innerHTML = '';
	this.unregister();
	try {
		if (this.elem) this.parent.removeChild(this.elem);
	} catch (e) {}
}

VideoPlayer.prototype.recalculateTimer = function () {
	var duration, posi, vid = document.getElementById("video");
	var obj = this.elem.getElementsByClassName('time')[0],
		bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];
	if (vid) {
		if (GLOBALS.brtyp) {
			duration = Math.floor(vid.playTime / 1000);
			GLOBALS.posi = Math.floor(vid.playPosition / 1000);
		} else {
			duration = Math.floor(vid.duration);
			GLOBALS.posi = Math.floor(vid.currentTime);
		}

	}

	if (vid) {
		if (obj && duration > 0 && GLOBALS.posi <= duration) {
			obj.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + ' <span id="lower">/ ' + this.toHHMMSS(duration) + '</span>';

			this.timer1.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset);
			this.timer2.innerHTML = this.toHHMMSS(duration - (GLOBALS.posi + GLOBALS.offset));

			this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + '</span>';
			this.runnerleft = this.runnerleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
			this.runner.style.left = this.runnerleft + 'px';
			this.duration.style.width = Math.floor(this.timelineWidth / duration * GLOBALS.posi + GLOBALS.offset) + 'px';
			this.barleft = this.barleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
			this.bar.style.left = this.barleft + 'px';

			GLOBALS.posi += 1;
			this.videoSeek(1);


		}
	}
}

VideoPlayer.prototype.setTimerBarsStyle = function (fromleft, isFullScreen) {
	this.barleftStart = fromleft;
	this.runnerleftStart = fromleft;


	if (isFullScreen) {
		this.runner.style.top = "-4px";
		//this.runner.style.left = "408px";
		//this.bar.style.left = "408px";
		this.bar.style.top = "20px";


	} else {
		this.runner.style.top = "18px";
		//this.runner.style.left = "202px";
		//this.bar.style.left = "202px";
		this.bar.style.top = "2px";
	}

}

VideoPlayer.prototype.fullScreen = function () {
	if (this.isStopped) {

		return true;
	}

	var obj = document.getElementById("player-container");
	var timer = document.getElementById("basic-videotimer");
	var subs = document.getElementById("subs-container");
	var bg = document.getElementById("player-bg-container");

	if (!obj.hasClass("fullHD")) {


		this.setTimerBarsStyle(408, true);

		obj.className = this.playerClass + " fullHD";
		timer.className = this.timerClass /*+ " bottom"*/ ;
		//if(subs) subs.className = "subs-container fullHD";
		if (subs) subs.className = "subs-container";
		this.elem.addClass("fullHD");
		if (document.getElementById("subs-container")) document.getElementById("subs-container").addClass("fullscreen");
		var me = this;
		this.showBar();
		//this.hideTimer = window.setTimeout(function (){me.setInvisible()}, 8000);
	} else {
		this.setTimerBarsStyle(202, false);
		obj.className = this.playerClass;
		if (this.timeClass) timer.className = this.timerClass;
		this.elem.removeClass("fullHD");

		this.resetPos();
	}
	this.recalculateTimer();
}


VideoPlayer.prototype.setPlayPause = function (play) {
	for (var i = 0; i < this.buttons.length; i++) {
		if(!this.buttons[i]) continue;
		if (this.buttons[i].hasClass("play_pause")) {
			this.focusedId = i;
			this.buttons[i].removeClass(play?"pause":"play");
			this.buttons[i].addClass(play?"play":"pause");
			this.buttons[i].children[1].children[0].innerHTML = play?"Play":"Pause";
			break;
		}
	}
	return;
}
VideoPlayer.prototype.releaseTrickMode = function () {
	var o = this;
	if (o && o.jumpTimer) {
		var vid = document.getElementById("video");
		if (vid) {
			if (GLOBALS.brtyp) {
				duration = Math.floor(vid.playTime / 1000);
			} else {
				duration = Math.floor(vid.duration);
			}

		}
		GLOBALS.posi += GLOBALS.offset;
		if (GLOBALS.posi > duration) GLOBALS.posi = duration;
		if (GLOBALS.posi < 0 ) GLOBALS.posi = 0;
		if (GLOBALS.brtyp)
			vid.seek(GLOBALS.posi * 1000);
		else
			vid.currentTime = GLOBALS.posi;

		GLOBALS.offset = 0;
		clearInterval(o.jumpTimer);
		o.jumpTimer = null;

		o.bucketId = 0;
		o.addTimer = setInterval(function () {
			o.getTimeInfo();
		}, 1000);
		o.trickModePlay();
	}
}

VideoPlayer.prototype.playPause = function () {
	if (this.inTrickMode) {
		this.releaseTrickMode();
		this.inTrickMode = false;
	}

	this.isStopped = false;
	var vid = document.getElementById('video');

	if (this.isPlaying) {
		this.setPlayPause(true);

		try {
			vid.play(0);
		} catch (e) {}
		try {
			vid.pause();
		} catch (e) {}
		this.isPlaying = false;
		this.isPaused = true;
	} else {
		//var src = 'img/buttons/Control_1_HoverBtn.png';
		this.setPlayPause(false);

		try {
			vid.play(1);
			this.isPlaying = true;
			this.isPaused = false;
		} catch (e) {}
	}

}

VideoPlayer.prototype.stop = function () {
	var vid = document.getElementById("video");
	if (this.ad) {
		this.ad = false;
		this.isPlaying = true;
		this.isStopped = false;
		this.firsttime = true;
		debug('stop video');
		try {
			vid.stop(0);
		} catch (e) {}
		try {
			vid.pause();
		} catch (e) {}

		this.setSource(this.todo);
		debug('set video URL');

		if (this.middleRollTime) {
			debug('time '+ GLOBALS.videoplayer.middleRollTime);
			GLOBALS.setVidPos = GLOBALS.videoplayer.middleRollTime;
			this.middleRollTime = 0;
			GLOBALS.middleRollDone = 1;
			if (!GLOBALS.middleTimer)
				GLOBALS.middleTimer = setInterval( function() { middlerollVideo(me.title); }, 10 * 60 * 1000);
		}
		debug('start video');
		this.start();
		GLOBALS.focusmgr.focusObject("videoplayer", true);
		return;
	}
	clearTimeout(this.middleTimer);
	if (GLOBALS.middleTimer)
		clearInterval(GLOBALS.middleTimer);
	GLOBALS.middleTimer = null;
	if (this.isStopped) {
		return;
	}

	try {
		vid.stop(0);
	} catch (e) {}
	try {
		vid.pause();
	} catch (e) {}

	this.isStopped = true;
	this.isPlaying = false;
	this.elem.style.display = "block";


	clearTimeout(this.hideTimer);
	this.hideTimer = false;
	this.focusedId = 1;
	this.setFocused();

	switch (this.oncase) {

		case ON_VOD:
			this.close();
			GLOBALS.scenemgr.closeVideoPlayer();
			break;

		default:
			break;
	}
}

VideoPlayer.prototype.updateCurrentThumbList = function () {
	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		x = Math.floor(vid.playPosition);
	} else {
		x = Math.floor(vid.currentTime);
	}

	var t = msToTime(x);

	for (var k = 0; k < this.thumbslist.length; k++) {
		if (t <= this.thumbslist[k].to && t >= this.thumbslist[k].from) {
			this.activeBucketId = k;
			break;
		}
	}

}

VideoPlayer.prototype.rewind = function () {
	//this.inTrickMode = true;
	this.rew = 1;
	var ag = navigator.userAgent.toUpperCase();

	clearInterval(this.addTimer);
	clearTimeout(this.hideTimer);
	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		duration = Math.floor(vid.playTime / 1000);
		GLOBALS.posi = Math.floor(vid.playPosition / 1000);
	} else {
		duration = Math.floor(vid.duration);
		GLOBALS.posi = Math.floor(vid.currentTime);
	}

	if (ag.indexOf("SHARP") < 0) {
		var me = this;
		if (!this.jumpTimer) {
			try {
				this.jumpTimer = setInterval(function () {
					me.enableTrickMode(-20, duration)
				}, 100);
			} catch (e) {
			}
		}
	} else {
		if (duration > this.jumpInterval && duration <= 180) this.jumpInterval = 60;
		if (duration <= 60) this.jumpInterval = 20;
		this.jumpInterval = 10;
		this.videoSeek(this.jumpInterval * (-1));
	}

	this.closeBar();
}
VideoPlayer.prototype.rewind22 = function () {
	this.startTrickMode(-1);
}
VideoPlayer.prototype.fastForward22 = function () {
	this.startTrickMode(1);
}
VideoPlayer.prototype.startTrickMode = function (offset) {

	var obj = this.elem.getElementsByClassName('time')[0],
		bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];

	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		duration = Math.floor(vid.playTime / 1000);
		GLOBALS.posi = Math.floor(vid.playPosition / 1000);
	} else {
		duration = Math.floor(vid.duration);
		GLOBALS.posi = Math.floor(vid.currentTime);
	}


	if (obj && duration > 0 && (GLOBALS.posi + GLOBALS.offset) <= duration) {
		var margin = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));

		if ((GLOBALS.posi + GLOBALS.offset) < 0) { //for rewind

			return;
		}

		obj.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + ' <span id="lower">/ ' + this.toHHMMSS(duration) + '</span>';
		this.timer1.innerHTML = this.toHHMMSS((GLOBALS.posi + GLOBALS.offset));
		this.timer2.innerHTML = this.toHHMMSS(Math.floor(duration - (GLOBALS.posi + GLOBALS.offset)));
		this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + '</span>';
		this.runnerleft = this.runnerleftStart + margin;
		this.duration.style.width = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset)) + "px";
		this.runner.style.left = this.runnerleft + 'px';

		this.barleft = this.barleftStart + margin;
		this.bar.style.left = this.barleft + 'px';

		GLOBALS.offset = GLOBALS.offset + (1 * offset);

		var me = this;
		GLOBALS.jumpTimer = setTimeout(function () {
			me.startTrickMode(-1)
		}, 100);

		if (GLOBALS.posi + GLOBALS.offset == duration) return;

	}
}

VideoPlayer.prototype.fastForward = function () {
	console.log('fastForward');
	//this.inTrickMode = true;
	var ag = navigator.userAgent.toUpperCase();
	this.rew = 0;

	clearInterval(this.addTimer);
	clearTimeout(this.hideTimer);

	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		duration = Math.floor(vid.playTime / 1000);
		GLOBALS.posi = Math.floor(vid.playPosition / 1000);
	} else {
		duration = Math.floor(vid.duration);
		GLOBALS.posi = Math.floor(vid.currentTime);
	}

	if (ag.indexOf("SHARP") < 0) {
		var me = this;
		if (!this.jumpTimer) {
				try {
					this.jumpTimer = setInterval(function () {
						me.enableTrickMode(20, duration)
					}, 100);

				} catch (e) {
				}
		}
	} else {

		if (duration > this.jumpInterval && duration <= 180) this.jumpInterval = 60;
		if (duration <= 60) this.jumpInterval = 20;
		this.jumpInterval = 10;
		this.videoSeek(this.jumpInterval);
	}
	this.closeBar();
}

VideoPlayer.prototype.jumpTo = function (ms) {
	ms = parseInt(ms);
	if (ms < 0) ms = 0;
	var vid = document.getElementById("video");
	try {
		vid.seek(ms);
	} catch (e) {}
}

VideoPlayer.prototype.videoSeek = function (offset) {

	try {
		var lang, posi, vid = document.getElementById("video");
		if (GLOBALS.brtyp) {
			lang = Math.floor(vid.playTime / 1000);
			posi = Math.floor(vid.playPosition / 1000);

		} else {
			lang = Math.floor(vid.duration);
			posi = Math.floor(vid.currentTime);

		}

		videopos = posi + offset;

		if (videopos < 0)
			videopos = 0;
		if (videopos > lang)
			videopos = 0;
		vid.seek(videopos * 1000);
	} catch (e) {
	}
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

VideoPlayer.prototype.virtualFF = function (offset, duration) {
	var obj = this.elem.getElementsByClassName('time')[0],
	bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];

	if (obj && duration > 0 && (GLOBALS.posi + GLOBALS.offset) <= duration) {
		var margin = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));

		if ((GLOBALS.posi + GLOBALS.offset) < 0) {

			return;
		}

		obj.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + ' <span id="lower">/ ' + this.toHHMMSS(duration) + '</span>';
		this.timer1.innerHTML = this.toHHMMSS((GLOBALS.posi + GLOBALS.offset));
		this.timer2.innerHTML = this.toHHMMSS(Math.floor(duration - (GLOBALS.posi + GLOBALS.offset)));
		this.duration.style.width = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset)) + "px";
		this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + '</span>';
		this.runnerleft = this.runnerleftStart + margin;

		this.runner.style.left = this.runnerleft + 'px';

		this.barleft = this.barleftStart + margin;
		this.bar.style.left = this.barleft + 'px';

		GLOBALS.offset = GLOBALS.offset + (1 * offset);
		console.log('offset '+GLOBALS.offset);

		if (GLOBALS.posi + GLOBALS.offset == duration) return;
	}
}

VideoPlayer.prototype.displayThumb = function (time) {
	var t = msToTime(time);
	if (t > this.thumbslist[this.activeBucketId].to) this.activeBucketId++;

}

VideoPlayer.prototype.syncthumb = function (time) {
	var t = msToTime(time);
	if (t > this.thumbslist[this.activeBucketId].to || t < this.thumbslist[this.activeBucketId].from) this.updateCurrentThumbList();
	var list = this.thumbslist[this.activeBucketId].list;
	for (k = 0; k < list.length; k++) {
		if (list[k].timecode == t) {
			this.thumbContainer.innerHTML = "<div><div><b>" + list[k].timecode + "</b></div><img src='" + list[k].imagePath + "' /></div>";
			break;
		}
	}
}

VideoPlayer.prototype.enableTrickMode = function (offset, duration) {
	console.log('enableTrickMode o '+ offset +' d '+ duration);
    this.virtualFF(offset, duration);
    return true;
}

VideoPlayer.prototype.getTimeInfo = function () {
	if (!this.isPlaying || this.inTrickMode)
		return;

	if (1) {
		var posi, x, lang,
			vid = document.getElementById("video"),
			obj = this.elem.getElementsByClassName('time')[0],
			bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];

		if(!vid) return;
		if (GLOBALS.brtyp) {
			lang = Math.floor(vid.playTime / 1000);
			posi = Math.floor(vid.playPosition / 1000);
			GLOBALS.posi = Math.floor(vid.playPosition / 1000);
			x = Math.floor(vid.playPosition);
		} else {
			lang = Math.floor(vid.duration);
			posi = Math.floor(vid.currentTime);
			GLOBALS.posi = Math.floor(vid.currentTime);
			x = Math.floor(vid.currentTime);
			if (!GLOBALS.middleRollDone && GLOBALS.posi == 10 && !this.ad) {
				debug('start middle roll');
				this.todo = this.source;
				middlerollVideo();
			}
		}

		if (vid.playState == 5) {
			this.stop();
			return;
		}
		if(vid.playState == 1 && GLOBALS.lastMoves){
			moves("Videos Played/"+GLOBALS.lastMoves);
			GLOBALS.lastMoves = null;
		}

		var bucketNotFound = true;
		if (obj && lang > 0) {
			obj.innerHTML = this.toHHMMSS(GLOBALS.posi) + ' <span id="lower">/ ' + this.toHHMMSS(lang) + '</span>';
			this.timer1.innerHTML = this.toHHMMSS(GLOBALS.posi);
			this.timer2.innerHTML = this.toHHMMSS(Math.floor(lang - GLOBALS.posi));

			this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi) + '</span>';
			this.runnerleft = this.runnerleftStart + Math.floor(this.timelineWidth / duration * GLOBALS.posi);
			this.runner.style.left = this.runnerleft + 'px';
			this.duration.style.width = Math.floor(this.timelineWidth / lang * GLOBALS.posi) + "px";
			this.barleft = this.barleftStart + Math.floor(this.timelineWidth / duration * GLOBALS.posi);
			this.bar.style.left = this.barleft + 'px';
		}
	} // if not mosaic

	this.showPlayState();
}

VideoPlayer.prototype.checkBBState = function () {
	var vid = document.getElementById("video");
}
VideoPlayer.prototype.showPlayState = function () {

	var vid = document.getElementById("video");
	var txt = "";
	if (GLOBALS.brtyp) {
		switch (vid.playState) {
			case 0:
				txt = "stopped";

				break;
			case 1:
				txt = "playing";


				document.getElementById("player-bg-container").style.display = "none";
				if (this.firsttime) {
					this.elem.style.display = "block";
					this.firsttime = false;
				}

				if (this.firsttime && !this.ad) {
					devmode2("STATUS PLAYING ");
					this.elem.style.display = "block";
					this.firsttime = false;
				}

				break;
			case 2:

				txt = "pause";
				break;
			case 3:
				txt = "connecting";
				if (this.isFirstTime) this.elem.style.display = "none";



				break;
			case 4:
				txt = "buffering";
				if (this.isFirstTime) this.elem.style.display = "none";

				break;
			case 5:
				txt = "finished";
				document.getElementById("player-bg-container").style.display = "none";
				if (!this.islive && this.oncase != ON_TABS && this.oncase != ON_MOSAIC && !this.ad) {
					document.getElementById("player-bg-container").style.display = "none";
				}

				break;

			case 6:
				txt = "error";
				break;
		}
	}
}

VideoPlayer.prototype.toHHMMSS = function (sec_num) {
	var sec_num = parseInt(sec_num, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = hours + ':' + minutes + ':' + seconds;
	return time;
}


VideoPlayer.prototype.closeBar = function () {
	clearTimeout(this.hideTimer);
	var me = this;
	this.hideTimer = setTimeout(function () {
		me.openBar = false;
		var obj = document.getElementById("basic-videotimer");
		if(obj && obj.style){
			obj.style.display = 'none';
			obj.style.opacity = 0;
		}
		me.focusedId = 2;
	}, 5000);
}
VideoPlayer.prototype.showBar = function () {
	if (this.ad) return;
	if (!this.isPlaying && !this.isPaused) return;
	if (this.hideTimer) {
		clearTimeout(this.hideTimer);
		this.hideTimer = false;
	}

	var ag = navigator.userAgent.toUpperCase();
	var me = this;
	if (ag.indexOf("SHARP") > 0) {
		if (this.addTimer) clearInterval(this.addTimer);
		this.addTimer = setInterval(function () {
			me.getTimeInfo()
		}, 1000);
	}
	var basicTimer = document.getElementById("basic-videotimer");
	if(basicTimer){
		basicTimer.style.display = 'block';
		basicTimer.style.opacity = 1;
	}

	this.timer_cc = 0;
	if (this.hideTimer) clearInterval(this.hideTimer);
		if(!this.hideTimer){
			this.hideTimer = window.setTimeout(function () {
			me.setInvisible()
		}, 6000);
	}
}

VideoPlayer.prototype.setInvisible = function () {
	if (this.hideTimer) {
		clearTimeout(this.hideTimer);
		this.hideTimer = false;
	}
	var obj = document.getElementById("player-container");
	if (!obj.hasClass("fullHD")) {
		return;
	}
	this.timer_cc++;
	var o, obj = document.getElementById("basic-videotimer");
	if (!obj) return;
	//this.focusedId = 2;
	this.setFocused(this.idnam, true);
	obj.style.display = 'block';
	o = parseFloat(obj.style.opacity);
	if (isNaN(o)) o = 1;
	//o-=0.1;
	//o=o.toFixed(1);
	//obj.style.opacity=o;
	//if(o<=0 || this.timer_cc>9){
	obj.style.display = 'none';
	//this.focusedId = 2;
	//this.setFocused(this.idnam)
	// this.timer_cc=0;
	// obj.style.opacity='0.7';
	// if(document.getElementsByClassName("subs-menu-container")[0]) document.getElementsByClassName("subs-menu-container")[0].style.visibility = "hidden";
	return;
	// }
	/*var me = this;
	this.hideTimer = window.setTimeout(function () {
		me.setInvisible()
	}, 5000);*/
}

