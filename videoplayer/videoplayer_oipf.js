/**
 * OIPF AV-Object videoplayer for HbbTV 1.5 devices
 * 
 * 
 *
 * @class VideoPlayer
 * @extends VideoPlayerBasic
 * @constructor
 */


function VideoPlayer(element_id, profile, width, height){
	debug("VideoPlayer - Constructor");
ENABLE_WATCHED =0;	
	// Call super class constructor
	VideoPlayerBasic.call(this, element_id, profile, width, height);
	this.timeInMilliseconds = true;
	debug("Initialized " + this.element_id);
}

VideoPlayer.prototype.createPlayer = function(){
	var self = this;

	if( !$("#player")[0] ){
		$("body").append( '<div id="player" class="hide">'
			+'<div id="playposition"></div>'
			+'<div id="playtime"></div>'
			+'<div id="progress_currentTime" style="left:130px"><img class="thumbnail"/></div>'
            +'<div id="progressbarbg"></div><div id="progressSeekable" style="transition03all"></div><div id="progressbar" style="transition03all"></div>'
			+'<div id="prew"></div>'
			+'<div id="ppauseplay" class="pause"><div class="vcrbtn"></div><span id="pauseplay"></span></div> '
			+'<div id="pff"></div>'
			+'<div id="extra-btns">'
			+'<div class="extra-btn" id="back-btn"><span>Back</span><div class="picon"></div></div>'
			// +'<div class="piconbg extra-btn" id="extra1"><div class="picon" id="extra-btn1"></div></div>'
			+'<div class="piconbg extra-btn" id="extra2"><div class="picon" id="extra-btn2"></div></div>'
			//+'<div class="piconbg extra-btn" id="extra3"><div class="picon" id="extra-btn3"></div></div>'
			// +'<div class="piconbg extra-btn" id="extra4"><div class="picon" id="extra-btn4"></div></div>'
			// +'<div class="piconbg extra-btn" id="extra5"><div class="picon" id="extra-btn5"></div></div>'
			+'</div>'
			+'<div id="subtitleButton"><div id="subtitleButtonText">Subtitles</div></div>'
			+'<div id="audioButton"><div id="audioButtonText">Audio</div></div>'
			+'<div id="playText"></div>'
			+'</div>');
		$('#videodiv').append('<div class="playerbg"><div class="playerinfo"></div></div>');
	}
	debug('profile: '+ JSON.stringify(profile));

	if( this.profile.hbbtv == "1.5" ){
		this.video = $("<object id='video2'></object>")[0];
		this.element.appendChild( this.video );
		return true;
	}else if (this.profile.hbbtv == "1.1"){
		if (GLOBALS.brtyp) this.video = $('<object type="video/mp4"  id="video2" ></object>')[0];
		else this.video = $('<video id="video2" ></video>')[0];
		this.element.appendChild( this.video );
		return true;
	}
	this.subtitles = [];
	this.buckets = [];
	this.subID = 0;
	this.bucketId = 0;
	this.subtitlesEnabled = false;
	this.midroll = false;
	this.adTimer = null;
	this.lastpos=0;
};
VideoPlayer.prototype.syncdata = function (ms, bucketId){
	if(!this.buckets[bucketId]){
		return;
	}
	var start = new Date().getTime(), t = msToTime(ms), list = this.buckets[bucketId].list;

	document.getElementById("subs-container").style.display = "block";
	document.getElementById("subs-container").innerHTML = "";
	document.getElementById("subs-container").style.visibility = "hidden";

	for(var k = GLOBALS.upperLimit ; k < list.length; k++){
		if(timeStringToSeconds(list[k].startTime) <= ms && timeStringToSeconds(list[k].stopTime) > ms){
			document.getElementById("subs-container").innerHTML = "<span>"+list[k].text+"</span>";
			document.getElementById("subs-container").style.visibility = "visible";
			GLOBALS.upperLimit = k;
			break;
		}else if(timeStringToSeconds(list[k].stopTime) < ms){
			document.getElementById("subs-container").innerHTML = "";
		}
		if(k == list.length-1) GLOBALS.upperLimit = 0;
	}
}

VideoPlayer.prototype.setURL = function(url){
	//url = "http://195.226.218.10/mega/f05b969f0b69c23b7250714fc905b4ce.mp4";
	//url = "https://refapp.hbbtv.org/videos/tears_of_steel_1080p_25f50g8sv5/manifest.mpd";
	if(GLOBALS.focusmgr.currentFocus) {
		GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
		GLOBALS.focusmgr.focusObject(null);
	}
	//url = url.replace("${GUID}", uuidv4());
	
	var type = "application/dash+xml", ag = navigator.userAgent.toUpperCase();
	if( url.match(/mp4$/) ){
		this.video.type = "video/mp4";
	} else if( url.match(/\.2ts$/) ){
		this.video.type = 'video/mpeg';
	} else{
		this.video.type = type;
	}
	try{
		this.url = url; // see sendLicenseRequest()
		if (!this.onAdBreak && (ag.indexOf('TCL') == -1 && ag.indexOf('PANAS') == -1 )) {
			var srv=['195.226.218.10','195.226.218.160','195.226.218.163'];
			var server=srv[ Math.floor(Math.random() * 3) ];
			this.url = this.url.replace('cdn.smart-tv-data.com', server);
			this.url = this.url.replace('abr.smart-tv-data.com', server);
		}
		debug("video source url : " + this.url, "yellow");
		
		this.video.data = this.url;
	} catch( e ){
		debug("[setURL]" +  e.message );
	}
	
	// create id for video url
	this.videoid = url.hashCode();

	return;
};

VideoPlayer.prototype.checkAds = function(){
	var self = this;
	if(self.onAdBreak) return;

	if( self.adBreaks ){
		var position=0;
		if(self.video) position =  Math.floor( self.video.playPosition/1000 );

		$.each( self.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == position ){
				debug('call midroll', 'yellow');
				if(typeof middlerollVideo === "undefined"){
					debug("middlerollVideo is undefined");
					return;
				}

				if (self.video && self.isPlaying()) {
					self.middleRollTime = adBreak.position; //self.video.playPosition;
					debug("video playPosition" +self.video.playPosition + " calculated middlerolltime : " + self.middleRollTime);
					try {
						self.stop();
						GLOBALS.vplayer.adBreak = true;
					} catch(e) {
						debug(e);
					}
				}
				self.todo = self.currentItem;
				self.onAdBreak = true;
				middlerollVideo(self.currentItem.title, self.currentItem.category, GLOBALS.epNum);
				adBreak.played = true;
			}else if (!adBreak.played && adBreak.position == "preroll"){
				debug('call preroll', 'yellow');
				if(typeof prerollVideo === "undefined") {
					debug("prerollVideo is undefined");
					return;
				}
				self.todo = self.currentItem;
				self.onAdBreak = true;
				prerollVideo(self.currentItem.title, self.currentItem.category, GLOBALS.epNum, self.currentItem.title == 'Στον Καναπέ');
				adBreak.played = true;
			}
		} );
	}
};

VideoPlayer.prototype.getAds = function( adBreak ){
       this.onAdBreak = true; // disable seeking
       this.adCount = 0;
       this.video.pause();
       var self = this;
       debug("get ads breaks=" + adBreak.ads + ", position="+adBreak.position );
       $.get( "../getAds.php?breaks=" + adBreak.ads + "&position="+adBreak.position, function(ads){
               self.adBuffer = ads;
               //self.adCount = ads.length;
               debug( "Got " + ads.length + " ads");
               self.prepareAdPlayers();
               self.playAds();
       }, "json" );
}

VideoPlayer.prototype.clearLicenseRequest = function(callback){
	debug("Clear DRM License, time: "+getYMDHMS(null));
	
	// if drm object exists set an empty acquisition
	this.oipfDrm = $("#oipfDrm")[0];	
	if( !this.oipfDrm ){
		if( callback ){
			callback("oipfDrm is null");
		}
		return;
	}
	
	var msgType="";
	var self = this;
	if(!this.drm || !this.drm.system) {
		callback();
		return;
	} else if(this.drm.system.indexOf("playready")==0) {
		msgType = "application/vnd.ms-playready.initiator+xml";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
		  '<LicenseServerUriOverride><LA_URL></LA_URL></LicenseServerUriOverride>' +
		'</PlayReadyInitiator>';
		var DRMSysID = "urn:dvb:casystemid:19219";		
	}	
	else if( this.drm.system == "marlin" ){
		msgType = "application/vnd.marlin.drm.actiontoken+xml";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL></URL></RightsIssuer></RightsURL></Marlin>';
		var DRMSysID = "urn:dvb:casystemid:19188";
	}
	else if(this.drm.system.indexOf("widevine")==0) {
		msgType = "application/widevine+xml";
		var DRMSysID = "urn:dvb:casystemid:19156";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
		'<ContentURL></ContentURL>' +
		'<DRMServerURL></DRMServerURL>' +
		'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
		'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
		'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
		'<UserData></UserData>' +
		'<Portal></Portal><StoreFront></StoreFront>' +
		'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
		'</WidevineCredentialsInfo>';
	}
	else if( this.drm.system == "clearkey" ){
		callback();
		return;
	}
		
	try {
		this.oipfDrm.onDRMMessageResult = callback;
	} catch (e) {
		debug("clearLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = callback;
	} catch (e) {
		debug("clearLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("clearLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId=-1;
		if(msgType!="")
			msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("clearLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("clearLicenseRequest Error 3: " + e.message );
		callback();
	}
	
};

VideoPlayer.prototype.sendLicenseRequest = function(callback){
	debug("Send DRM License, time: "+getYMDHMS(null));
	createOIPFDrmAgent(); // see common.js
	this.oipfDrm = $("#oipfDrm")[0];
	
	this.drm.successCallback = callback;
	var self = this;
	
	// persistent-license test needs a session GUID to track laurl invocation
	var laUrl = self.drm.la_url;
	if(laUrl.indexOf("${GUID}")>=0) {
		self.drm.la_url_guid = uuidv4();
		laUrl = laUrl.replace("${GUID}", self.drm.la_url_guid);
	} else {
		delete self.drm.la_url_guid;
	}
	
	if(this.drm.system.indexOf("playready")==0) {
		var msgType = "application/vnd.ms-playready.initiator+xml";
		var DRMSysID = "urn:dvb:casystemid:19219";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
		  '<LicenseServerUriOverride>' +
			'<LA_URL>' +
				laUrl +
			'</LA_URL>' +
		  '</LicenseServerUriOverride>' +
		'</PlayReadyInitiator>';		
	} else if( this.drm.system == "marlin" ){
		var msgType = "application/vnd.marlin.drm.actiontoken+xml";
		var DRMSysID = "urn:dvb:casystemid:19188";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL>'+ laUrl +'</URL></RightsIssuer></RightsURL></Marlin>';
	} else if(this.drm.system.indexOf("widevine")==0) {
		var msgType = "application/widevine+xml"; // "application/smarttv-alliance.widevine+xml"
		var DRMSysID = "urn:dvb:casystemid:19156";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
		'<ContentURL>' + XMLEscape(this.url) +'</ContentURL>' +
		'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
		'<DRMServerURL>' + XMLEscape(laUrl) + '</DRMServerURL>' +
		'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
		'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
		'<UserData></UserData>' +
		'<Portal></Portal><StoreFront></StoreFront>' +
		'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
		'</WidevineCredentialsInfo>';
	}
	
	try {
		this.oipfDrm.onDRMMessageResult = drmMsgHandler;
	} catch (e) {
		debug("sendLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = drmRightsErrorHandler;
	} catch (e) {
		debug("sendLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("sendLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("sendLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("sendLicenseRequest Error 3: " + e.message);
		setTimeout( function(){
			self.clearVideo();
			showInfo(e.message);
		}, 1000);		
	}
	
	function drmMsgHandler(msgID, resultMsg, resultCode) {
		debug("drmMsgHandler drmMsgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		showInfo("msgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		var errorMessage = "";
		switch (resultCode) {
			case 0:
				self.drm.ready = true;
				//debug("call self.drm.successCallback()");
				self.drm.successCallback();
			break;
			case 1:
				errorMessage = ("DRM: Unspecified error");
			break;
			case 2:
				errorMessage = ("DRM: Cannot process request");
			break;
			case 3:
				errorMessage = ("DRM: Wrong format");
			break;
			case 4:
				errorMessage = ("DRM: User Consent Needed");
			break;
			case 5:
				errorMessage = ("DRM: Unknown DRM system");
			break;
		}
		
		if( resultCode > 0 ){
			showInfo("" + resultCode + " " + errorMessage );
			Monitor.drmError(errorMessage);
		}
	}

	function drmRightsErrorHandler(resultCode, id, systemid, issuer) {
		var errorMessage = "";
		switch (resultCode) {
			case 0:
				errorMessage = ("DRM: No license error");
			break;
			case 1:
				errorMessage = ("DRM: Invalid license error");
			break;
			case 2:
				errorMessage = ("license valid");
			break;
		}
		showInfo( errorMessage );
		Monitor.drmError(errorMessage);
	}

};

VideoPlayer.prototype.setSubtitlesOld = function(){
	// out-of-band subtitles must be an array containing containing language code and source.ttml file url.
	return true; // Subtitle to be implemented
	/*try{
		var player = this.video;
		
		debug("set subs from active assets metadata 'subtitles'");
		
		if(menu.focus.subtitles) this.subtitles = menu.focus.subtitles;
		
		debug( JSON.stringify( this.subtitles ) );
		
		if( this.subtitles && this.subtitles.length ){
			
			$.each( this.subtitles, function(i, lang){
				//debug( lang );
				debug("Subtitles " + i + ": " + lang.code + " - " + lang.src);
				//var track = $("<track name='subtitles' value='srclang:"+ lang.code +" src: " + lang.src + "' />")[0];

								
				var track = document.createElement("track");
				//track.kind = "captions";
				track.kind = "subtitles";
				track.label = "Language " + i;
				track.srclang = lang.code;
				track.src = lang.src;
				track.addEventListener("load", function() {
					debug("text track ready: " + this.srclang);
					if( this.language == this.subtitles[0].code ){
						this.mode = "showing";
						//player.textTracks[0].mode = "showing"; // disabled?
					}
					else{
						this.mode = 'hidden';
					}
				});
				track.addEventListener("oncuechange", function() {
					debug("oncuechange");
				});
				player.appendChild(track);
				
			} );
			debug( "Text tracks: " + player.textTracks.length );
			$.each( player.textTracks, function(i, track){
				debug( track );
			} );
			this.subtitleTrack = 0;
			player.textTracks[0].mode = "showing";
		}
		else{
			debug( "no subs" );
		}
	} catch(e){
		debug("r:582  " + e.description );
	}*/
};
VideoPlayer.prototype.createInternalSubtitlesStructure = function (ret){
	try{
		this.buckets = JSON.parse(ret);
	}catch(e){}

	if(this.buckets.length > 0) {
		this.bucketId = 0;
	}else{
		debug("Subtitles BUCKET EMPTY");
	}

	//GLOBALS.focusmgr.focusObject("videoplayer");
	// the rest of the job is done inside getTimeInfo function , using syncdata, see below
}
VideoPlayer.prototype.loadSubtitles = function (){
	debug("load subtitles "+this.srtFile);
	var self = this, url = "parseSrt.php?srt_file="+escape(this.srtFile);

	this.req = createHttpRequest(url, function(ret) {
		self.req = null;
		self.createInternalSubtitlesStructure(ret);
		self.bucketId = 0;
		GLOBALS.upperlimit = 0;
	});
}

VideoPlayer.prototype.getSrtFile = function(subs){
	var self = this;
	var subtitles = null;
	if (subs) {
		subtitles = subs;
		self.subsmenu.setFiles(subtitles);

		if (subtitles.length > 0) {
			self.subsmenu.elem.style.display = "block";
			self.srtFile = subtitles[0].f;
			self.loadSubtitles();
		} else {
			self.subsmenu.elem.style.display = "none!important";
			self.subsmenu.enabled = false;
		}
	}
	self.subtitles= subtitles;
	return true;
}
VideoPlayer.prototype.setSubtitles = function(url){
	var self=this;
	if (!url || !url.length) {
		$('#extra2').hide();
		return;
	}
	if(url) {
		$('#extra2').show();
		//$("#extra-btns").append('<div class="piconbg extra-btn" id="extra2"><div class="picon" id="extra-btn2"></div></div>');
		self.extras = 3;
	}
	if(typeof Subtitles !== "undefined"){
		this.subsmenu = new Subtitles("subsmenu");
		this.subsmenu.focusedId = -1;
		this.subsmenu.init(this.element, "", "");
		$("#subtitleButtonText").html( "Subtitles: ");
	}
	this.getSrtFile(url);
};

VideoPlayer.prototype.startVideo = function(isLive, ntCall/*, muted*/) {
	var self = this;
	
	if(!ntCall) ntCall=0; // 0=initial, 1=afterDrmLaurlOverride
	debug("startVideo(), " + self.currentItem.title);

	this.resetProgressBar(); // always reset progress bar	
	if( isLive ){
		self.live = true;
	} else{
		self.live = false;
	}

	if (this.onAdBreak)
		$("#player").removeClass("show");

	//if(!GLOBALS.brtyp){
		try{
			var broadcast = $("#mybroadcast")[0];
			if( !broadcast ){
				debug("in oipf create broadcast object", "yellow");
				$("body").append("<object type='video/broadcast' id='mybroadcast'></object>");
			}
			broadcast = $("#mybroadcast")[0];
			debug( "in oipf Current broadcast.playState="+ broadcast.playState );
			if( broadcast.playState != 3 ) { // 0=unrealized, 1=connecting, 2=presenting, 3=stopped
				broadcast.bindToCurrentChannel();
				broadcast.stop();
				debug("broadcast stopped", "yellow");
			}
		} catch(e){
			debug("error stopping broadcast " + e, "yellow");
		}

	if(this.drm && ntCall==0 && this.profile.hbbtv == "1.5")
		setOIPFActiveDRM(self.currentItem);	

	if( this.drm && this.drm.ready == false ){
		this.sendLicenseRequest( function( response ){
			debug("license ready ", self.drm);
			if( self.drm.ready ){
				self.startVideo(isLive, ntCall+1); // async 2nd call
			} else if( self.drm.error ){
				showInfo( "Error: " + self.drm.error );
			} else{
				showInfo( "Unknown DRM error! " + JSON.stringify( response ));
			}
		} );
		return;
	}

	if( !self.video ){
		self.populate();
		self.setEventHandlers();
	}

	self.video.onPlayStateChange = function(){ self.doPlayStateChange(); };
	self.element.removeClass("hidden");
	self.visible = true;
	self.setFullscreen(true);

	self.watched.load();
	var position = null; //this.watched.get( self.videoid );
	if( !self.live && position ){
		self.resumePosition = position.position;
		debug("resumePosition is " + self.resumePosition);
		self.whenstart = function(){
			self.pause();
			debug("video paused by resume dialog in whenstart function");
			showDialog("Resume","Do you want to resume video at position " + toTime( self.resumePosition ) , ["Yes", "No, Start over"], function( val ){
				if( val == 0 ){
					self.whenstart = function(){
						debug("Seek to resume and play " + self.resumePosition * 1000);
						self.video.seek( self.resumePosition * 1000 );
						self.whenstart = null;
						self.resumePosition = 0;

					};
					self.setFullscreen(true);
					self.play();
				}
				else{
					debug("video.play()")
					self.play();
					self.setFullscreen(true);
					self.resumePosition = 0;
				}

			}, 0, 0, "basicInfoDialog");
		};
	}

	
	try {
		self.play();
	} catch(e) {
		debug(e);
	}
	if (GLOBALS.smid && !this.onAdBreak ) {
		this.smidTimer = setInterval(function () {
			if (self.isPlaying()) {
				if(!self.video) return;
				sendSmid(self, self.video.playState, 0);
			} else {
				clearInterval(self.smidTimer);
			}
		}, 30000);
	}
	
	/*if (self.middleRollTime && !this.onAdBreak) {
		window.setTimeout(function () {
			try {
				self.video.seek(self.middleRollTime*1000);
				console.log(self.middleRollTime);
			} catch(e) {
				debug(e);
			}
			self.displayPlayer(5);
			self.middleRollTime = 0;
		}, 300);
	}*/

	self.setFullscreen(true);
	if(!self.middleRollTime) self.displayPlayer(6);
	
};

VideoPlayer.prototype.mute = function (){
	return true;
	/*var self = this;
	self.muted = true;
	try{
		document.getElementById("videodiv").style.display = "none";
		$("#player").removeClass("show");
		$("#player").addClass("hide");
		if(!GLOBALS.lastFocus){
			if(GLOBALS.focusmgr.currentFocus) GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
			else  GLOBALS.lastFocus = "new-layout";
		}
		debug("Mute put focus on : " +GLOBALS.lastFocus , "yellow");
		window.setTimeout(function(){
				GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus, true);
            },200);
	}
	catch(e){
		debug(e);
	}*/
}

VideoPlayer.prototype.pause = function(){
	debug("oipf player pause");
	var self = this;
	try{
		self.video.play(0);
		self.displayPlayer();
	}
	catch(e){
		debug(e);
	}
};


VideoPlayer.prototype.stop = function(){
	//showInfo("Exit Video", 1);
	document.getElementById("appscreen").style.display = "block";
	document.getElementById("tvbild").removeClass("hidden");
	if(document.getElementById("blackBG")) document.getElementById("blackBG").remove();
	var self = this;
	// self.watched.save();
	if (self.video && typeof self.video.playPosition !== "undefined" && ENABLE_WATCHED) {
	const time = self.video.playPosition / 1000;
	const duration = self.video.duration / 1000;
	self.watched.set(time, duration, self.videoid);
	self.watched.save();
}
	if (GLOBALS.smid && !self.onAdBreak) {
		sendSmid(self, STATE_STOP, 0);// stop never go to playsttate event
	}
	
	try{
		
		self.video.stop();
		debug( "video.stop succeed" );
		self.clearVideo();
		debug( "clearVideo succeed" );
		self.resetProgressBar();
		//startRF();
		//GLOBALS.scenemgr.stopBroadcast();
		if (!self.onAdBreak) {
			window.setTimeout(function(){
				if(GLOBALS.lastFocus != "side-menu")
					GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
				else 
					GLOBALS.focusmgr.focusObject(returnfocus);
			},200);
		}
		//GLOBALS.scenemgr.goBack();
	} catch(ex) {
		debug(ex);
	}
	
	if(this.profile.hbbtv == "1.5" && self.currentItem.setActiveDRM_drmSystemId)
		setOIPFActiveDRM(null);
};


VideoPlayer.prototype.play = function() {
	var self = this;
	debug("play video: " + JSON.stringify(self.url));

	try {
		// Load watched data if enabled
		if (typeof PLAYER_WATCHED === "undefined" || PLAYER_WATCHED === 1) {
			const watchedItem = self.watched.get(self.videoid);
			if (watchedItem) {
				debug("[WATCHED] Resuming from " + watchedItem.position + "s");
				self.video.play(1);
				self.video.seek(watchedItem.position * 1000);
			} else {
				debug("[WATCHED] No previous data, playing from start");
				self.video.play(1);
			}
		} else {
			debug("[WATCHED] Disabled, playing from start");
			self.video.play(1);
		}

		self.setFullscreen(true);
		self.displayPlayer(6);
	} catch (e) {
		debug("Error at VideoPlayer.play(): " + e.description);
	}
};

VideoPlayer.prototype.clearVideo = function(){
	var self = this;
if (self.video && typeof self.video.playPosition !== "undefined" && ENABLE_WATCHED) {
	const time = self.video.playPosition / 1000;
	const duration = self.video.duration / 1000;
	self.watched.set(time, duration, self.videoid);
	self.watched.save();
}
	self.removeNextEpisodeOverlay();
	if(!self.nextEpisode || self.bingeCancelled)
		self.element.addClass("hidden");
	document.getElementById("subs-container").style.display = "none";
	self.visible = false;

	self.bingeCancelled = false;

	clearInterval(self.adTimer);
	self.adTimer = null;
	clearInterval(self.progressUpdateInterval);
	clearInterval(self.smidTimer);
	try{
		if(self.video){
			if( self.isPlaying() ){
				self.video.stop();
			}
			$( "#video2" ).remove(); // clear from dom
			this.video = null;
			debug("video object stopped, removed from dom and VideoPlayerClass");
		}
		if(!GLOBALS.brtyp){
			if( $("#mybroadcast")[0] ){
				$("#mybroadcast")[0].bindToCurrentChannel();
			}
		}
	}
	catch(e){
		debug("Error at clearVideo()");
		debug( e.description );
	}
	this.subtitles = null;
	this.buckets = null;
	this.subtitlesEnabled = false;
	this.clearLicenseRequest( function(msg){
		//destroyOIPFDrmAgent();
		debug("License cleared:" + msg);
	});
};

VideoPlayer.prototype.isFullscreen = function(){
	var self = this;
	return self.fullscreen;
};

VideoPlayer.prototype.isPlaying = function(){
	return ( this.video && this.video.playState == 1 ); // return true/false
};

VideoPlayer.prototype.doPlayStateChange = function(){
	var self = this;
	if(!self.video) {
		return;
	}
	debug('new video state '+ self.video.playState);

	if (GLOBALS.smid && !self.onAdBreak) {
		sendSmid(self, self.video.playState, (self.video.playState == STATE_ERROR ? self.video.error : 0));
	}

	switch (self.video.playState) {
		case 0: // stopped
			clearInterval(self.adTimer);
			self.adTimer = null;
			clearInterval(self.progressUpdateInterval);
			self.setLoading(false);
			Monitor.videoEnded(debug);
			break;
		case 1: // playing
			debug("playing");
			self.videoDuration = Math.floor(self.video.playTime / 1000);

			if (!self.onAdBreak && !self.adTimer) {
				self.adTimer = setInterval(function(){self.checkAds()}, 1000);
			}
			if(1 && self.middleRollTime && self.currentItem.title != "Ad"){
				debug("go to middle roll time: " + self.middleRollTime);
				//self.seek(self.middleRollTime);
				self.video.seek(self.middleRollTime * 1000)
				self.middleRollTime = 0;
				self.displayPlayer(4);
			}

			if( dialog.open ){
				debug("pause on dialog");
				self.pause();
				return;
			}

			self.visible = true;
			self.setFullscreen(true);
			self.setLoading(false);
			clearInterval(self.progressUpdateInterval);
			self.progressUpdateInterval = window.setInterval( function(){
				if( self.video ){
					//self.watched.set( self.video.playPosition / 1000, self.video.playTime / 1000, self.videoid );
				}
				if( self.seekTimer == null ){
					self.updateProgressBar();
					//self.displayPlayer( 5 );
				}
				var bucketNotFound = true, x = Math.floor(self.video.playPosition), playPosition = Math.floor(self.video.playPosition / 1000), duration = Math.floor(self.video.playTime / 1000);
				if (self.subtitles && self.subtitlesEnabled) {
					document.getElementById("subs-container").style.visibility = "visible";

					if (self.buckets != null) {
						while(bucketNotFound){
							if(self.buckets[self.bucketId] && x > timeStringToSeconds(self.buckets[self.bucketId].to)) {
								self.bucketId++; GLOBALS.upperLimit= 0;
							} else if (self.buckets[self.bucketId] && x < timeStringToSeconds(self.buckets[self.bucketId].from)) {
								self.bucketId--; GLOBALS.upperLimit= 0;
							} else bucketNotFound = false;
						}
						if(self.bucketId < 0 ) self.bucketId = 0;
						if(self.bucketId > self.buckets.length-1) self.bucketId = 0;
						self.syncdata(x, self.bucketId);
					}
				}

				if (!self.onAdBreak && duration > 0 && duration < 60) self.bingeCancelled = true;
				if(!self.onAdBreak && self.bingeParameters &&
					!self.bingeCancelled && 
					duration && 
					duration > 0 && 
					duration-playPosition <= self.bingeParameters.Delay && 
					duration-playPosition >= (self.bingeParameters.Delay-self.bingeParameters.Duration) && 
					self.nextEpisode){
					if(!self.nextEpisodeOverlay)
						self.showNextEpisodeOverlay();
					else
						if(duration-playPosition <= (self.bingeParameters.Delay-self.bingeParameters.Duration)) self.playStateFinished();
					else self.updateNextEpisodeOverlay(duration-(self.bingeParameters.Delay-self.bingeParameters.Duration)-playPosition, 
						self.nextEpisode.EpisodeNumber?self.nextEpisode.EpisodeNumber:null,
						self.nextEpisode.Subtitle?self.nextEpisode.Subtitle:self.nextEpisode.Title);
				}else{
					self.removeNextEpisodeOverlay();
				}
				if(self.onAdBreak && playPosition>0) {
					var qu1 = 0, qu2 = 0, qu3 = 0;
					if(duration>0){
						qu1=Math.floor(duration/100*25);
						qu2=Math.floor(duration/100*50);
						qu3=Math.floor(duration/100*75);
					}

					if(self.lastpos!=playPosition){
						self.lastpos=playPosition;

						if(typeof GLOBALS.track === "object"){
							var topj=getTrack(playPosition,qu1,qu2,qu3);
							if(typeof topj === "string" && topj.length != ''){
								debug('track impression '+ topj);
								var im = new Image;
								im.src=topj;
							}
						}
					}
				}
			}, 1000);
			Monitor.videoPlaying();

			if( self.getAudioTracks() > 1 ){ // if more than one audiotrack selectable show button
				$("#audioButton").show();
			}else{
				$("#audioButton").hide();
			}

			if( this.subtitles && this.subtitles.length ){
				$("#subtitleButton").show();
			}
			else{
				$("#subtitleButton").hide();
			}

			// check if there is function to execute after all other things are done for video start
			if( self.whenstart && typeof self.whenstart == "function" ){
				self.whenstart();
				self.whenstart = null;
			}

			break;
		case 2: // paused
			self.setLoading(false);
			clearInterval(self.progressUpdateInterval);
			if(self.isFullscreen()){
				//self.controls.show();
			}
			Monitor.videoPaused();
			break;
		case 3: // connecting
			clearInterval(self.progressUpdateInterval);
			self.setLoading(true, "Connecting");
			Monitor.videoConnecting();
			break;
		case 4: // buffering
			clearInterval(self.progressUpdateInterval);
			self.setLoading(true, "Buffering");
			Monitor.videoBuffering();
			break;
		case 5: // finished
			self.playStateFinished();
			break;
		case 6: // error
			clearInterval(self.progressUpdateInterval);
			self.setLoading(false);
			//self.controls.hide();
			var error = "";
			switch (self.video.error) {
				case 0:
					error = "A/V format not supported";
					break;
				case 1:
					error = "cannot connect to server or lost connection";
					break;
				case 2:
					error = "unidentified error";
					break;
				case 3:
					error = "Insufficient Resources";
					break;
				case 4:
					error = "content corrupt or invalid";
					break;
			}
			showInfo("Error!: " + error);
			debug("Error!: " + error + "(err code: " + self.video.error + ", type: "+self.video.type+")");
			Monitor.videoError( error );
			//self.clearVideo();
			break;
		default:
			self.setLoading(false);
			// do nothing
			break;
	}
};
VideoPlayer.prototype.playStateFinished = function(){
	var self = this;

	if (self.onAdBreak /*|| this.middleTimer*/) {
		clearInterval(self.progressUpdateInterval);
		self.onAdBreak = false;

		if(typeof GLOBALS.track === "object"){
			var o = GLOBALS.proll;
			var im1 = new Image, im2 = new Image;
			im1.src=GLOBALS.track.complete;
			im2.src = 'http://195.211.203.122/pub/smarttv/ert/proll.php?t='+ encodeURIComponent(o.serie) +'&c='+ encodeURIComponent(o.cat) +'&e='+ encodeURIComponent(o.ep) +'&m='+ encodeURIComponent(o.mp4) +'&req=6&r=1'+ getRandomInt(100);
			debug('track impression '+ GLOBALS.track.complete);
			GLOBALS.track.complete="";
		}

		if (self.todo) {
			GLOBALS.vplayer.currentItem = self.todo;
			GLOBALS.scenemgr.prepareVideoStart(self.todo);
			self.startVideo(false);
			self.todo = null;
			
		}
	}else if(self.nextEpisode && !self.bingeCancelled) {
		clearInterval(self.progressUpdateInterval);
		self.setLoading(false);
		self.removeNextEpisodeOverlay();
		self.playNextEpisode();
	}else if (self.live){
		console.log("trailer ended - show image");
		document.getElementById("streamImg").style.opacity = 1;
		clearInterval(self.progressUpdateInterval);
		self.setLoading(false);
	} else {
		clearInterval(self.progressUpdateInterval);
		self.setLoading(false);
		self.stop();
	}
}

VideoPlayer.prototype.getStreamComponents = function(){
	try {
		if(typeof this.video.getComponents == 'function') {
			this.subtitles = vidobj.getComponents( 1 ); // 1= audio
			if (this.subtitles.length > 1) {
				showInfo("Found "+this.subtitles.length+" audio track(s)");
			}
		} else {
			showInfo("Switching audio components not supported");
		}
	} catch (e) {
		showInfo("Switching audio components not supported");
	}
	
};

VideoPlayer.prototype.getAudioTracks = function(){	
	try{
		if(typeof this.video.getComponents == 'function') {
			var avComponent = this.video.getComponents( this.AVCOMPONENTS.AUDIO );
			return avComponent.length;
		}
		else{
			return 0;
		}
	} catch(e){
		showInfo( "getComponents not available", e.message );
	}	
};

VideoPlayer.prototype.getCurrentAudioTrack = function(){
	/*
	try{
		if(typeof this.video.getComponents == 'function') {
			var avComponent = this.video.getComponents( this.AVCOMPONENTS.AUDIO );
			var track = avComponent[ self.audioTrack ];
			return track.language;
		}
		else{
			return "default";
		}
	} catch(e){
		showInfo( "getComponents not available", e.message );
		return "default";
	}
	*/
};


VideoPlayer.prototype.changeAVcomponent = function( component ) {
	debug("changeAVcomponent("+ component +")");
	var self = this;
	debug(self.video.playState+" - "+component);
	if (self.video.playState == 1 && component == self.AVCOMPONENTS.SUBTITLE) {
		this.subsmenu.focusedId++;
		if (this.subsmenu.focusedId > this.subtitles.length-1)
			this.subsmenu.focusedId = 0;
		this.subsmenu.handleKeyPress(VK_ENTER);
		return;
	}
	try{
		var track = ( component == self.AVCOMPONENTS.AUDIO? self.audioTrack : self.subtitleTrack );
		debug("current track: " + track  );
		if( track == undefined || track == NaN || track === false ){
			debug("Change to 0"  );
			track = 0;
		}
		track++;
		debug("switched track: " + track );
		switch ( this.video.playState) {
			case 1:
				// components can be accessed only in PLAYING state
				//ref 7.16.5.1.1 OIPF-DAE
				/*
				COMPONENT_TYPE_VIDEO: 0,
				COMPONENT_TYPE_AUDIO: 1,
				COMPONENT_TYPE_SUBTITLE: 2
				*/
				var avComponent = this.video.getComponents( component );
				if( track >= avComponent.length){
					track = 0;
				}
				
				if( component == self.AVCOMPONENTS.AUDIO ){
					self.audioTrack = track;
					debug("Updated audioTrack value to: " + self.audioTrack);
				}
				else{
					self.subtitleTrack = track;
					debug("Updated subtitleTrack value to: " + self.subtitleTrack);
				}
				
				debug("Video has " + avComponent.length + " "+ ["video","audio","subtitle"][component] +" tracks. selected track is: " + track );
				
				// unselect all
				for (var i=0; i<avComponent.length; i++){
					debug( "track " + i + ": " + avComponent[i].language );
					this.video.unselectComponent(avComponent[i]);
				}
				
				showInfo("select track " + track + "("+avComponent[track].language+")");
				debug("select track " + track);
				this.video.selectComponent(avComponent[track]);
				debug("READY");
				debug( avComponent[track].language, avComponent[track].label || "label undefined" );
				
			break;
			case 6:
				/*ERROR*/
				showInfo("Error has occured");
				break; 
		}
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayer.prototype.enableSubtitles = function( next ) {
	debug("enableSubtitles("+ next +")");
	try{
		if( next ){
			debug("current track: " + this.subtitleTrack  );
			if(!this.subtitleTrack || this.subtitleTrack == undefined || this.subtitleTrack == NaN){
				this.subtitleTrack = 0;
			} else {
				this.subtitleTrack++;
			}			
			debug("switched track: " + this.subtitleTrack  );
		}
		switch ( this.video.playState) {
			case 1:
				// components can be accessed only in PLAYING state
				//ref 7.16.5.1.1 OIPF-DAE
				/*
				COMPONENT_TYPE_VIDEO: 0,
				COMPONENT_TYPE_AUDIO: 1,
				COMPONENT_TYPE_SUBTITLE: 2
				*/
				var avSubtitleComponent = this.video.getComponents( 2 );
				if( this.subtitleTrack >= avSubtitleComponent.length){
					this.subtitleTrack = 0;
				}
				debug("Video has " + avSubtitleComponent.length + " subtitle tracks. selected track is: " + this.subtitleTrack );
				for (var i=0; i<avSubtitleComponent.length; i++){
					if ( this.subtitleTrack == i ) {
						showInfo("select subtitleTrack " + i);
						debug("select subtitleTrack " + i);
						this.video.selectComponent(avSubtitleComponent[i]);
						debug("READY");
					} else {
						debug("unselect subtitleTrack " + i);
						this.video.unselectComponent(avSubtitleComponent[i]);
						debug("READY");
					}
				}
				
			break;
			case 6:
				/*ERROR*/
				showInfo("Error has occured");
				break; 
		}
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};
