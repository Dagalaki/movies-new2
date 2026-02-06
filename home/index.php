<?php 

/*
http://smarttv.anixa.tv/cretetv/home/index.html?s=cretetv
*/

header("Content-Type: application/vnd.hbbtv.xhtml+xml; charset=UTF-8"); 
echo('<?xml version="1.0" encoding="utf-8" ?>'."\n");

date_default_timezone_set('Europe/Athens');
$ip= isset( $_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:"127.0.0.2" ;
$sender= isset($_GET["s"])? $_GET["s"]: "cretetv";
if($sender!="cretetv") $sender="cretetv";
$smarttv_id	= intval(isset($_COOKIE["set_smart"]) ? $_COOKIE["set_smart"]: 0);

require "ipaccess.php";
$date=date("Y-m-d H:i:s");

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="application/vnd.hbbtv.xhtml+xml; charset=UTF-8" />
<style>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr,
acronym, address, big, cite, code, del, dfn, em, font, img, ins, kbd, q, s, samp, small, strike,
strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td, embed {margin: 0;padding: 0;border: 0;outline: 0;font-size: 100%;font-style: inherit;font-family: inherit;vertical-align: baseline;background: transparent;overflow:hidden;}
div, object{position:absolute;}
</style><meta http-equiv="content-type" content="application/vnd.hbbtv.xhtml+xml; charset=UTF-8" /><META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" /><META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" /><META HTTP-EQUIV="EXPIRES" CONTENT="Mon, 22 Jul 2002 11:12:01 GMT" />
<title>HBBTV-CRETETV</title>
<script type="text/javascript" src="/js/keycodes.min.js"></script>
<script type="text/javascript" src="/js/hbbtvlib.min.js"></script>
<script type="text/javascript" src="js/consentTexts.js?r=<?php echo(rand()); ?>"></script>
<script type="text/javascript" src="js/common.js?r=<?php echo(rand()); ?>"></script>
<script type="text/javascript" src="js/consent-popup.bundle.js?r=<?php echo(rand()); ?>"></script>
<script>var btn=0,aktueller_sender='<?php echo($sender);?>',smartid=<?php echo($smarttv_id);?>,smtime=<?php echo(time());?>,clerror=false,it_stream="cretetv",anx=0,lnkid=0;function getWinOwnerAppId(){return false};</script>
<link rel="stylesheet" href="css/consent.css?r=<?php echo(rand()); ?>" />
</head>
<body><object id="oipfAppMan" type="application/oipfApplicationManager"></object><object id="oipfConfig" type="application/oipfConfiguration"></object>
<div id="tvbild" style="position:absolute;top:0;left:0;width:1280px;height:720px;overflow:hidden;z-index:0;"><object type="video/broadcast" id="mybroadcast" style="position:absolute;top:0px;left:0px;width:1280px;height:720px;z-index:0"></object></div>
<div id="redbutton" style="visibility:hidden;position:absolute;background:url(img/Pixel_Transparent.png) no-repeat bottom right;right:30px;bottom:30px;margin-right:0px;margin-bottom:0px;width:1px;height:1px;z-index:999;"></div>
<div id="wait" style="visibility:visible;display:none;position:absolute;top:300px;left:530px;z-index:99;color:#fff;font-size:20px;text-align:center;"></div>
<div id="dbg" style="visibility:hidden;display:none;position:absolute;top:20px;left:20px;z-index:99;background:#000000;color:#ffffff;font-size:20px;"></div>
<script type="text/javascript">
//<![CDATA[
if(window.localStorage){
 var xt=localStorage.getItem("set_smart"); 
 if(xt>0 && smartid==0) smartid=xt;
}
if(!smartid>0) smartid=0;
var node = document.createElement("script");
var head = document.head||document.getElementsByTagName("head")[0];
node.type = "text/javascript";
node.src = "js/smart.php/sm/"+smartid+"/tm/"+smtime+"/nn/smart.js";
head.appendChild(node);
<?php
if(1 || in_array($ip,$showip)){

/*
button manager
http://smarttv.anixa.tv/stats/button.php?ch=cretetv
*/
$button=getButton();

echo('var buttonjson='.json_encode($button).';btn='.count($button).';
function newButton(){
 var obj=document.getElementById("redbutton");
 for(var x in buttonjson ){
  obj.style.width=buttonjson[x].w+"px";
  obj.style.height=buttonjson[x].h+"px";
  obj.style.backgroundImage = \'url("img/\'+x+\'")\';
  if(typeof buttonjson[x].blue !== "undefined") lnkid=parseInt(buttonjson[x].blue);
 }
};');

}
?>

//]]>
</script></body></html><?php



function getButton(){
GLOBAL $sender;
 $conf=json_decode( file_get_contents('img/button.php'), true );
 $ran=[];
 $button=[];
 $day=date("Y-m-d H:i:s");
 $dt =time();
 if( isset($conf['days']) && count($conf['days']) >0 ){
  foreach($conf['days'] as $row){
	if( $day>=$row['start'] && $day<$row['end'] ) $ran[$row['btn']]=$row;
  }
 }
 if( count($ran)==0 ){
  foreach($conf as $btn=>$row){
   if($btn!=='days'&& $btn!=='default'){
	if( ($row['ab']==0 || $dt>=$row['ab']) && ($row['an']==0 || $dt< $row['an']) ){
	 $a=explode(',',$row['ch']);
	 if($row['ch']==''|| in_array($sender,$a) ) $ran[$btn]=$row;
	}
   }
  }
 }
 if(count($ran)>0){
  $_keys = array_rand($ran, 1);
  $button[$_keys]=$ran[$_keys];
 }else $button=$conf['default'];

 return $button;
}

