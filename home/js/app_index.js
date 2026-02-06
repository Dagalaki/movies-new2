var timer,timeradd,testTimeout=false,showred_task,rPos=-500,bPos=-120,PosCC=0;
if(document.getElementById("wait")) document.getElementById("wait").innerHTML='<img src="img/kreisel.gif" alt=""/><br/>ΠΑΡΑΚΑΛΩ ΠΕΡΙΜΕΝΕΤΕ';

var setVideoElement=function(){
 var vid= "mybroadcast";
 if(anx) anx.videotag=document.getElementById(vid);
};
var setFrame=function(url) {
  if(pi_host!==""){
   url+='&url='+encodeURIComponent('http://smarttv.anixa.tv/'+aktueller_sender+'/home/index.php');
   (new Image).src=url;
  }
};
var handleKeyCode=function(ck){
	if(!btn) return false;
	var lnk="";
	if(ck != VK_RED && ck != VK_BLUE && ck != VK_YELLOW && ck != VK_GREEN){
		handled = GLOBALS.focusmgr.handleKeyCode(ck);
	return true;
	}
	switch(ck) {
	case VK_RED:
		lnk='http://smarttv.anixa.tv/'+aktueller_sender+'/index.php?sd='+it_stream+'&s='+aktueller_sender;
		if( document.getElementById("wait") ){document.getElementById("wait").style.display='block';document.getElementById("wait").style.visibility='visible';}
		setFrame(pi_host+"&action_name=Press_Red");
		window.setTimeout(function(){location.href = lnk;}, 500);
		return true;
	case VK_YELLOW:
		if(lnkid>0){
		 if(deep['yellow'] && deep['yellow'][lnkid]) lnk=deep['yellow'][lnkid]+"&s="+aktueller_sender+"&smid="+smartid;
		 if(lnk!=""){
			if( document.getElementById("wait") ){document.getElementById("wait").style.display='block';document.getElementById("wait").style.visibility='visible';}
			setFrame(pi_host+"&action_name=Press_Yellow");
			window.setTimeout(function(){location.href = 'http://smarttv.anixa.tv/'+aktueller_sender+lnk }, 500);
		 }
		}
		return true;
	case VK_GREEN:
		if(lnkid>0){
		 if(deep['green'] && deep['green'][lnkid]) lnk=deep['green'][lnkid]+"&s="+aktueller_sender+"&smid="+smartid;
		 if(lnk!=""){
			if( document.getElementById("wait") ){document.getElementById("wait").style.display='block';document.getElementById("wait").style.visibility='visible';}
			setFrame(pi_host+"&action_name=Press_Green");
			window.setTimeout(function(){location.href = 'http://smarttv.anixa.tv/'+aktueller_sender+lnk }, 500);
		 }
		}
		return true;
	case VK_BLUE:
		 var consentFrame = new ConsentFrame("consentFrame");
	   consentFrame.init(document.body,"","");
		/*if(lnkid>0){
		 if(deep['blue'] && deep['blue'][lnkid]) lnk=deep['blue'][lnkid]+"&s="+aktueller_sender+"&smid="+smartid;
		 if(lnk!=""){
			if( document.getElementById("wait") ){document.getElementById("wait").style.display='block';document.getElementById("wait").style.visibility='visible';}
			setFrame(pi_host+"&action_name=Press_Blue");
			window.setTimeout(function(){location.href = 'http://smarttv.anixa.tv/'+aktueller_sender+lnk }, 500);
		 }
		}*/
		return true;

	default:
		return false;
	};
};
var showred=function(){
 try{ if(clerror) return false; }catch(e){};
 if(btn){
  newButton();
  if(timer) window.clearTimeout(timer);
  timer = window.setTimeout(function(){
	document.getElementById('redbutton').style.visibility = 'hidden';
	if(!bannerfirst && anx) timeradd = window.setTimeout(anx.runBanner, 1000);
	setFrame(pi_host+"&action_name=Start_close_Red");
  }, 9000);
  if(showred_task) window.clearTimeout(showred_task);
  var obj= document.getElementById('redbutton');
  if(obj){
  	obj.style.visibility = 'visible';
  	setFrame(pi_host+"&action_name=Start_Red");
  }
 }
};
window.onload = function(){
	setFrame(pi_host+"&action_name=Start");
	try{ logUniqueAccess();}catch(e){}
	try {
	hbbtvlib_initialize();
	hbbtvlib_show();
	initHbbTV(FocusManager.KEYSET_ENABLED);
	document.addEventListener("keydown",function(e) {
		handleKeyCode(e.keyCode);
	},false);
	int_keyset.setValue(0x1+0x2+0x4+0x8);
	int_keyset.setValue(0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x100 + 0x400);
	}catch(e){};
	var dvb= document.getElementById('mybroadcast');
	try {dvb.bindToCurrentChannel();}catch(e){}
	setVideoElement();
	if(bannerfirst && anx) timeradd = window.setTimeout(anx.runBanner, 1000);
	else showred();
};
