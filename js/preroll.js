

var prerollVideo = function(serie){
	if (0) {
	var spot = 'http://star.smart-tv-data.com/21.mp4';
				GLOBALS.videoplayer.setSource(spot);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
	return;
	}
	serie=serie==null ? '':serie;
	var url="http://star.smart-tv-data.com/home/js/lbanner_js.php/sd/"+ON_Channel+"/tg/media/area/"+encodeURIComponent(serie);
	debug('Load ad '+ url);
	var preq=new XMLHttpRequest();
	preq.open("GET",url,true);
	preq.onreadystatechange=function(){
		if(preq.readyState==4 && preq.status==200 && GLOBALS.videoplayer){

			var p=preq.responseText;
			var ar=p.split('#');
			
			if(ar.length>2 && ar[2].match(/http/i) ){
				var spot=ar[2];
				debug('Got ad, loading video '+spot);
				GLOBALS.videoplayer.ad = true;
				GLOBALS.videoplayer.setSource(spot);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
				//start.yourPlayerWith(spot, "no bar start video on endet");

				for(var i=3;i < ar.length;i++){
					var xLog=new Image;
					xLog.src=ar[i];
				}
			} else {
				debug('Got ad result, no ad');
				GLOBALS.videoplayer.ad = false;
				GLOBALS.videoplayer.setSource(GLOBALS.videoplayer.todo);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			}

		}
	};
	preq.send();
}

var middlerollVideo = function(serie) {
	if (0) {
		debug('call middle roll');
	var spot = 'http://star.smart-tv-data.com/21.mp4', vid = document.getElementById("video");
		GLOBALS.videoplayer.ad = true;
		if (GLOBALS.brtyp)
			GLOBALS.videoplayer.middleRollTime = Math.floor(vid.playPosition/1000);
		else
			GLOBALS.videoplayer.middleRollTime = vid.currentTime;

		GLOBALS.videoplayer.setSource(spot);
		GLOBALS.videoplayer.start();
		GLOBALS.focusmgr.focusObject("videoplayer", true);
		return;
	}
	var vid = document.getElementById("video");
	if (GLOBALS.brtyp)
		GLOBALS.videoplayer.middleRollTime = Math.floor(vid.playPosition/1000);
	else
		GLOBALS.videoplayer.middleRollTime = vid.currentTime;

	serie=serie==null ? '':serie;
	debug('call middlerollVideo');
	var url="http://star.smart-tv-data.com/home/js/lbanner_js.php/sd/"+ON_Channel+"/tg/mid/area/"+ encodeURIComponent(serie);
	var preq=new XMLHttpRequest();
	preq.open("GET",url,true);
	preq.onreadystatechange=function(){
		if(preq.readyState==4 && preq.status==200 && GLOBALS.videoplayer){

			var p=preq.responseText;
			var ar=p.split('#');
			
			if(ar.length>2 && ar[2].match(/http/i) ){
				var spot=ar[2];
				GLOBALS.videoplayer.ad = true;

				debug('spot '+ spot);
				GLOBALS.videoplayer.setSource(spot);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);

				for(var i=3;i < ar.length;i++){
					var xLog=new Image;
					xLog.src=ar[i];
				}
			} else {
				GLOBALS.videoplayer.ad = false;
				if (!GLOBALS.middleTimer)
					GLOBALS.middleTimer = setInterval( function() { middlerollVideo(); }, 10 * 60 * 1000);

				GLOBALS.focusmgr.focusObject("videoplayer", true);
			}

		}
	};
	preq.send();
}

