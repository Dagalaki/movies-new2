/**
 * Videoplayer common superclass impelmentation for all inherited versions. Common interface that can be extended and specified
 * 
 * 
 *
 * @class VideoPlayerBasic
 * @constructor
 */
function VideoPlayerBasic(element_id, profile, width, height){
	
	this.onExtraBtns = 0;
	this.onInfo = 0;
	this.extraFocusedId = 0;

	this.FILETYPES = {
		MP4:0,
		MPEG:1,
		DASH:2
	};
	this.AVCOMPONENTS = {
		VIDEO : 0,
		AUDIO : 1,
		SUBTITLE : 2
	};
	
	/*this.ad = false;
	this.middleRollTime = 0;
	this.middleTimer = null;
*/
	this.currentItem = null; // set by menu.js:prepareVideoStart(), config.json item
	this.audioTrack = false;
	this.subtitleTrack = false;
	
	this.element_id = element_id;
	this.element = document.getElementById(element_id);
	if(!this.element){
		this.element = document.createElement("div");
		this.element.setAttribute("id", this.element_id);
	}

	$(this.element).addClass("hidden");
	//this.element.style.position="relative";
	this.fullscreenElement = this.element;
	this.width = width;
	this.height = height;
	this.visible = false;
	this.url = null;
	this.video = null;
	this.profile = profile;
	this.timeInMilliseconds = false;

	// Timers and intervals
	this.progressUpdateInterval = null;
	this.hidePlayerTimer = null;
	this.seekTimer = null;
	this.seekValue = 0;
	this.segment = 10;
	
	/**
	 * Creates player component and sets up event listeners
	 * Basic version is left empty and inherited players must define this method for all different players creation
	 * @method createPlayer
	**/
	this.createPlayer = this.__proto__.createPlayer;
	
	/**
	 * Basic video player populate method to initialize player html elements ready for setting up
	 * @method populate
	**/
	this.populate = function(){
		this.element.innerHTML = "";
		this.video = null;
		this.loadingImage = document.createElement("div");
		this.loadingImage.setAttribute("id", "loadingImage");
		this.loadingImage.addClass("hidden");
		this.element.appendChild(this.loadingImage);
		this.setFullscreen(true);
	};
	 	

	/**
	 * Displays player over video. Player shows current play position, duration and buttons that can be used
	 * @param {Int} sec. seconds player is displayed on screen and hidden after. If sec is not defined player remains on screen and is not hidden.
	 * @method displayPlayer
	 */
	this.displayPlayer = function( sec ){
		if (this.onAdBreak)
			return;
		var self=this;
		if(this.currentItem) {
			$("#player>#playText").text(this.currentItem.title);
			debug("Current item=" + this.currentItem.title
				+"\n"+this.url
				+"\ndrm="+this.currentItem.drm + " " + this.currentItem.la_url);
		} else {
			$("#player>#playText").text("");
		}
		if(self.live){
			$('#player').addClass("live");
			$('#playposition').addClass("hide");
			$('#playtime').addClass("hide");
			$('#progress_currentTime').addClass("hide");
			$('#progressbarbg').addClass("hide");
			$('#progressSeekable').addClass("hide");
			$('#progressbar').addClass("hide");
			$('#extra-btns').addClass("hide");
			$('#prew').addClass("hide")
			$('#pff').addClass("hide");
			$('#ppauseplay .vcrbtn').addClass("hide");
			if($(".live-label").length == 0){
				$('#ppauseplay').append($("<span class='live-label'>LIVE</span>"));
			}
			if($(".arrowBg").length == 0){
				$('#player').append($("<div class='arrowBg'></div><div class='arrowIcon'></div>"));
			}
			$('.stream-epg-container').removeClass("hide");
			$('.arrowIcon').removeClass("hide");
			$('.arrowBg').removeClass("hide");
		}else{
			$('#player').removeClass("live");
			$('#playposition').removeClass("hide");
			$('#playtime').removeClass("hide");
			$('#progress_currentTime').removeClass("hide");
			$('#progressbarbg').removeClass("hide");
			$('#progressSeekable').removeClass("hide");
			$('#progressbar').removeClass("hide");
			$('#extra-btns').removeClass("hide");
			$('#prew').removeClass("hide")
			$('#pff').removeClass("hide");
			$('#ppauseplay .vcrbtn').removeClass("hide");
			$('#ppauseplay .live-label').addClass("hide");
			$('.stream-epg-container').addClass("hide");
			$('.arrowIcon').addClass("hide");
			$('.arrowBg').addClass("hide");
		}
		clearTimeout( this.hidePlayerTimer );
		$("#player").removeClass("hide");
		$("#player").addClass("show");
		if (document.getElementById("subs-container"))
			document.getElementById("subs-container").addClass('openplayer');
		
		if(sec){
			this.hidePlayerTimer = setTimeout( function(){
				$("#player").removeClass("show");
				self.onExtraBtns = false;
				var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
				btns[self.extraFocusedId].removeClass("focused");
				if (document.getElementById("subs-container"))
					document.getElementById("subs-container").removeClass('openplayer');
				if(self.timelinePreview) {
					$('.thumbnail').css("display","none");
				}
			}, sec * 1000);
		}
	};
	
	this.setFocusOnExtraBtn = function(){
		var self = this;
		debug("focus extra to "+self.extraFocusedId);
		var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
		for(var i=0; i<btns.length; i++){
			if(i == self.extraFocusedId){
				btns[i].addClass("focused");
			}else{
				btns[i].removeClass("focused");
			}
		}
	}

	this.navigateBottom = this.__proto__.navigateBottom || function(key){
		var self = this;
		var btnsSize = 2;
		if (self.onAdBreak)
			return;
		if (!self.currentItem.subs)
			btnsSize--;
		
		if( dialog && dialog.open ){
			navigateDialog( key );
			return;
		}
		self.displayPlayer();
		switch(key){
			case VK_UP:
				self.displayPlayer(4);
				self.onExtraBtns = false;
				var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
				btns[self.extraFocusedId].removeClass("focused");
				break;
			case VK_DOWN:
				if(!self.live) break;
				self.onExtraBtns = false;
				var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
				btns[self.extraFocusedId].removeClass("focused");
				$("#player").addClass("offset");
				self.onEpgList = true;
				self.dayIndex = self.dayFocusedId = 0;
				self.setFocusOnEpg();
				break;
			case VK_RIGHT:
				self.extraFocusedId++;
				if(self.extraFocusedId >= btnsSize) self.extraFocusedId = btnsSize -1;
				debug("nav bottom extra to: "+self.extraFocusedId);
				self.setFocusOnExtraBtn();
				break;
			case VK_LEFT:
				self.extraFocusedId--;
				if(self.extraFocusedId < 0) self.extraFocusedId = 0;
				self.setFocusOnExtraBtn();
				break;
			case VK_ENTER:
				switch(self.extraFocusedId) {
					case 0:
						debug("Push back button");
						self.stop();
						GLOBALS.vplayer.onExtraBtns = false;
						$("#player").removeClass("show");
						//self.removeNextEpisodeOverlay();
						break;
					case 3: //star
						break;
					case 1: 
						try{
							if( typeof this.enableSubtitles  == "function" ){
								this.changeAVcomponent( this.AVCOMPONENTS.SUBTITLE );
								if($('#extra-btn2').hasClass("active")) $('#extra-btn2').removeClass("active");
								else $('#extra-btn2').addClass("active");
								this.displayPlayer(4);
							}
						} catch( e ){
							console.log(e);
							debug( "246 error :" + e.message );
						}
						break;
					case 2: //info
						self.onExtraBtns = false;
						if (self.onInfo) {
							self.onInfo = 0;
							$('.playerbg').css('display', 'none');
							$('.playerinfo').css('display', 'none');
						} else {
							var item = GLOBALS.item;
							self.infotop = 60; // initial top
							var s = '<div class="info-sub">'+ item.category +' &gt; '+ (item.section?item.section:item.title) +'</div>';
							s += '<div class="info-title">'+ (item.episode?item.episode:item.title) +'</div>';
							s += '<div class="info-descr">'+ $(".show-description").html()+'</div>';
							$("#player").removeClass("show");
							$('.playerbg').css('display', 'block');
							$('.playerinfo').css('display', 'block');
							$('.playerinfo').html(s);
							self.onInfo = 1;
							self.descr = $('.playerinfo');
							self.descr.css('top', self.infotop + "px");
						}
						break;
					case 4: //more
						break;
					case 5: //next
						break;
				}
				break;
			case VK_BACK:
			case VK_STOP:
			case 8: // for edge backspace button
			self.stop();
			if (!VIDEO_PREVIEW) {
				startRF();
			}else {
				if (GLOBALS.videopreview) {

					setTimeout(function(){
						if (GLOBALS.videopreview) GLOBALS.videopreview.resumeFromMain();
					}, 1000);	
				}
			}
				$("#player").removeClass("show");
				this.removeNextEpisodeOverlay();
				self.onExtraBtns = false;
				if($('#extra-btn2').hasClass("active")) $('#extra-btn2').removeClass("active");
				// if (self.live) {
				// 	window.location.href = '/index.php?s='+ ON_Channel;
				// }
				return false;
			break;
			default:
				break;
		}
	}
	this.epgScrollToFocused = function() {
		var self = this;
		var epgCont = $('.stream-epg-container');
		var newPos = (self.dayIndex * -410) + 550;
		epgCont.css("top", newPos + "px");
		self.dayFocusedId = 0;
	};

	this.setFocusOnEpg = function(){
		var self = this;
		debug("focus epg to "+self.dayIndex+" "+self.dayFocusedId);
		var btns = $('#day-'+self.dayIndex+' .epg-item');
		if(self.dayFocusedId >= 1 && self.dayFocusedId < btns.length - 1){
			$('#day-'+self.dayIndex).css("left", ((self.dayFocusedId - 1) * -220) +"px");
		}
		
		for(var i=0; i < btns.length; i++){
			if(i == self.dayFocusedId){
				btns[i].addClass("focused");
			}else{
				btns[i].removeClass("focused");
			}
		}
	}

	this.navigateEpg = this.__proto__.navigateEpg || function(key){
		var self = this;
		var btnsSize = 6;
		if (self.onAdBreak)
			return;
		
		if( dialog && dialog.open ){
			navigateDialog( key );
			return;
		}

		switch(key){
			case VK_UP:

				$('#day-'+self.dayIndex).children().eq(self.dayFocusedId).removeClass('focused');
				$('#day-'+self.dayIndex).css("left","0px");
				self.dayIndex--;
				if(self.dayIndex < 0){
					self.onExtraBtns = false;
					self.onEpgList = false;
					self.displayPlayer(4);
					$("#player").removeClass("offset");
					$('.stream-epg-container').css("top","");
					$('.arrowIcon').removeClass("up");
					$('.arrowBg').removeClass("up");
					break;
				}
				self.epgScrollToFocused();
				self.setFocusOnEpg();
				break;
			case VK_DOWN:
				$('#day-'+self.dayIndex).children().eq(self.dayFocusedId).removeClass('focused');
				$('#day-'+self.dayIndex).css("left","0px");
				$('.stream-day').length
				self.dayIndex++;
				if(self.dayIndex > $('.stream-day').length - 1)
					self.dayIndex = $('.stream-day').length - 1;

				self.epgScrollToFocused();
				self.setFocusOnEpg();
				break;
			case VK_RIGHT:
				self.dayFocusedId++;
				if(self.dayFocusedId >= $('#day-'+self.dayIndex+' .epg-item').length) self.dayFocusedId = $('#day-'+self.dayIndex+' .epg-item').length - 1;
				debug("nav bottom epg to: "+self.dayFocusedId);
				self.setFocusOnEpg();
				break;
			case VK_LEFT:
				self.dayFocusedId--;
				if(self.dayFocusedId < 0) self.dayFocusedId = 0;
				debug("nav bottom epg to: "+self.dayFocusedId);
				self.setFocusOnEpg();
				break;
			case VK_BACK:
				self.onExtraBtns = false;
				self.onEpgList = false;
				self.displayPlayer(4);
				$("#player").removeClass("offset");
				$('.stream-epg-container').css("top","");
				$('.arrowIcon').removeClass("up");
				$('.arrowBg').removeClass("up");
				break;
			case VK_ENTER:
				break;
			default:
				break;
		}
	}

	/**
	 * Handles navigation during video playback. This super class method may be re-defined on inherited class
	 * @param {Int} key. keycode of pressed key. Keycodes are defined in keycodes.js file
	 * @method navigate
	 */
	/* Use inherited basic method or player specified */
	this.navigate = this.__proto__.navigate || function(key){
		var self = this;
		if (self.onAdBreak){
			if(key == VK_BLUE){
				if(document.getElementById("debug").style.display == "none") 
		            document.getElementById("debug").style.display = "block";
		        else if(document.getElementById("debug").style.display == "block") document.getElementById("debug").style.display = "none";
			}
			return;
		}
		if (self.onInfo) {
			if (key == VK_UP) {
				if (self.infotop == 60) {
					return;
				}
				self.infotop += 30;
				self.descr.css('top', self.infotop + "px");
			} else if (key == VK_DOWN) {
				if (Math.abs(self.infotop) >= self.descr.prop('scrollHeight') - 190)
					return;
				self.infotop -= 30;
				self.descr.css('top', self.infotop + "px");
			} else {
				self.onInfo = 0;
				$('.playerbg').css('display', 'none');
				$('.playerinfo').css('display', 'none');
			}
			return;
		}
		
		if( dialog && dialog.open ){
			navigateDialog( key );
			return;
		}
		
		if( self.onAdBreak ){
			debug("Navigation on ad break");
		}
		
		// this       = VideoPlayerEME, VideoPlayer(oipf) instance
		// this.video = HTMLVideoElement
		// this.player= DashJSPlayer instance

		if(!$('#player').hasClass("show")){
			self.displayPlayer(4);
			return;
		}
		switch(key){
			case VK_BLUE:
				if(document.getElementById("debug").style.display == "none") 
		            document.getElementById("debug").style.display = "block";
		        else if(document.getElementById("debug").style.display == "block") document.getElementById("debug").style.display = "none";
		        
				break;
			
			case VK_UP:
				self.displayPlayer(4);
			break;

			case VK_DOWN:
				if(!self.live){
					self.displayPlayer();
					self.onExtraBtns = true;
					self.extraFocusedId = 1;
					if (!self.currentItem.subs)
						self.extraFocusedId--;
					self.setFocusOnExtraBtn();
				}else{
					self.onExtraBtns = false;
					var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
					btns[self.extraFocusedId].removeClass("focused");
					$("#player").addClass("offset");
					$('.arrowIcon').addClass("up");
					$('.arrowBg').addClass("up");
					self.onEpgList = true;
					self.dayIndex = self.dayFocusedId = 0;
					self.setFocusOnEpg();
				}
			break;
			case VK_GREEN:
			case VK_BACK:
			case VK_STOP:
			case 8: // for edge backspace button
			self.stop();
			if (!VIDEO_PREVIEW) {
				startRF();
			}
			else{
				GLOBALS.videopreview.play();
			}
				$("#player").removeClass("show");
				this.removeNextEpisodeOverlay();
				self.onExtraBtns = false;
				if($('#extra-btn2').hasClass("active")) $('#extra-btn2').removeClass("active");
				// if (self.live) {
				// 	window.location.href = '/index.php?s='+ ON_Channel;
				// }
				return false;
			break;

			case VK_LEFT:
				if(this.nextEpisodeOverlay){
					this.nextEpisodeSelection = 0;
					$(".nextEpisodeButton.load").removeClass("focused");
					$(".nextEpisodeButton.cancel").addClass("focused");
					self.displayPlayer(4);
					break;
				}
			case VK_REWIND:
				if( !self.onAdBreak  && !self.live){
					self.seek( this.timelinePreview?-10:-30 );
					self.displayPlayer(4);
				}
				break;
			case VK_RIGHT:
				if(this.nextEpisodeOverlay){
					this.nextEpisodeSelection = 1;
					$(".nextEpisodeButton.cancel").removeClass("focused");
					$(".nextEpisodeButton.load").addClass("focused");
					self.displayPlayer(4);
					break;
				}
			case VK_FAST_FWD:
				if( !self.onAdBreak && !self.live){
					self.seek( this.timelinePreview?10:30 );
					self.displayPlayer(4);
				}
				break;
			case VK_ENTER:
			//case VK_PLAY_PAUSE:
			case VK_PAUSE:
			case VK_PLAY:
				if(self.live) break;
				if( !self.onAdBreak ){

					if(this.nextEpisodeOverlay){
						if(!this.nextEpisodeSelection){
							this.removeNextEpisodeOverlay();
							this.displayPlayer(4);
							this.bingeCancelled = true;
							break;
						}else{
							this.playNextEpisode();
						}
					}

					var pauseplay = document.querySelector("#ppauseplay");
					if( this.isPlaying() ){
						this.pause();
						if(pauseplay){
							pauseplay.removeClass("pause");
							pauseplay.addClass("play");
						}
					}
					else{
						this.play();
						if(pauseplay){
							pauseplay.removeClass("play");
							pauseplay.addClass("pause");
						}
					}
				}
			break;
			case VK_YELLOW:
				try{
					
					if(0 &&  this.video.textTracks ){
						var isEME=this.constructor.name=="VideoPlayerEME";
						
						// count all tracks except metadata
						var tracks = 0;
						var metadataTracks = [];
						var firstTextTrack = null;
						try{
							if(isEME) {
								tracks = this.getTextTracks(); // counter
								if(tracks>0) firstTextTrack=0;
							} else {							
								for( var i = 0; i < this.video.textTracks.length; ++i ){
									if( this.video.textTracks[i].kind != "metadata" ){
										if( firstTextTrack === null )
											firstTextTrack = i;
										tracks++;
										this.video.textTracks[i].mode = 'hidden'; // hide all
									} else {
										metadataTracks.push(i);
									}
								}
							}
						} catch(e){
							debug("error : " + e.message);
						}
						
						debug("switch text track, tracks " + tracks);
						//debug("metaDataTracks ", metadataTracks );
						if( !tracks ){
							showInfo("No Subtitles Available");
							break;
						}
						
						if( this.subtitleTrack === false )
							this.subtitleTrack = firstTextTrack;
						
						var lang;
						if(isEME) {	
							this.subtitleTrack = this.subtitleTrack >= tracks ? firstTextTrack : this.subtitleTrack+1;
							this.setTextTrack(this.subtitleTrack);
							lang = this.getCurrentTextTrack();
							if(lang=="undefined") lang="off";						
						} else {
							if( this.subtitleTrack >= tracks ){
								this.subtitleTrack = firstTextTrack; // current one was "off", select 1st track
							} else {
								this.video.textTracks[ this.subtitleTrack ].mode = 'hidden'; // hide current
								do{
									this.subtitleTrack++;
								} while( metadataTracks.indexOf( this.subtitleTrack ) != -1 );								
							}
							lang = (this.subtitleTrack >= tracks? "off" : this.video.textTracks[ this.subtitleTrack ].language );
							if(lang!="off")
								this.video.textTracks[ this.subtitleTrack ].mode = 'showing';
						}
						
						$("#subtitleButtonText").html( "Subtitles: " + lang );
						showInfo("Subtitles: " + lang);						
						if( lang != "off" )
							debug("Set textTrack["+ this.subtitleTrack +"] Showing: " + lang);
					}
					else if( typeof this.enableSubtitles  == "function" ){
						this.changeAVcomponent( this.AVCOMPONENTS.SUBTITLE );
						//this.enableSubtitles(true);
					}
				} catch( e ){
					console.log(e);
					debug( "246 error :" + e.message );
				}
			break;
			
			case VK_GREEN:
				try{
					if( this.getAudioTracks() > 1 ){
						var isEME=this.constructor.name=="VideoPlayerEME";
						if( isEME || this.video.audioTracks ){
							debug("switch audio track");
							if( this.audioTrack === false ) {
								this.audioTrack = 0;
							}
							
							var tracks = isEME ? this.getAudioTracks() : this.video.audioTracks.length;	 // counter
							if( this.audioTrack >= tracks ){
								this.audioTrack = 0; // was off(muted), select first and unmute audio
							} else {
								this.audioTrack++;
							}
							
							var lang;
							if(isEME) {
								if(this.audioTrack == tracks) {
									this.player.setMute(true);
									lang="Muted";
								} else {
									var track = this.player.getTracksFor("audio")[this.audioTrack];
									lang = track.lang;
									this.player.setCurrentTrack(track);
									this.player.setMute(false);
								}
							} else {
								for (var i = 0; i < this.video.audioTracks.length; i += 1) {
									this.video.audioTracks[i].enabled = false;
								}
								var muted = ( this.audioTrack == tracks );
								if( !muted ){
									this.video.audioTracks[this.audioTrack].enabled = true;
								}
								lang = (muted? "Muted" : this.video.audioTracks[this.audioTrack].language );
							}
							debug("audiotracks " + tracks + ", current: "+this.audioTrack + ", " + lang);
							
							$("#audioButtonText").html( "Audio: " + lang );
							showInfo("Audio: " + lang);
						} else{
							this.changeAVcomponent( this.AVCOMPONENTS.AUDIO );
						}
					} else if( this.getAudioTracks() == 1 ) {
						showInfo("Current audio track (1/1): " + this.getCurrentAudioTrack() );
					} else {
						showInfo("No audio tracks available");
					}
				} catch( e ){
					debug( "301 error: " + e.message );
				}
			default:
			break;
		}
	};
	
	/**
	 * 
	 * @param {HTML Element} container. Container for video display. Video will be set inside the container 
	 * @method setDisplay
	 */
	this.setDisplay = function( container ){
		/*
		if( container ){
			// detach from DOM
			var element = $(this.element).detach();
			element.addClass("hidden");
			// append into
			$(container).prepend( element );
			element.removeClass("hidden");
		}
		else{
			// if target not set, assume to set fullscreen
			this.setFullscreen(true);
		}
		*/
	};
	
	this.getCurrentAudioTrack = this.__proto__.getCurrentAudioTrack || function(){
		return "default";
	};
	
	
	/**
	 * 
	 * @param {Object} subtitles. Creates HTML track objects for Out-Of-Band subtitle files
	 * @method setSubtitles
	 */
	this.setSubtitles = this.__proto__.setSubtitles || function( subtitles ){
		// out-of-band subtitles must be an array containing containing language code and source.xml file url.
		var self = this;
		try{
			var player = this.video;
			
			debug("set subs from active assets metadata 'subtitles'");
			this.subtitles = subtitles;
			debug("subtitles: "+JSON.stringify(this.subtitles) );
			
			if( this.subtitles && this.subtitles.length ){
				$.each( this.subtitles, function(i, lang){
					debug("Subtitles " + i + ": " + lang.code + " - " + lang.src);
									
					var track = document.createElement("track");
					track.kind = "subtitles";
					track.label = lang.code;
					track.language = lang.code;
					// https://www.w3schools.com/tags/ref_language_codes.asp
					//if (lang.code=="eng") lang.isocode="en";
					//else if (lang.code=="fin") lang.isocode="fi";
					//else if (lang.code=="swe") lang.isocode="sv";
					//else if (lang.code=="ger") lang.isocode="de";
					track.srclang = lang.code; //lang.isocode;
					track.src = lang.src;
					track.onerror = function(e){
						self.lastError = e;
						debug("track.onerror: "+JSON.stringify(e));
						//showInfo("Error getting subtitle file");
					};					
					player.appendChild(track);
				} );
				$("#subtitleButton").show();
				$("#subtitleButtonText").html( "Subtitles: " + player.textTracks[0].label );
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
			debug("Error: setSubtitles: " + e.description );
		}
	};
	/**
	 * 
	 * Pause video playback and display player on screen
	 * @method pause
	 */
	this.pause = this.__proto__.pause || function(){
		debug("VideoPlayerBasic pause");
		var self = this;
		try{
			self.video.pause();
			self.displayPlayer();
		}
		catch(e){
			debug(e);
		}
	};
	
	/**
	 * 
	 * @param {bool} loading. Sets player's loading indicator visible if true, and hides if false
	 * @param {String} reason. logs reason for loading if specified
	 * @method setLoading
	 */
	this.setLoading = function(loading, reason){
		this.loading = loading;
		if(this.loading){
			this.loadingImage.removeClass("hidden");
		}
		else{
			this.loadingImage.addClass("hidden");
		}
		if(reason){
			debug(reason);
		}
	};
	
	/**
	 * 
	 * @param {bool} fs. Set video fullscreen if true, and to the active asset box if false
	 * @method setFullscreen
	 */
	this.setFullscreen = function(fs){	
			
		this.fullscreen = fs;
		if(fs){
			this.element.addClass("fullscreen");
			//this.setDisplay( $("body")[0] ); // sets video player object to child of body
		}
		else{
			this.element.removeClass("fullscreen");
			//this.setDisplay( menu.focus.element ); // sets video player object to child of focused tile element
			$("#player").removeClass("show");
		}
	};
	
	/**
	 * 
	 * returns true if player is visible
	 * @method isVisible
	 */
	this.isVisible = function(fs){
		return this.visible;
	};
	
	/**
	 * 
	 * Resets progressbar and time to initial state
	 * @method resetProgressBar
	 */
	this.resetProgressBar = function(){
		try{
			var self = this;
			$("#progressbar")[0].style.width = "0px";
			$("#playposition").css("left", "0px");
			$("#progress_currentTime").css("left", "0px");
			$("#playposition").html( "00:00:00" );
			

			document.getElementById("playtime").innerHTML = "";
			
			if( self.live ){
				document.getElementById("playtime").innerHTML = "LIVE";
			}
			else{
				document.getElementById("playtime").innerHTML = "00:00:00";
			}
			
		} catch(e){
			debug( "475 error : " + e.message );
		}
	};
	function roundNearest(positionInSeconds) {
		var roundedPosition = Math.round(positionInSeconds / 10) * 10;
		return roundedPosition;
	}
	function roundNearestMS(positionInSeconds) {
		var roundedPosition = Math.round(positionInSeconds / 10000) * 10000;
		return roundedPosition;
	}
	/**
	 * 
	 * Updates progress bar. Progress bar is only visible when player UI is displayed, but it is always updated non-visible when this method is called
	 * @method updateProgressBar
	 */
	this.updateProgressBar = function( sec ){
		var position = 0;
		var duration = 0;
		var pbMaxWidth = 895; // progress bar maximum width in pixels
		
		// first try get time out of player and decide which player is used
		try{
			
			if( this.live ){
				duration = 100;
				position = 100;
				
				var time = this.time();
				
				duration = time.duration;
				position = time.position;
			}
			else{
				// <video> object used
				var time = this.time();
				if(this.video && this.video.duration ){
					position = (sec ? sec + (this.timelinePreview?roundNearest(this.video.currentTime):this.video.currentTime) : this.video.currentTime);
					duration = this.video.duration;
				}
				// oipf player object used. Convert milliseconds to seconds
				else if(this.video && this.video.playTime ){
					position = (sec? (this.timelinePreview?roundNearest(this.video.playPosition / 1000):this.video.playPosition / 1000) + sec : this.video.playPosition / 1000);
					duration = this.video.playTime / 1000;
				} else {
					//debug("Videoplayer not ready. Can not get position or duration");
					return;
				}
			}
		} catch(e){
			debug( e.message );
		}
		
		try{
			var self = this;

			pbar = document.getElementById("progressbar");

			var barWidth=0;
			if(duration!=0) barWidth = Math.floor((position / duration) * pbMaxWidth );
			if(barWidth > pbMaxWidth){
				barWidth = pbMaxWidth;
			}
			else if( barWidth < 0 ){
				barWidth = 0;
			}
			
			pbar.style.width = barWidth + "px";
			
			var play_position = barWidth;
			
			//debug(  play_position, position, duration );
			
			$("#playposition").css("left", play_position);
			$("#progress_currentTime").css("left", play_position);

			if(self.timelinePreview){
				var pos = position, imgNo = (pos)/this.segment;
				var row = Math.floor(imgNo/5);
				var col = Math.floor(imgNo%5);
				$('.thumbnail').css("background-position","-"+(col*160)+"px "+"-"+(row*90)+"px");
			}
			
			$("#playposition").html("");
			if(position){
				var pp_hours = Math.floor(position / 60 / 60);
				var pp_minutes = Math.floor((position-(pp_hours*60*60)) / 60);
				var pp_seconds = Math.round((position-(pp_hours*60*60)-(pp_minutes*60)));
				$("#playposition").html( addZeroPrefix(pp_hours) + ":" + addZeroPrefix(pp_minutes) + ":" + addZeroPrefix(pp_seconds) );
			}

			document.getElementById("playtime").innerHTML = "";
			if(duration){
				if( duration == Infinity || self.live ){
					document.getElementById("playtime").innerHTML = "LIVE";
				}
				else{
					var pt_hours = Math.floor(duration / 60 / 60);
					var pt_minutes = Math.floor((duration-(pt_hours*60*60))  / 60);
					var pt_seconds = Math.round((duration-(pt_hours*60*60)-(pt_minutes*60)) );
					document.getElementById("playtime").innerHTML = addZeroPrefix(pt_hours) + ":" + addZeroPrefix(pt_minutes) + ":" + addZeroPrefix(pt_seconds);
				}
			}
		} catch(e){
			debug("567 error: "  + e.message );
		}

	};
	
	/**
	 * 
	 * @param {String} system. Specifies DRM system to be used as a string value (for example playready or marlin)
	 * @param {String} la_url. DRM lisence url
	 * @method setDRM
	 */
	this.setDRM = function( system, la_url){
		if( !system ){
			this.drm = null;
		}
		else{
			//debug("setDRM("+ system +", "+la_url+")");
			this.drm = { la_url : la_url, system : system, ready : false, error : null};
		}
	};
	
	/**
	 * 
	 * @param {Object} breaks. Sets ad break positions, and ad amount to be requested as a list of objects with needed attributes
	 * @method setAdBreaks
	 */
	this.setAdBreaks = function( breaks ){
		if( !breaks){
			this.adBreaks = null;
		}
		else{
			//debug("setAdBreaks(", breaks ,")");
			this.adBreaks = $.extend(true, {}, breaks);
		}
	};
	
	
	/**
	 * Return players playback position and duration as an object with duration and position value.
	 * Times are represented in seconds for all players
	 * @method time
	 * @returns (Object) { duration : \d+, position : \d+ }
	 */
	this.time = function(){
		try{			
			if( this.timeInMilliseconds && this.video.playTime ){
				return { duration : this.video.playTime/1000, position : this.video.playPosition/1000 };
			}
			else if( this.video.duration ){
				return { duration : this.video.duration, position : this.video.currentTime };
			}
			else{
				//debug("timedata not available")
				return { duration : 0, position : 0 }; // timedata not available
			}
			
		} catch(e){
			//debug("error getting playback position and duration");
			return { duration : 0, position : 0 };
		}
		
	}
	
	/**
	 * Perform seek operation. To be called when user presses seek button. 
	 * Timeout is set to wait for continious seek operations before actual seeking
	 * If this is called multiple times the value to be seeked is added up.
	 * After delay of 700ms the seek is performed
	 * @method seek
	 * @param (Int) sec: How many seconds is seeked. Positiove integer for forward, negative for rewind.
	 */
	this.seek = function( sec ){

		debug("seek: " + sec);
		var self = this;
		try{			
			//debug( this.time(), this.seekValue, sec );
			// if seek value goes below zero seconds, do immediate seek
			if( this.time().position + (this.seekValue + sec) < 0 ){
				//debug("seek br1");
				//debug( "seek below starting position. go to start" );
				clearTimeout( this.seekTimer );
				this.updateProgressBar( -this.time().position );
				self.video.seek( -( self.timeInMilliseconds? this.time().position * 1000 : this.time().position ) );
				self.seekValue = 0;
				clearTimeout( this.seekTimer );
				self.seekTimer = null;
				return;
			}
			
			// if seek value goes above playtime, do not add seek seconds
			if( this.time().position + (this.seekValue + sec) > this.time().duration ){
				//debug("seek br2");
				//debug("this.time().position : "+ this.time().position);
				//debug("this.seekValue: " + this.seekValue);
				//debug("this.time().duration" + this.time().duration);
				return;
			}
			
			this.seekValue += sec;
			
			debug("seek video "+ this.seekValue +"s");
			this.updateProgressBar( self.timelinePreview?roundNearest( self.seekValue ) : self.seekValue);
			clearTimeout( this.seekTimer );
			
			this.seekTimer = setTimeout( function(){
				//debug("perform seek now!");
				self.seekTimer = null;
				try{
					// if oipf player, form toSeek value absolute
					//debug("timeInMS:"+self.timeInMilliseconds+" preview enabled:"+self.timelinePreview);
					var toSeek = (self.timeInMilliseconds? ( self.timelinePreview?roundNearestMS(self.video.playPosition) + (self.seekValue * 1000):self.video.playPosition + (self.seekValue * 1000) ) : (self.timelinePreview?roundNearest(self.seekValue):self.seekValue));					
					//debug("seekValue: " + toSeek);
					self.video.seek( toSeek );
					Monitor.videoSeek( self.seekValue );
					//debug("seek completed to " + toSeek);
				} catch(e){
					debug("seek failed: " + e.description);
				}
				
				self.seekValue = 0;
			}, 700);
			if(self.timelinePreview) {
				llog("yes");
				$('.thumbnail').css("display","block");
			}else llog("no");
			var buttonActivated = ( sec < 0? "prew" : "pff" );
			$("#prew, #pff" ).removeClass("activated");
			$("#" + buttonActivated ).addClass("activated");
			clearTimeout( this.seekActiveTimer );
			this.seekActiveTimer = setTimeout( function(){
				$("#prew, #pff" ).removeClass("activated");
			}, 700);
		}
		catch(e){
			debug( "692 error: " + e.message);
			debug(e.description);
		}
	};

	
	/******************************
	MEMORY / Watched playpositions to cookies

	watched object shall hold up to 5 play positions of the watched videos (latest one on each latest series).

	watched.list : list of watched assets holding last play position (playtime) and timestamp (ts) when updated
	watched.set( time, duration ) : sets play position for video (with unique id).
	watched.get( id ) : gets play position and timestamp of a video (id), eg. { playtime : 12000, ts : 1438337491707 }
	watched.save() : saves list to cookie
    watched.delete() : delete watched cookie
	
	*******************************/
this.watched = {
		list : [],
		current : null,
		set : function( time, duration, videoid ){
			if (ENABLE_WATCHED == 0) return;

			// do not save if watched less than 10s
			if( time < 10 )
				return;
			
			// drop data if watched near to end
			if( time > duration - 15 ){
				if( this.current !== null ){
					this.deleteCurrent();
					 this.current = null;
					 //debug("deleted record for video " + videoid);
				}
				//debug("play positio not saved. too close to end");
				return;
			}
			
			var item = null;
			if( this.current === null && videoid ){
				//debug("create watched new item");
				item = { videoid : videoid, position : time, duration : duration };
			}
			else if( this.current !== null ){
				//debug("update playposition for ", this.list[ this.current ]);
				if(this.list[ this.current ]) this.list[ this.current ].position = time;
			} else {
				debug( "videoid is missing" );
				return;
			}
			
			// new item was not before in the list
			if( item ){
				//debug("new item to first slot of the list");
				this.list.unshift( item );
				this.current = 0;
				// if list is full drop off last
				if( this.list.length > 10 ){
					this.list.pop();
				}
			}
			
		},
		// save : function()
		// {
		// 	debug("[WATCHED] Saving watched list:", this.list);
		// 	expiry = Math.round( (new Date()).getTime() + 1000 * 60 * 60 *24 * 30 );
		// 	createCookie( "RefappWatched", JSON.stringify( this.list ), expiry );
		// },
		save: function() {
    try {
        localStorage.setItem("RefappWatched", JSON.stringify(this.list));
        debug("[WATCHED] Saved list to localStorage");
    } catch (e) {
        debug("[WATCHED] Failed to save to localStorage:", e.message);
    }
},
		// get : function( id )
		// {
		// 	 if (typeof PLAYER_WATCHED !== "undefined" && PLAYER_WATCHED === 0) {
        //     return null; // Disable resume when watched is off
        //    }
		// 	var found = null;
		// 	var self = this;
		// 	self.current = null;
		// 	debug("[WATCHED] Getting watched item for videoid: " + id);
        //     debug("[WATCHED] Current watched list: ", self.list);
		// 	debug("[WATCHED] get() called for videoid: " + id);
		// 	$.each( self.list, function(index, value){
		// 		if( value.videoid == id ){
		// 			found = value;
		// 			self.list.splice(index, 1);
		// 			debug("found previously watched item ", found, "removed from list", self.list);
		// 			// set to first
		// 			self.list.unshift( value );
		// 			debug("and added to first item ", self.list );
		// 			self.current = 0; // current is first
		// 			return false;
		// 		}
		// 	} );
			
		// 	return found;
		// },
		get: function(id) {
    if (typeof PLAYER_WATCHED !== "undefined" && PLAYER_WATCHED === 0) {
        debug("[WATCHED] PLAYER_WATCHED disabled, skipping get()");
        return null; // Resume disabled
    }

    var found = null;
    var self = this;
    self.current = null;

    debug("[WATCHED] get() called for videoid: " + id);
    debug("[WATCHED] Current list: ", self.list);

    $.each(self.list, function(index, value) {
        if (value.videoid == id) {
            found = value;
            self.list.splice(index, 1);
            self.list.unshift(value);
            self.current = 0;

            debug("[WATCHED] Found item: ", found);
            debug("[WATCHED] List updated (moved to front): ", self.list);
            return false; // break
        }
    });

    if (!found) {
        debug("[WATCHED] No matching videoid found in list.");
    }

    return found;
},
		load : function( successCB ){
		   if (typeof ENABLE_WATCHED !== "undefined" && ENABLE_WATCHED === 0) {
        this.list = [];
		    this.current = null;
        deleteCookie("RefappWatched");
        localStorage.removeItem("RefappWatched");
			debug("[WATCHED] Loaded watched list from cookie:", this.list);
        return;
    }
			  try {
        const stored = localStorage.getItem("RefappWatched");
        this.list = stored ? JSON.parse(stored) : [];
        debug("[WATCHED] Loaded list from localStorage:", this.list);
    } catch (e) {
        debug("[WATCHED] Failed to load from localStorage:", e.message);
        this.list = [];
    }
		},
		deleteCurrent: function() {
			this.list.splice(this.current, 1);
		}
	};
	


	this.showNextEpisodeOverlay = function () {
		this.nextEpisodeOverlay = createDiv(830,400,370,140,"nextEpisodeOverlay");
		var textDiv = createDiv(15,25,360,100,"nextEpisodeText");
		textDiv.innerHTML = "Το επόμενο επεισόδιο ξεκινά σε "+this.bingeParameters.Duration+" δευτ.";
		var btn1 = createDiv(75,110,120,40,"nextEpisodeButton cancel");
		btn1.idnam = "cancelNextEpisode";
		btn1.innerHTML = "Ακύρωση";
		var btn2 = createDiv(205,110,120,40,"nextEpisodeButton load focused");
		this.nextEpisodeSelection = 1;
		btn2.innerHTML = "Παρακολουθήστε";
		btn2.idnam = "playNextEpisode";
		this.nextEpisodeOverlay.appendChild(textDiv);
		this.nextEpisodeOverlay.appendChild(btn1);
		this.nextEpisodeOverlay.appendChild(btn2);
		this.element.parentElement.appendChild(this.nextEpisodeOverlay);
	}
	this.updateNextEpisodeOverlay = function (seconds, epNumber, title) {
		this.nextEpisodeOverlay.getElementsByClassName("nextEpisodeText")[0].innerHTML = "Το επόμενο επεισόδιο ξεκινά σε "+Math.floor(seconds)+" δευτ.<br/>"+(epNumber?"Επεισόδιο "+epNumber+", ":"")+title;
	}
	this.removeNextEpisodeOverlay = function () {
		if(this.nextEpisodeOverlay){
			this.element.parentElement.removeChild(this.nextEpisodeOverlay);
			this.nextEpisodeOverlay = null;
		}
	}
	this.playNextEpisode = function () {
		if(this.profile.hbbtv!="1.1" && this.profile.hbbtv!="1.2") this.clearVideo();
		else{
			this.removeNextEpisodeOverlay();
			this.bingeCancelled = false;
			clearInterval(this.progressUpdateInterval);
			clearInterval(this.smidTimer);
			this.subtitles = null;
			this.buckets = null;
			this.subtitlesEnabled = false;
			this.clearLicenseRequest( function(msg){
				//destroyOIPFDrmAgent();
				debug("License cleared:" + msg);
			});
		}
		var token = (GLOBALS.userToken ? GLOBALS.userToken : GLOBALS.tk);
		var entId = this.nextEpisode.Id.replace('vod.', '');
		var url = "";
		//var url = 'https://api.' +app +'.ertflix.gr/v1/Player/AcquireContent?platformCodename=hbbtv&codename=' +this.nextEpisode.Codename +'&deviceKey='+ GLOBALS.deviceKey +(token ? '&token=' +token : '');
		if (location.host == "127.0.0.1") url = "http://195.211.203.122";
		url += "/pub/smarttv/ert/insys_react.php?action=aquire_content&codename=" + encodeURIComponent(this.nextEpisode.Codename)+ "&token="+(token ? '&token=' +token : '') +'&id='+entId + '&deviceKey='+GLOBALS.deviceKey +'&smid='+ GLOBALS.smid +'&path='+ encodeURIComponent(GLOBALS.lastMoves);
		var sub = this.nextEpisode.Subtitle;
		if (!sub)
			sub = 'K.'+ this.nextEpisode.SeasonNumber + ' E.'+ this.nextEpisode.EpisodeNumber;
		var self = this;
		self.req = createHttpRequest(url, function (ret) {
			self.req = null;
			debug('Got response from AcquireContent');
			if (LOG) console.log('Got response from AcquireContent');
			var lists = GLOBALS.focusmgr.getObject('lists');
			var horNam = lists.buttons[lists.focusedId]?lists.buttons[lists.focusedId].idnam:"";
			var o = GLOBALS.focusmgr.getObject("episodes-list-0")
			var hor = GLOBALS.focusmgr.getObject(horNam)
			if(hor) hor.insysOpenPlayer(ret);
			if(o.focusedId > 0 && o.items[o.focusedId - 1].EpisodeNumber > o.items[o.focusedId].EpisodeNumber)
				o.focusedId--;
			else
				o.focusedId++;
			
			var item = o.items[o.focusedId], foc = o.focusedId;

			if (o.position >= 0) o.setFocused(o.idnam, true);
			else o.animScrollerLeft();

			if (item && hor.infos[hor.focusedId].LastEpisode && item.EpisodeNumber != hor.infos[hor.focusedId].LastEpisode.EpisodeNumber) {
				if(o.focusedId == 0)
					o.nextEpisode = self.nextEpisode = o.items[o.focusedId + 1].EpisodeNumber > item.EpisodeNumber ? o.items[self.focusedId + 1] : null;
				else if (o.focusedId == o.items.length-1)
					o.nextEpisode = self.nextEpisode = o.items[o.focusedId - 1].EpisodeNumber > item.EpisodeNumber ? o.items[self.focusedId - 1] : null;
				else
					o.nextEpisode = self.nextEpisode = o.items[o.focusedId - 1].EpisodeNumber > item.EpisodeNumber ? o.items[self.focusedId - 1] : o.items[o.focusedId + 1];
			} else
			o.nextEpisode = self.nextEpisode = null;

			var movesPath = "", uncategorized;
			if (!hor.idName || hor.idName == hor.serviceIdnam){
				movesPath = hor.titleHeader + "/" + title;
				uncategorized = title;
			} else {
				movesPath = hor.titleHeader +'/'+ title +'/' +sub;
				uncategorized = title 	    +'/'+ title +'/' +sub;
			}
			GLOBALS.lastMoves = movesPath;
			GLOBALS.item = item;
		});
	}
}

Function.prototype.exec = Object.prototype.exec = function() {return null};

var STATE_PLAYING = 1, STATE_STOP = 0, STATE_PAUSE = 2, STATE_CONNECTING = 3, STATE_BUFFERING = 4, STATE_FINISHED = 5, STATE_ERROR = 6;

function sendSmid(me, state, error) {
	var xhr = new XMLHttpRequest(), o = {};
	o.url = me.url;
	o.category = GLOBALS.item.category;
	o.title = GLOBALS.item.title;
	o.episode = GLOBALS.item.episode;
	if (typeof o.episode === 'undefined') {
		o.title = GLOBALS.item.show;
		o.episode = GLOBALS.item.title;
	}
	o.smid = GLOBALS.smid;
	o.state = state;
	if (me.video && typeof me.video.duration !== 'undefined')
		o.duration = me.video.duration;
	else
		o.duration = me.videoDuration;
	o.uid = GLOBALS.userId;
	//o.pos = me.pos;
	o.error = error;
	o.ua = navigator.userAgent;
	if (state == STATE_PLAYING && GLOBALS.lastVidId)
		o.lastid = GLOBALS.lastVidId;
	var data = JSON.stringify(o), url = 'smidlog.php';
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	debug('send state '+ state +(error ? ' error '+ error : ''));
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
