
function Subtitles(idnam){
	this.idnam = idnam;
	this.focusedId = 0;
	this.enabled = false;
	this.files = [];
	this.langs = {'el': 'Ελληνικά', 'en': 'Αγγλικά'};
}
Subtitles.prototype = new BaseObject();
Subtitles.prototype.init = function (parent, xpos, ypos){
	this.parent = parent;
	var e = createClassDiv(xpos, ypos, "subs-menu-container");
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	this.elem.style.display = "none";

	var inner = createClassDiv("", "", "inner");
	this.elem.appendChild(inner);
	this.inner = inner;
	this.buttons[0] = inner;
	this.state = false;

	var cont = createClassDiv("", "", "subs-menu-cont");
	cont.style.visibility = 'hidden';
	e.appendChild(cont);
	this.menuCont = cont;
}
Subtitles.prototype.setFiles = function (files){
	if(!files) return;
	this.files = files;
	if (this.files.length > 1) {
		this.buttons = [];
		for (var i = 0; i < files.length; i++) {
			var sub = files[i];
			var m = createClassDiv("", "", "subtitle");
			m.innerHTML = this.langs[sub.l];
			this.menuCont.appendChild(m);
			this.buttons.push(m);
		}
		this.menuCont.style.height = (files.length * 40)+'px';
	}
}
Subtitles.prototype.setFocused = function (otherobj, focus){
	if (this.files.length > 1) {
		this.menuCont.style.visibility = 'visible';
		for (var i = 0; i < this.buttons.length; i++) {
			if (focus) {
				if (i == this.focusedId) addClass(this.buttons[i],"focused");
				else removeClass(this.buttons[i],"focused");
			} else {
				removeClass(this.buttons[i],"focused");
			}
		}
		if(focus){
			if(this.inner.getElementsByTagName("img")[0])
				this.inner.getElementsByTagName("img")[0].style.width  = "40px";
			addClass(this.inner,"circle");		
		}else {
			if(this.inner.getElementsByTagName("img")[0])
				this.inner.getElementsByTagName("img")[0].style.width  = "30px";
			removeClass(this.inner,"circle");
		}
	} else {
		if(focus){
			if(this.buttons[0].getElementsByTagName("img")[0])
				this.buttons[0].getElementsByTagName("img")[0].style.width  = "40px";
			addClass(this.buttons[0],"circle");		
		}else {
			if(this.buttons[0].getElementsByTagName("img")[0])
				this.buttons[0].getElementsByTagName("img")[0].style.width  = "30px";
			removeClass(this.buttons[0],"circle");
		}
	}
		
}
Subtitles.prototype.handleKeyPress = function(keyCode){
        if (GLOBALS.videoplayer && document.getElementById("basic-videotimer").style.display == "none") {
		GLOBALS.focusmgr.focusObject("videoplayer", true);
		GLOBALS.focusmgr.getObject("videoplayer").handleKeyPress(keyCode);
		return;
	}
	switch(keyCode){
		case VK_ENTER:
			if (this.files.length > 1) {
				if (this.focusedId == 2 && this.state) {
					//this.inner.getElementsByTagName("img")[0].src = "img/images_v2/subs_button.png";
					if (GLOBALS.videoplayer)
						GLOBALS.videoplayer.subtitlesEnabled = false;
					else
						GLOBALS.vplayer.subtitlesEnabled = false;
					this.state = false;
				} else {
					if (this.files.length == 2) { // XXX if subtitles are 2 - if more wanted this should change to dynamic
						this.files.push({'off': 'Υπότιτλοι Off'})

						var sub = this.files[2];
						var m = createClassDiv("", "", "subtitle");
						m.innerHTML = sub.off;
						this.menuCont.appendChild(m);
						this.buttons.push(m);
						this.menuCont.style.height = (this.files.length * 40)+'px';
					}

					var v;
					if (GLOBALS.useRef) {
						v = GLOBALS.vplayer;
						v.srtFile = v.subtitles[this.focusedId].f;
						v.subtitlesEnabled = true;
					} else {
						v = GLOBALS.focusmgr.getObject("videoplayer");
						v.srtFile = v.subtitles[this.focusedId].f;
						GLOBALS.videoplayer.subtitlesEnabled = true;
					}
					if(this.files[this.focusedId]) debug('Subtitle load '+ this.files[this.focusedId].l);
					v.loadSubtitles();
					this.state = true;
				}
			} else {
				if(this.state == true){
					//this.buttons[0].getElementsByTagName("img")[0].src = "img/images_v2/subs_button.png";
					if (GLOBALS.videoplayer)
						GLOBALS.videoplayer.subtitlesEnabled = false;
					else
						GLOBALS.vplayer.subtitlesEnabled = false;
					this.state = false;
				}else{
					//this.buttons[0].getElementsByTagName("img")[0].src = "img/images_v2/subs_button_on.png";
					if (GLOBALS.videoplayer)
						GLOBALS.videoplayer.subtitlesEnabled = true;
					else
						GLOBALS.vplayer.subtitlesEnabled = true;
					this.state = true;
				}
			}
			if (this.state == false) {
				document.getElementById("subs-container").style.display = "none";
				$("#subtitleButtonText").html( "Subtitles: Off");
			} else {
				document.getElementById("subs-container").style.visibility = "visible";
				if (this.files[this.focusedId]) $("#subtitleButtonText").html( "Subtitles: " + this.files[this.focusedId].l);
			}
			debug("FOCUS ON VIDEOPLAYER");
			if (GLOBALS.videoplayer)
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			break;
		case VK_UP:
			if (this.focusedId == 0)
				if (GLOBALS.videoplayer)
					GLOBALS.focusmgr.focusObject("videoplayer", true);
			else if (this.files.length > 1) {
				this.focusedId--;
				this.setFocused(this.idnam, true);
			}
			break;
		case VK_DOWN:
			if (this.files.length > 1) {
				this.focusedId++;
				if (this.focusedId > this.buttons.length - 1)
					this.focusedId--;
				this.setFocused(this.idnam, true);
			}
			break;
		case VK_BACK:
			if (GLOBALS.videoplayer)
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			break;
		default:
			break;
	}
}


/*VideoPlayer.prototype.setSubtitlesInfo = function (info) {
	this.subslist = info;
}

VideoPlayer.prototype.hasSubtitles = function (){
	this.hasSubtitles = true;
	return true;
}



VideoPlayer.prototype.createInternalSubtitlesStructure = function (ret){
	try{
		this.buckets = JSON.parse(ret);
	}catch(e){}
	
	if(this.buckets.length > 0) {
		var o = GLOBALS.focusmgr.getObject("videoplayer");
		o.hasSubtitles = true;
		o.bucketId = 0;
	}else{
        debug("Subtitles BUCKET EMPTY");
    }

	//GLOBALS.focusmgr.focusObject("videoplayer");
// the rest of the job is done inside getTimeInfo function , using syncdata, see below
}

VideoPlayer.prototype.syncdata = function (ms, bucketId){
	
	debug("Call syncdata with bucketId : "+ bucketId);
	if(!this.buckets[bucketId]){
	 debug("returns from syncdata for bucketId : "+bucketId);
	 return;
	}
    var start = new Date().getTime();


	document.getElementById("subs-container").style.display = "block";
	//ms = ms+14000;
	var t = msToTime(ms);
	

	var list = this.buckets[bucketId].list;


    document.getElementById("subs-container").innerHTML = "";
    //document.getElementById("subs-container").style.visibility = "hidden";
	
    //llog("[Subtitles.prototype.syncdata] Bucket Id : "+ bucketId + "("+ JSON.stringify(list)+")");
 	debug("Bucket Id ["+ bucketId +"], upperLimit : ["+GLOBALS.upperLimit +"]"+ ", list length: ["+list.length+"]");
	for(k = GLOBALS.upperLimit ; k < list.length; k++){
		if(timeStringToSeconds(list[k].startTime) <= ms && timeStringToSeconds(list[k].stopTime) > ms){
		//if(list[k].startTime <= t && list[k].stopTime > t){
				debug(" current time: ["+ t +"], current list item k:["+k+"] with starttime: "+list[k].startTime + "- stoptime: "+list[k].stopTime + " , text: "+list[k].text);
				//document.getElementById("subs-container").innerHTML = "<span>("+list[k].startTime+" - "+list[k].stopTime+")"+list[k].text+"</span>";
				document.getElementById("subs-container").innerHTML = "<span>"+list[k].text+"</span>";
				document.getElementById("subs-container").style.visibility = "visible";
				GLOBALS.upperLimit = k;
				break;
		}else if(timeStringToSeconds(list[k].stopTime) < ms){
		//}else if(list[k].stopTime < t){
			//debug("Current list item k: ["+ k +"] with stopTime: "+list[k].stopTime +" less than _t_ ");
			llog("empty subs container");
				document.getElementById("subs-container").innerHTML = "";
				//document.getElementById("subs-container").style.visibility = "hidden";
		}else{llog("WTF [ms : "+ms+"], [start : "+timeStringToSeconds(list[k].startTime)+"],[stop : "+timeStringToSeconds(list[k].stopTime)+"] ");}
		if(k == list.length-1) GLOBALS.upperLimit = 0;
	}
	
    
	var end = new Date().getTime();
    var time = end - start;
   //llog('Execution time: ' + time);
	
	//check for the corresponding bucket to see if there are subtitles.
	for(i = GLOBALS.upperLimit; i< this.buckets.length; i++){
		//llog("[Subtitles.prototype.syncdata] t:"+t+" - buckets.to: "+this.buckets[i].to);
		if(t <= this.buckets[i].to){
		//	llog("[Subtitles.prototype.syncdata] list : ", this.buckets[i].list);
			var list = this.buckets[i].list;
			for(k=0; k< list.length; k++){
				if(list[k].startTime <= t && list[k].stopTime > t){
					//llog("[Subtitles.prototype.syncdata] show sub : ", list[k].text);
					document.getElementById("subs-container").innerHTML = "<span>"+list[k].text+"</span>";
				}else if(list[k].stopTime < t){
					//llog("[Subtitles.prototype.syncdata] hide sub : ", list[k].text)
					document.getElementById("subs-container").innerHTML = "";
				}
			}
			break;
		}else{
			GLOBALS.upperLimit = i;
		}
	}
	
	
}*/

//if this.video hasSubtitles enable them, make this.elem visible andstart syncdata
Subtitles.prototype.enable = function (){
	this.elem.style.display = "block";
    var me = this;
	this.syncTimer = window.setTimeout(function (){me.syncdata()}, 50);
}

/*VideoPlayer.prototype.openSubsMenu = function () {/*
    /*if(!this.hasSubtitles) {
        return;
    }*/
    /*
	console.log("OPENING SUBS MENU");
	console.log(this.elem, this.parent);
    var e = new Subtitles("subtitles-menu");
    e.init( this.elem *//*this.parent*//*, 63, 400);
    GLOBALS.focusmgr.focusObject("subtitles-menu");
}*/