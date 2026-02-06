/**
 * HTML5 video player impelmentation for HbbTV 2.0.1 capable devices
 * 
 * @class VideoPlayerHTML5
 * @constructor
 * @uses VideoPlayerBasic
 */


function VideoPlayerHTML5(element_id, profile, width, height){
	debug("VideoPlayerHTML5 - Constructor");
	// Call super class constructor
	VideoPlayerBasic.call(this, element_id, profile, width, height);
}

VideoPlayerHTML5.prototype.createPlayer = function(){
	var self = this;
	self.state = 0;
	self.lastState = -1;

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
			// +'<div class="piconbg extra-btn" id="extra3"><div class="picon" id="extra-btn3"></div></div>'
			// +'<div class="piconbg extra-btn" id="extra4"><div class="picon" id="extra-btn4"></div></div>'
			// +'<div class="piconbg extra-btn" id="extra5"><div class="picon" id="extra-btn5"></div></div>'
			+'</div>'
			+'<div id="subtitleButton"><div id="subtitleButtonText">Subtitles:</div></div>'
			//+'<div id="audioButton"><div id="audioButtonText">Audio</div></div>'
			+'<div id="playText"></div>'
			+'</div>');
		$('#videodiv').append('<div class="playerbg"><div class="playerinfo"></div></div>');
	}

	try{
		// removed type attribute
		//this.video = $("<video id='video' type='application/dash+xml' class='fullscreen'></video>")[0];
		this.video = $("<video id='video2' class='fullscreen'></video>")[0];
		this.element.appendChild( this.video );
	} catch( e ){
		debug("Error creating dashjs video object ", e.description );
	}

	var player = this.video; // HTML5 Video element
	
	addEventListeners( player, 'ended abort', function(e){
		debug(e.type);
		self.removeNextEpisodeOverlay();
		if(self.live){
			console.log("show image");
			if(document.getElementById('streamImg')) document.getElementById("streamImg").style.opacity = 1;
		}else{
			self.stop();
		}
	} );
	
	player.addEventListener('error', function(e){
		self.setLoading(false);
		if( !self.video ){
			return;
		}
		
		debug("[html5 on error]" + e.type + " - " + e.message + " - " +e.description);		
		try{
			var errorMessage = "undefined";
			switch( self.video.error.code ){
				case 1: /* MEDIA_ERR_ABORTED */ 
				errorMessage = "fetching process aborted by user";
				break;
				case 2: /* MEDIA_ERR_NETWORK */
				errorMessage = "error occurred when downloading";
				break;
				case 3: /* = MEDIA_ERR_DECODE */ 
				errorMessage = "error occurred when decoding";
				break;
				case 4: /* MEDIA_ERR_SRC_NOT_SUPPORTED */ 
				errorMessage = "audio/video not supported";
				break;
			}
			debug( "MediaError: " + errorMessage );
			Monitor.videoError( errorMessage );
		} catch(e){
			debug("error reading video error code " + e.description);
		}
	} );
	
	player.addEventListener('play', function(){ 
		//debug("video play event triggered");
	} );
	
	player.seektimer = null;
	player.addEventListener('seeked', function(){
		debug("seeked");
	});	
	
	var canplay = false;

	addEventListeners( player, "loadstart waiting", function(e){
		//if(self.muted) return true; 
		debug("[1. load start waiting video: "+player.src+"] "  + e.type );
		self.setLoading(true);
	} );

	player.addEventListener('durationchage', function(e){
		debug("[3. durationchage]" + e.type+ ", src: " + player.src);
	} );

	player.addEventListener('loadedmetadata', function(e){
		debug("[3. loadedmetadata]" + e.type+ ", src: " + player.src);
	} );
	
	player.addEventListener('loadeddata', function(e){
		debug("[4. loadedmetadata]" + e.type+ ", src: " + player.src);
	} );


	player.addEventListener('progress', function(e){
		/*var r = player.buffered;
	    var total = player.duration;

	    var start = r.start(0);
	    var end = r.end(0);
	    var newValue = (end/total)*100;
	    var loader = newValue.toString().split(".");//loader[0]

*/    
		//debug("[5. progress ]" + e.type + ", src: " + self.video.src);
	} );

	player.addEventListener('canplay', function(e){
		canplay = true;
		debug("[6. canplay]" + e.type+ ", src: " + player.src);
	} );

	player.addEventListener('canplaythrough', function(e){
		canplay = true;
		debug("[7. canplaythrough]" + e.type+ ", src: " + player.src);
	} );

	addEventListeners( player, "stalled suspend", function(e){ 
		debug("[stalled suspend video : "+player.src+"]"  +e.type);
	} );
	
	addEventListeners( player, 'emptied', function(e){
		//if(self.muted) return true; 
		debug("[emptied video : "+player.src+"]"  +e.type);
		self.setLoading(false);		
	} );	
	
	//player.addEventListener('progress', function( e ){
	//	//no-op
	//} );
	
	player.addEventListener('pause', function(){
		//if(self.muted) return true; 
		debug("pause");
		Monitor.videoPaused(); 
		self.setLoading(false);
		$("#ppauseplay").removeClass("pause").addClass("play");
		self.state = STATE_PAUSE;
		self.checkState();
	} );
	
	if( player.textTracks ){
		player.textTracks.addEventListener('addtrack', function(evt){
			
			// set up inband cue events listeners for new tracks
			var track = evt.track;
			
			// TODO: First check if same language code exist, do not add duplicates. 
			// (may occur if subtitles are served both inband and out-of-band)
			try{
				/*
				$.each( $(player).find("track"), function(olderTrack){
					if( olderTrack.label == track.language ){
						debug("Language " + track.language + " text track already exists. Skip");
						$(player)
						return;
					}
				} );
				*/
				/*
				var found = false;
				$.each( player.textTracks, function(olderTrack){
					if( olderTrack.label == track.language ){
						debug("Language " + track.language + " text track already exists. Skip");
						delete track;
						found = true;
						return false;
					}
				} );
				if(found){
					return;
				}
				*/
			} catch( e ){
				debug( "error checking tracks: " + e.description );
			}
			
			track.onerror = track.onload = function(){
				debug( arguments );
			}
			
			//debug("at addtrack nth track: " + this.length + " : set up cuechange listeners", track);			
			
			// show subtitle button label if there is a track that is not metadata 
			if( track.kind != "metadata" ){
				$("#subtitleButton").show();
			}
			
			/*
			// the first track is set showing
			if( self.subtitleTrack === false ){
				track.mode = "showing";
				self.subtitleTrack = 0;
				debug("set showing track ", track.language, track.label);
				$("#subtitleButtonText").html("Subtitles: " + track.language );
			}
			else{
				track.mode = "hidden";
			}
			*/
			
			track.label = track.language;
			//debug("text track " + track);
			track.oncuechange = function(evt) {				
				if( this.kind == "metadata" ){
					//showInfo("cuechange! kind=" + this.kind);
					try{
						var cuelist = this.activeCues; // TextTrackCueList
						if ( cuelist && cuelist.length > 0) {
							//debug("cue keys: ",  Object.keys( cuelist[0] ) ); 
							var info= "";
							var dur = 0; // seconds
							$.each( cuelist, function(c, cue){								
								// try read text attribute
								if( cue.text ){
									showInfo( cue.text );
								}

								dur=cue.endTime-cue.startTime;
								var cueValue = arrayBufferToString( cue.data );
								debug( "EVENT.START time: " + cue.startTime + ", ends: " + cue.endTime + " cueValue: " + cueValue );
								info +=  "'" + cueValue + "' start: " + cue.startTime + ", ends: " + cue.endTime + "<br/>";
							} );													
							showInfo( info, dur>1?dur:1 ); // show overlay info
						} else {
							showInfo("", -1); // Metadata cue exit
						}
					} catch(e){
						debug("error Reading cues", e.message );
					}					
				}
				else{
					//debug("cue event " + this.kind + " received");
					if( this.activeCues.length ){
						//debug("cue keys " + Object.keys( this.activeCues[0] ) + " received");
					}
				}
			};
			//debug( "oncuechange function set" );
		} );
	}
	
	player.addEventListener('error', function() {
		self.state = STATE_ERROR;
		self.checkState();
	});
	player.addEventListener('loadstart', function() {
		self.state = STATE_BUFFERING;
		self.checkState();
	});
	player.addEventListener('waiting', function() {
		self.state = STATE_BUFFERING;
		self.checkState();
	});
	player.addEventListener('ended', function() {
		self.state = STATE_FINISHED;
		self.checkState();
	});
	player.addEventListener('playing', function(){
		self.setLoading(false);
		self.state = STATE_PLAYING;
		self.checkState();

		if(dialog && dialog.open) {
			player.pause(); // resume_play dialog still open
			return;
		}
		
		if( self.firstPlay ){
			self.firstPlay = false;
			self.displayPlayer( 6 );
			var metadataTracks = [];
			// TODO: Set the first subtitle track active if any exists.
			if( self.video.textTracks && self.video.textTracks.length ){
				var defaultSub = -1;
				$.each( self.video.textTracks, function(i, track){
					if( defaultSub < 0 && track.kind != "metadata" ) {
						track.mode = "showing";
						defaultSub = i;
						$("#subtitleButtonText").html("Subtitles: " + track.language );
					} else if( track.kind != "metadata" ){
						track.mode = "hidden";
					}
					else if( track.kind == "metadata" ){
						metadataTracks.push(i);
					}
				} );
				if( defaultSub >= 0 ){
					debug("Found default subtitle track: " + defaultSub);
					self.subtitleTrack = defaultSub;
					//debug( self.video.textTracks[ defaultSub ] );
				}
				//$("#subtitleButton").show();
			}
			else{
				//$("#subtitleButton").hide();
			}
			
			if( self.getAudioTracks() ){
				$("#audioButton").show();
			}else{
				$("#audioButton").hide();
			}
			
			// audio tracks
			if( self.video.audioTracks && self.video.audioTracks.length ){
				var defaultAudio = -1;
				$.each( self.video.audioTracks, function(i, track){
					//debug("audiotrack " + i);
					//debug( track );
					if( defaultAudio < 0 && track.kind != "metadata" ) {
						track.mode = "showing";
						defaultAudio = i;
						$("#audioButtonText").html("Audio: " + track.language );
						$("#audioButton").show();
					} else if( track.kind != "metadata" ){
						track.mode = "hidden";
					}
				} );
				if( defaultAudio >= 0 ){
					debug("Found default audio track: " + defaultAudio);
					self.audioTrack = defaultAudio;
					//debug( self.video.audioTracks[ defaultAudio ] );
				}
			}
			
		}
		Monitor.videoPlaying();
		self.setLoading(false);
		$("#ppauseplay").removeClass("play").addClass("pause");		
	} );
	
	
	player.addEventListener('timeupdate', function(e){
		
		/*
		var vidDur = player.duration;
		debug("[timeupdate progress] vid dur: " + vidDur);
		for(var i = 0; i <= vidDur; i++){
			    var totBuffX = player.buffered.end(i);
		        var perBuff = totBuffX/vidDur*100;
		        debug("buffer percentage: " +perBuff+"%");
		    
	    }*/

		self.watched.set( player.currentTime, player.duration, self.videoid );
		if( self.seekTimer == null ){
			self.updateProgressBar();
			self.checkAds();
		}
		if(!self.video) {
			document.getElementById("subs-container").style.visibility = "hidden";
			return;
		}
		var bucketNotFound = true, x = Math.floor(self.video.currentTime * 1000);
		
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
		if(player.duration > 0 && player.duration < 60) self.bingeCancelled = true;
		if(!self.onAdBreak && self.bingeParameters &&
			!self.bingeCancelled && 
			player.duration && 
			player.duration > 0 && 
			player.duration-player.currentTime <= self.bingeParameters.Delay && 
			player.duration-player.currentTime >= (self.bingeParameters.Delay-self.bingeParameters.Duration) && 
			self.nextEpisode){
			if(!self.nextEpisodeOverlay)
				self.showNextEpisodeOverlay();
			else
				if(player.duration-player.currentTime <= (self.bingeParameters.Delay-self.bingeParameters.Duration)) {
					self.playNextEpisode();
				}
				else self.updateNextEpisodeOverlay(player.duration-(self.bingeParameters.Delay-self.bingeParameters.Duration)-player.currentTime, 
					self.nextEpisode.EpisodeNumber?self.nextEpisode.EpisodeNumber:null,
					self.nextEpisode.Subtitle?self.nextEpisode.Subtitle:self.nextEpisode.Title);
			}else{
				self.removeNextEpisodeOverlay();
			}
		} );
	function roundNearest(positionInSeconds) {
		var roundedPosition = Math.round(positionInSeconds / 10) * 10;
		return roundedPosition;
	}
	player.seek = function( sec, absolute ){
		try{
			var target = ( absolute? sec : player.currentTime + sec);
			
			if( target < 0 )
				target = 0;
			else if( target > player.duration )
				return;
			target = roundNearest(target);
			debug("position: " + player.currentTime + "s. seek "+sec+"s to " + target);
			player.currentTime = target; // set position
		} catch(e){
			debug("error seeking: " + e.description);
		}
	};
	
	return true;
}

VideoPlayerHTML5.prototype.checkState = function(){
	var self = this, error=0;
	const state = self.state;
	if (state == STATE_ERROR && self.video)
		error = self.video.error.code;

	if (self.lastState == -1 || self.lastState != state) {
		debug('checkState: state '+ state);

		if (GLOBALS.smid && !self.onAdBreak) {
			sendSmid(self, state, error);
		}
	}
	self.lastState = state;
};
/*
VideoPlayerHTML5.prototype.getCurrentPos = function (){
	return this.video.currentTime;
}

VideoPlayerHTML5.prototype.setCurrentPos = function (val){
	this.video.currentTime = val;
}*/

VideoPlayerHTML5.prototype.setURL = function(url){

	//if(location.host == "127.0.0.1") url = "http://195.226.218.10/mega/f05b969f0b69c23b7250714fc905b4ce.mp4";

	if(GLOBALS.focusmgr.currentFocus){
		GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
	}
	if(!GLOBALS.lastFocus) GLOBALS.lastFocus = "cat-list-0";
	GLOBALS.focusmgr.focusObject(null);
	url = url.replace("${GUID}", uuidv4());
	debug("setURL(",url,")");	

	var type = "application/dash+xml";
	if( url.match(/mp4$/) ){
		this.video.type = "video/mp4";
	} else if( url.match(/\.2ts$/) ){
		this.video.type = 'video/mpeg';
	} else{
		this.video.type = type;
	}

	try{
		this.url = url;  // see sendLicenseRequest()
		var srv=['195.226.218.10','195.226.218.160','195.226.218.163'];
		var server=srv[ Math.floor(Math.random() * 3) ];
		this.url = this.url.replace('cdn.smart-tv-data.com', server);
		this.url = this.url.replace('abr.smart-tv-data.com', server);
		debug("video source url : " + this.url, "yellow");
		this.video.src = this.url;
		
	} catch( e ){
		debug("370 : "  + e.message );
	}
	
	// create id for video url
	this.videoid = url.hashCode();
	
	return;
};

VideoPlayerHTML5.prototype.checkAds = function(){
	if( this.adBreaks ){
		
		if( this.video == null ){
			// video has stopped just before new ad checking. exit player
			this.clearVideo();
			return;
		}
		
		var position =  Math.floor( this.video.currentTime );
		var self = this;
		$.each( this.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == position ){
				debug("found ad break at position " + position);
				adBreak.played = true;
				self.getAds( adBreak ); // play ads on current second
				return false;
			}
		} );
	}
};

VideoPlayerHTML5.prototype.prepareAdPlayers = function(){
	
	// if ad players are prepared do nothing
	if( $("#ad1")[0] && $("#ad2")[0] ){
		debug("ready to play ads");
		return;
	}
	var self = this;
	// create new adPlayers
	self.adPlayer = [ $("<video id='ad1' type='video/mp4' preload='auto'></video>")[0], $("<video id='ad2' type='video/mp4' preload='auto'></video>")[0] ];
	self.element.appendChild( self.adPlayer[0] );
	self.element.appendChild( self.adPlayer[1] );
	self.element.appendChild( $("<div id='adInfo'></div>")[0] );
	
	debug("html5 ad-video objects created");
	
	var adEnd = function(e){
		self.setLoading(false);
		
		debug("ad ended. adCount="+ self.adCount + " adBuffer length: " + self.adBuffer.length );
		if(e) debug("421: "  + e.type );
		var player = $(this);
		if( self.adCount < self.adBuffer.length ){
			player.addClass("hide");			
			self.playAds();			
		}
		else{
			// no more ads, continue content
			debug("No more ads, continue content video");
			self.onAdBreak = false;
			debug("Hide adv " + player[0].id);
			player.addClass("hide"); // hide ad video
			player[0].pause();

			$("#adInfo").removeClass("show");
			
			if( self.video == null ){
				debug("(adEnd) video has stopped during ads. exit");
				self.clearVideo();
				return;
			}
			
			if( self.firstPlay ){
				debug("(adEnd)  start video firstPlay is set + " + JSON.stringify(self.firstPlay));
				self.startVideo( self.live );
			}
			else{
				debug("(adEnd) else continue paused video");
				self.video.play();
			}
			debug("(adEnd)  show content video");
			$(self.video).removeClass("hide"); // show content video
		}
		
	};
	
	var onAdPlay = function(){
		debug("ad playing");
		
		self.setLoading(false);
		
	};
	
	var onAdProgress = function(e){};
	
	var onAdTimeupdate = function(){
		
		var timeLeft = Math.floor( this.duration - this.currentTime )
		if( timeLeft != NaN ){
			$("#adInfo").addClass("show");
			$("#adInfo").html("Ad " + self.adCount + "/" + self.adBuffer.length + " (" + timeLeft + "s)" );
		}
	};
	
	$.each( self.adPlayer, function(i, player){
		addEventListeners( player, 'ended', adEnd );
		addEventListeners( player, 'loadstart waiting', function (e){
			debug("[loadstart waiting ad("+i+") : " + player.src + "]" + e.type);

		} );
		addEventListeners( player, 'seeked', function(e){
			debug("[seeked ad("+i+") : " + player.src + "]" + e.type);
		} );

		addEventListeners( player, 'canplaythrough', function(e){
			/*if(self.onAdBreak && self.video.duration != NaN){
				if(!self.forceStopTimer) {
					debug("force stop at canplaythrough " + Math.round(self.video.duration));
					self.forceStopTimer = setTimeout( function(e){
						self.forceStopAd();
					}, Math.round(self.video.duration));
				}
			}*/
			debug("[canplaythrough ad("+i+") : " + player.src + "]" + e.type);
		} );
		addEventListeners( player, 'canplay', function(e){
			debug("[canplay ad("+i+") : " + player.src + "]" + e.type);
			self.videoDuration = self.video.duration;
		} );
		addEventListeners( player, 'stalled suspend', function(e){
			debug("[stalled suspend ad("+i+") : " + player.src + "]" + e.type);
		} );
		addEventListeners( player, 'emptied', function(e){
			debug("[emptied ad("+i+") : " + player.src + "]" + e.type);

		} );
		addEventListeners( player, 'pause', function(e){
			debug("[pause ad("+i+") : " + player.src + "]" + e.type);

		} );
		
		addEventListeners( player, 'playing', onAdPlay );
		addEventListeners( player, 'timeupdate', onAdTimeupdate );
		addEventListeners( player, 'progress', onAdProgress );
	} );
};

VideoPlayerHTML5.prototype.getAds = function( adBreak ){
	
	var url, self = this;
	debug("get ads breaks=" + adBreak.ads + ", position="+adBreak.position );

	var serie = self.currentItem.category == 'Starland' ? self.currentItem.category : GLOBALS.item.show;
	if (adBreak.position == 'preroll') {
		url="http://megatv-ctv.com/home/js/lbanner_js.php/sd/"+ON_Channel+"/tg/media/ty/pre/area/"+ encodeURIComponent(serie);
	} else {
		url="http://megatv-ctv.com/home/js/lbanner_js.php/sd/"+ON_Channel+"/ty/mid/area/"+ encodeURIComponent(serie);
	}
	debug(url);

	createHttpRequest(url, function (p) {
		//p = "http://cdn2.smart-tv-data.com/cache/star/5cf0b253001e46bf7a4dfa280ffd4751.png#2023/11/29 14:06:51#https://refapp.hbbtv.org/videos/test/test4_5s.mp4#";
		//p = "http://cdn2.smart-tv-data.com/cache/star/5cf0b253001e46bf7a4dfa280ffd4751.png#2023/11/29 14:06:51#NOID";
		
		var ar=p.split('#');

		if(ar.length>2 && ar[2].match(/http/i) ){

			self.onAdBreak = true; // disable seeking
			self.adCount = 0;
			try{
				if( self.isPlaying() ){
					self.video.pause();
					debug("main content paused to play ad.");
				}
			} catch(e){
				debug("content video pause failed. May be not initialized yet (prerolls)");
			}

			var spot=ar[2], a=[];
			a.push(spot);

			for(var i=3;i < ar.length;i++){
				var xLog=new Image;
				xLog.src=ar[i];
			}
			debug("get ad: " + a);
			if (a.length) {
				
				debug("Array of ads to be displayed: " + a);
				self.adBuffer = a;
				self.prepareAdPlayers();
				self.playAds();
			} else{
				debug("No ads retrieved, please continue with video");
				self.video.play(); // XXX this is wrong
			}
		}else if( ar.length <= 2 ){
			debug("return value NOID play video");
			self.video.play(); // XXX this is wrong
		}
	});
};


VideoPlayerHTML5.prototype.getAds22 = function( adBreak ){
	this.onAdBreak = true; // disable seeking
	this.adCount = 0;
	try{
		if( this.isPlaying() ){
			this.video.pause();
		}
	} catch(e){
		debug("content video pause failed. May be not initialized yet (prerolls)");
	}
	var self = this;
	debug("get ads breaks=" + adBreak.ads + ", position="+adBreak.position );
	var getadurl = "getAds.php?breaks=" + adBreak.ads + "&position="+adBreak.position;
	debug("call get ad url: " +getadurl);
	
	//var getadurl = "http://alpha.smart-tv-data.com/home/js/lbanner_js.php/sd/"+ON_Channel+"/tg/media/area/"+ encodeURIComponent(this.serie);
	
	
	createHttpRequest(getadurl, function (ads) {
		var ads = parseJSON(ads);
		debug("ads retrieved : "+ads);
		self.adBuffer = ads;
		debug("ad buffer : "+ads);
		self.prepareAdPlayers();
		
		self.playAds();
	});

	/*
	$.get( getadurl, function(ads){

		self.adBuffer = ads;
		alert( "Got " + ads.length + " ads");
		
		self.prepareAdPlayers();
		
		self.playAds();
		
	}, "json" );
	*/
};

VideoPlayerHTML5.prototype.playAds = function(){
	this.onAdBreak = true; // disable seeking
	try{
		if( this.isPlaying() ){
			debug("pause video to play ad");
			this.video.pause();
		}
	} catch(e){
		debug("content video pause failed. May be not initialized yet (prerolls)");
	}
	$(this.video).addClass("hide");
	
	var self = this;
	
	var activeAdPlayer = self.adPlayer[ self.adCount % 2 ];
	var idleAdPlayer = self.adPlayer[ (self.adCount + 1) % 2 ];
	
	// for the first ad, set active ad src. Later the active players url is always set and preload before the player is activated
	if( self.adCount == 0 ){
		
		activeAdPlayer.src = "test/test1_15s.mp4";
		//activeAdPlayer.src = "http://mega.smart-tv-data.com/21.mp4";
		//activeAdPlayer.src = self.adBuffer[ self.adCount ];
		debug("set active ad source file :  "+ activeAdPlayer.src);
	}
	
	self.adCount++
	
	// set next ad url to idle player and preload it
	if( self.adBuffer.length > self.adCount ){
		idleAdPlayer.src = self.adBuffer[ self.adCount ];
		idleAdPlayer.load();
	}
	
	debug("active ad player play");
	activeAdPlayer.play();

	$( activeAdPlayer ).removeClass("hide");
	$( idleAdPlayer ).addClass("hide");
};

VideoPlayerHTML5.prototype.forceStopAd = function (){
	var self =this;
	self.forceStopTimer = null;
	debug("force stop ad");
	var player = document.getElementById("ad1");
	debug("No more ads, continue content video");
	self.onAdBreak = false;
	debug("Hide adv " + player.id);
			player.addClass("hide"); // hide ad video
			document.getElementById("adInfo").className = "hide";
			player.pause();

			
			if( self.video == null ){
				debug("(adEnd) video has stopped during ads. exit");
				self.clearVideo();
				return;
			}
			
			if( self.firstPlay ){
				debug("(adEnd)  start video firstPlay is set + " + JSON.stringify(self.firstPlay));
				self.startVideo( self.live );
			}
			else{
				debug("(adEnd) else continue paused video");
				self.video.play();
			}
			debug("(adEnd)  show content video");
			$(self.video).removeClass("hide"); // show content video
		}

		VideoPlayerHTML5.prototype.clearLicenseRequest = function(callback){
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
			var xmlLicenceAcquisition;
			var DRMSysID;
			var self = this;
			if(!this.drm || !this.drm.system) {
				callback();
				return;
			} else if(this.drm.system.indexOf("playready")==0) {
				msgType = "application/vnd.ms-playready.initiator+xml";
				DRMSysID = "urn:dvb:casystemid:19219";		
				xmlLicenceAcquisition =
				'<?xml version="1.0" encoding="utf-8"?>' +
				'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
				'<LicenseServerUriOverride><LA_URL></LA_URL></LicenseServerUriOverride>' +
				'</PlayReadyInitiator>';		
			}
			else if( this.drm.system == "marlin" ){
				msgType = "application/vnd.marlin.drm.actiontoken+xml";
				DRMSysID = "urn:dvb:casystemid:19188";
				xmlLicenceAcquisition =
				'<?xml version="1.0" encoding="utf-8"?>' +
				'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL></URL></RightsIssuer></RightsURL></Marlin>';		
			}
			else if(this.drm.system.indexOf("widevine")==0) {
		msgType = "application/widevine+xml"; // "application/smarttv-alliance.widevine+xml"
		DRMSysID = "urn:dvb:casystemid:19156";
		xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
		'<ContentURL></ContentURL>' +
		'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
		'<DRMServerURL></DRMServerURL>' +
		'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
		'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
		'<UserData></UserData>' +
		'<Portal></Portal><StoreFront></StoreFront>' +
		'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
		'</WidevineCredentialsInfo>';
	} else if( this.drm.system == "clearkey" ){
		callback();
		return;
	}

	try {
		this.oipfDrm.onDRMMessageResult = callback;
	} catch (e) {
		debug("sendLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = callback;
	} catch (e) {
		debug("sendLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("clearLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId=-1;
		if(msgType!="")
			msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("clearLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("sendLicenseRequest Error 3: " + e.message );
		callback();
	}
};

VideoPlayerHTML5.prototype.sendLicenseRequest = function(callback){
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
	}
	else if( this.drm.system == "marlin" ){
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
	else if( this.drm.system == "clearkey" ){
		// do some native players support manifest <LaUrl> field?
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
		debug("sendLicenseRequest Error 3: " + e.message );
		setTimeout( function(){
			self.clearVideo();
			showInfo(e.message);
		}, 1000);
	}	
	
	
	function drmMsgHandler(msgID, resultMsg, resultCode) {
		debug("drmMsgHandler drmMsgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		showInfo("drmMsgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
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
			errorMessage = ("DRM: Uknown MIME type");
			break;
		case 4:
			errorMessage = ("DRM: User Consent Needed");
			break;
		case 5:
			errorMessage = ("DRM: Unknown DRM system");
			break;
		case 6:
			errorMessage = ("DRM: Wrong format");
			break;			
		}
		
		if( resultCode > 0 ){
			showInfo("" + resultCode + " " + errorMessage );
			Monitor.drmError(errorMessage);
		}
	}

	function drmRightsErrorHandler(resultCode, contentId, systemId, issuerUrl) {
		debug("drmRightsErrorHandler resultCode, contentId, sysId, issuerUrl: " + resultCode + "," + contentId + "," + systemId + "," + issuerUrl);
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
		showInfo("" + resultCode + " "+ errorMessage);
		Monitor.drmError(errorMessage);
	}
	

};
VideoPlayerHTML5.prototype.syncdata = function (ms, bucketId){
	debug("Call syncdata with bucketId : "+ bucketId);
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
VideoPlayerHTML5.prototype.changeAVcomponent = function( component ) {
	debug("changeAVcomponent("+ component +")");
	var self = this;
	if (component == self.AVCOMPONENTS.SUBTITLE) {
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


	} catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayerHTML5.prototype.enableSubtitles = function( next ) {
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


	} catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayerHTML5.prototype.createInternalSubtitlesStructure = function (ret){
	try{
		this.buckets = JSON.parse(ret);
	}catch(e){}

	if(this.buckets.length > 0) {
		this.bucketId = 0;
		$("#subtitleButton").show();
	}else{
		debug("Subtitles BUCKET EMPTY");
	}
	
	//GLOBALS.focusmgr.focusObject("videoplayer");

}
VideoPlayerHTML5.prototype.loadSubtitles = function (){
	debug("load subtitles "+this.srtFile);
	var self = this, url = "parseSrt.php?srt_file="+escape(this.srtFile);

	this.req = createHttpRequest(url, function(ret) {
		self.req = null;
		self.createInternalSubtitlesStructure(ret);
		self.bucketId = 0;
		GLOBALS.upperlimit = 0;
	});
}

VideoPlayerHTML5.prototype.getSrtFile = function(subs){
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
	if (location.host == "127.0.0.1") url = "http://195.211.203.122/pub/smarttv/ert/insys_react.php?action=getVideoSub&source="+encodeURIComponent(url);
	//if (location.host == "127.0.0.1") url = "insys_react.php?action=getVideoSubNew&source="+encodeURIComponent(url);
	else url = "insys_react.php?action=getVideoSubNew&source="+encodeURIComponent(url);

	var self = this;
	this.req = createHttpRequest(url, function (ret) {
		self.req = null;

		var subtitles = null;

		if (ret) {
			subtitles = JSON.parse(ret);
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
		if(subtitles){
			self.subtitles= subtitles;
			debug("Subtitles found: "+ self.subtitles);
		}
	});
}
VideoPlayerHTML5.prototype.setSubtitles = function(url){
	debug("setting subtitles");
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
		$("#subtitleButtonText").html( "Subtitles: Off");
	}
	this.getSrtFile(url);
};

VideoPlayerHTML5.prototype.startVideo = function(isLive, ntCall, muted) {
	var self = this;
	if(!ntCall) ntCall=0; // 0=initial, 1=afterDrmLaurlOverride
	debug("startVideo(), " + self.currentItem.title);
	this.subtitleTrack = false
	
	this.resetProgressBar(); // always reset progress bar	
	this.onAdBreak = false;
	this.firstPlay = true;	
	if( isLive ){
		self.live = true;
	} else{
		self.live = false;
	}

	self.muted = muted;

	if(self.muted){
		document.getElementById("videodiv").style.display= "none";
	}else document.getElementById("videodiv").style.display= "block";
	
	
	if( !this.subtitles ){
		this.subtitleTrack = false;
	}
	
		var broadcast = document.getElementById('mybroadcast');
		if( !broadcast ){
			$("body").append("<object type='video/broadcast' id='mybroadcast'></object>");
		}
		broadcast = document.getElementById('mybroadcast');
		debug("broadcast object found");
		debug("playState "+ broadcast.playState);
		if( broadcast.playState != 3 ) { // 0=unrealized, 1=connecting, 2=presenting, 3=stopped
			try{
				broadcast.bindToCurrentChannel();
				debug("bound to current channel");
			} catch(e){
				debug("error bind broadcast");
			}
			try{
				broadcast.stop();
				debug("broadcast stopped");
			} catch(e){
				debug("error stopping broadcast");
			}
		}
	
	this.onAdBreak = false;
	this.firstPlay = true;
	
	try{
		if( !self.video ){
			debug("populate player and create video object");
			self.populate();
			self.createPlayer();
			self.setEventHandlers();
		}
	}
	catch(e){
		debug( "[error in start html5 video]" + e.message );
		debug( "817: " + e.message );
	}

	self.element.removeClass("hidden");
	self.visible = true;
	self.setFullscreen(true);

	
	// first play preroll if present
	var playPreroll = false;
	// check prerolls on first start
	if( self.adBreaks ){
		debug("adbreaks : " + JSON.stringify(self.adBreaks ));
		$.each( self.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == "preroll" ){
				debug("play preroll  " + JSON.stringify(adBreak) );
				adBreak.played = true;
				playPreroll = true;
				debug("adbreak : " + JSON.stringify(adBreak));
				self.getAds( adBreak );
				return false;
			}
		});
		if( playPreroll ){
			return; // return startVideo(). after prerolls this is called again
		}
	}	

	if(this.drm && ntCall==0) setOIPFActiveDRM(self.currentItem);
	
	if( this.drm && this.drm.ready == false ){
		this.sendLicenseRequest( function( response ){
			debug("License ready ", self.drm);
			if( self.drm.ready ){
				self.startVideo(isLive, ntCall+1); // async 2nd call
			} else if( self.drm.error ){
				showInfo( "Error: " + self.drm.error );
			} else {
				showInfo( "Unknown DRM error! " + JSON.stringify( response ));
			}
		} );
		return;
	}
	
	try{
		if( !self.video ){
			debug("populate player and create video object");
			self.populate();
			self.createPlayer();
			self.setEventHandlers();
		}
	}
	catch(e){
		debug( "error on try to create player" + e.message );
		debug( "871 : " + e.message );
	}
	
	try{	
		self.element.removeClass("hidden");
		self.visible = true;
		self.watched.load();
		var position = null; // this.watched.get( self.videoid );
		//debug("position", position );
		if( !self.live && position ){
			self.video.pause();
			debug("video paused");
			showDialog("Resume","Do you want to resume video at position " + toTime( position.position ) , ["Yes", "No, Start over"], function( val ){
				if( val == 0 ){
					self.video.play();
					debug("Seek to resume and play")
					self.video.seek( position.position );
					self.setFullscreen(true);
					self.displayPlayer(6);
				}
				else{
					debug("video.play()")
					self.video.play();

					if(!self.muted){
						self.setFullscreen(true);
						self.displayPlayer(6);
					}

					if(self.muted ) self.mute();
					
				}
			}, 0, 0, "basicInfoDialog");
		}
		else{
			self.video.play();
			if(!self.muted){
				self.setFullscreen(true);
				self.displayPlayer(6);
			}

			if(self.muted ) self.mute();
		}
	}
	catch(e){
		debug("error on trying to play video" +  e.message );
		debug( "908 : " + e.message );
	}
	if (GLOBALS.smid && !this.onAdBreak ) {
		this.smidTimer = setInterval(function () {
			if (self.isPlaying()) {
				if(!self.video) return;
				sendSmid(self, self.state, 0);
			} else {
				clearInterval(self.smidTimer);
			}
		}, 30000);
	}
};

/*VideoPlayerHTML5.prototype.stopAd = function (){
	if (this.middleRollTime) {
			debug('time '+ this.middleRollTime);
			this.setCurrentPos(this.middleRollTime);
			this.middleRollTime = 0;
			this.middleRollDone = 1;
			if (!this.middleTimer)
				this.middleTimer = setInterval( function() { middlerollVideo(self.currentItem["title"]); }, 10 * 60 * 1000);
	}

}*/

VideoPlayerHTML5.prototype.stop = function(){
	//showInfo("Exit Video", 1);	
	document.getElementById("appscreen").style.display = "block";
	document.getElementById("tvbild").removeClass("hidden");
	if(document.getElementById("blackBG")) document.getElementById("blackBG").remove();
	var self = this;

	// ✅ Add watched.set() BEFORE clear
	if (self.video && self.video.currentTime && self.video.duration && ENABLE_WATCHED) {
		self.watched.set(
			Math.floor(self.video.currentTime),     // time watched
			Math.floor(self.video.duration),        // full video duration
			self.currentItem && self.currentItem.id // assume video ID
		);
	}

	// ✅ Save watched list
	self.watched.save();	
	this.onAdBreak = false;
	window.setTimeout(function(){
		if(GLOBALS.lastFocus != "side-menu")
			GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
		else
			GLOBALS.focusmgr.focusObject(returnfocus);
	},200);
	if(!self.video) return; // video tag not found anymore

	/*if(this.ad){
		this.stopAd();
	}*/

	try {

		self.video.pause(); // html5 video tag does not have a stop() function
		debug("video.pause succeed");
		self.clearVideo();
		debug("clearVideo succeed");
		self.resetProgressBar();
		//startRF();
		//GLOBALS.scenemgr.stopBroadcast();
		
	} catch(ex){
		debug("946 : " + ex.description);
	}

	if(self.currentItem.setActiveDRM_drmSystemId)
		setOIPFActiveDRM(null);	
};

VideoPlayerHTML5.prototype.play = function() {
	var self = this;

	try {
		// Load watched data if enabled
		if (typeof PLAYER_WATCHED === "undefined" || PLAYER_WATCHED === 1) {
			const watchedItem = self.watched.get(self.videoid);
			if (watchedItem) {
				debug("[WATCHED] Resuming from " + watchedItem.position + "s");
				self.video.currentTime = watchedItem.position;
			} else {
				debug("[WATCHED] No previous data, playing from start");
			}
		} else {
			debug("[WATCHED] Disabled, playing from start");
		}

		self.video.play();
		self.displayPlayer(6);
	} catch (e) {
		debug("Error at HTML5 play(): " + e.message);
	}
};

VideoPlayerHTML5.prototype.mute = function (){
	var self = this;
	self.muted = true;
	try{
		document.getElementById("videodiv").style.display = "none";
		$("#player").removeClass("show");
		$("#player").addClass("hide");
		if(!GLOBALS.lastFocus){
			if(GLOBALS.focusmgr.currentFocus) GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
			else  GLOBALS.lastFocus = "cat-list-0";
		}
		debug("Mute put focus on : " +GLOBALS.lastFocus , "yellow");
		window.setTimeout(function(){
			GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus, true);
		},200);
	}
	catch(e){
		debug(e);
	}
}

VideoPlayerHTML5.prototype.clearVideo = function(){	
	var self = this;
	self.element.addClass("hidden");
	$("#player").removeClass("show");
	self.visible = false;
	self.bingeCancelled = false;
	clearInterval(self.smidTimer);
	try{
		if(self.video){
			self.video.pause();
			self.video.src = "";
			$( "#video2" ).remove(); // clear from dom
			this.video = null;
		}
		/*if( $("#mybroadcast")[0] ){
			$("#mybroadcast")[0].bindToCurrentChannel();
		}*/
	}
	catch(e){
		debug("Error at clearVideo()");
		debug( e.description );
	}
	document.getElementById("subs-container").innerHTML = "";
	this.clearAds();	
	this.subtitles = null;
	this.buckets = null;
	this.subtitlesEnabled = false;

	$("#subtitleButton").hide();
	this.clearLicenseRequest( function(msg){
		//destroyOIPFDrmAgent();
		debug("License cleared:" + msg);
	});
	
};
VideoPlayerHTML5.prototype.clearAds = function(){
	if( self.adPlayer ){
		try{
			self.adPlayer[0].stop();
		} catch(e){ debug("Error at clearAds(): " + e.message); }
		try{
			self.adPlayer[1].stop();
		} catch(e){ debug("Error at clearAds(): " + e.message); }
		try{
			$( self.adPlayer[0] ).addClass("hide");
			$( self.adPlayer[1] ).addClass("hide");
			self.adPlayer[0].src = "";
			self.adPlayer[1].src = "";
		} catch(e){ debug("Error at clearAds(): " + e.message); }
		
		self.adPlayer = null;
		self.onAdBreak = false;
		self.adBreaks = null;
		self.adBuffer = null;
		self.adCount = 0;
	}
	$( "#ad1" ).remove(); // clear from dom
	$( "#ad2" ).remove(); // clear from dom
	$( "#adInfo" ).remove(); // clear from dom
};

VideoPlayerHTML5.prototype.isFullscreen = function(){
	var self = this;
	return self.fullscreen;
};

VideoPlayerHTML5.prototype.isPlaying = function(){
	return ( this.video && !this.video.paused ); // return true/false
};

VideoPlayerHTML5.prototype.getAudioTracks = function(){
	if(location.host == "127.0.0.1") return true;
	try{
		var tracks = this.video.audioTracks;
		return tracks.length;
	} catch(e){
		debug("1033: " + e.message);
		return 0;
	}
}




