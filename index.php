<?php

if (1 && isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ) {
    $redirect_url = "http://smarttv.anixa.tv/movies-new";
    header("Location: $redirect_url");
    exit;
}

function getApplicationProfile(){
	$profiles = json_decode( file_get_contents( "profiles.json" ), true );

	$userAgent = $_SERVER['HTTP_USER_AGENT'];
	$mode = null;

	$hbbtvRe = '/HbbTV\/\d\.(?P<version>\d)\.\d/';
	$matches = null;
	preg_match( $hbbtvRe, $userAgent, $matches );

	$profile = null;

	if( $matches == null ){
		// $profile = $profiles['EME'];
		$profile = $profiles['HbbTV2.0'];
	}
	else if( (int)$matches['version'] == 2 ){
		$profile = $profiles['HbbTV1.5'];
	}
	else if( (int)$matches['version'] >= 3 ){ // 1.4.1 is hbbtv 2.0.1 / 1.3.1 = 2.0.0 and newer versions are all accepted HbbTV2.0 profile
		$profile = $profiles['HbbTV2.0'];
	}
	else if( (int)$matches['version'] == 1 ){
		$profile = $profiles['HbbTV1.0'];

	}
	else{
		$profile = $profiles['unknown'];

	}
	if (preg_match("#Vestel#si", $userAgent) || preg_match("#LGE;#si", $userAgent) || preg_match("#SAMSUNG;#si", $userAgent))
		$profile = $profiles['HbbTV1.5']; //oipf
	$profile['userAgent'] = $userAgent;
	return $profile;
}

$profile = getApplicationProfile();

if( $profile['supported'] == false ){
	header( "Location: unsupported.html" );
	die();
}

$mode= isset($_GET["mode"]) ? $_GET["mode"] : "";
$action= isset($_GET["action"]) ? $_GET["action"] : "";

header('Access-Control-Allow-Origin: *');
//header( "Content-Type: ". $profile['contentType'] .";charset=utf-8" );	
/*echo ('<?xml version="1.0" encoding="utf-8" ?>');*/
date_default_timezone_set('Europe/Athens');

$sender= isset($_GET["s"])? $_GET["s"]: "movies-new";
$ip= isset( $_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:"127.0.0.2" ;

$smid=0;
 $smart_co      = "set_smart";//"set_".$sender;
 $sety          = isset($_COOKIE[$smart_co]) ? $_COOKIE[$smart_co]: '';
 $res           = explode(".", $sety);
 $smid    = intval(isset( $res[0] ) ? $res[0] : 0);
$dvbi=isset($_GET['dvbi']) ? (int)$_GET['dvbi'] : 0;

 if (!$smid && isset($_GET['smid']))
	 $smid = $_GET['smid'];
 $dev = isset($_GET['dev']);
 if ($ip == '79.130.51.182') $dev =1;

 $val = $profile['xmlHeader'];
if($val!="") echo $val ."\n";

// <!DOCTYPE>
echo $profile['doctype'] ."\n";

if (1 || $_SERVER['SERVER_ADDR'] == '127.0.0.1' || preg_match("#dev#si", $_SERVER['REQUEST_URI']))
	$mode = 'ref';
?>

<!-- <!DOCTYPE html PUBLIC "-//HbbTV//1.1.1//EN" "http://www.hbbtv.org/dtd/HbbTV-1.1.1.dtd"> -->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
	<meta http-equiv="Content-Type" content="application/vnd.hbbtv.xml+xhtml; utf-8" />
	<script type="text/javascript" src="js/jquery-1.11.3.min.js?r=<?php echo rand();?>"></script>
	<script type="text/javascript" src="js/common.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/preroll.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/movies.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/search.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/keycodes.js"></script>
	<script type="text/javascript" src="js/subtitles.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/consent-popup.bundle.js?r=<?php echo(rand()); ?>"></script>
	<link rel="stylesheet" href="css/base.css?r=<?php echo(rand()); ?>" />
	<link rel="stylesheet" href="css/movies.css?r=<?php echo(rand()); ?>" />
	<link rel="stylesheet" href="css/consent.css?r=<?php echo(rand()); ?>" />
	
	<?php if($mode != "ref"){ ?>
	<script type="text/javascript" src="js/videoplayer.js?r=<?php echo(rand()); ?>"></script>
	<link rel="stylesheet" href="css/videoplayer.css?r=<?php echo(rand()); ?>" />
	<?php }else{ ?>
		<script>
		/*** Settings ***/
		var profile = { hbbtv : "<?php echo $profile['hbbtv']; ?>", video : "<?php echo $profile['video']; ?>", version : "<?php echo $profile['version']; ?>"};
		</script>
		<script type="text/javascript" src="js/helper.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="js/dialog.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="videoplayer/videoplayer_basic.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="videoplayer/monitor/monitor-base.js?r=<?php echo rand();?>"></script>
		<link rel="stylesheet" href="videoplayer/vplayer.css?r=<?php echo rand();?>" />
		<!-- List all css and js resource files or minified and combined resource files -->
		<?php 
		$profileResources = $profile['version'];
		include_once("resources.php"); 
	} ?>
	
	<title>Movies HbbTV</title>
	<script type="text/javascript">
	 var ui='<?php echo isset($_GET['ui'])?$_GET['ui']:1;?>', action='<?php echo $action;?>',aktueller_sender='<?php echo($sender);?>',clientIP='<?php echo($ip);?>',smid=<?php echo($smid). ', dev='. (int)$dev;?>,piwikTracker=0; function getWinOwnerAppId(){};
    </script>
	<script>
		var ON_Channel="<?php echo($sender);?>", mode = '<?php echo $mode;?>';
		var dvbi=<?php echo (int)$dvbi?>;
	</script>
</head>

<body onload="initApp();">
	<div id="videodiv"></div>
	<div id="hiddenList" style="visibility:hidden"></div>
	<div id="tvbild" class="tvbild">

		<object id="mybroadcast" type="video/broadcast"></object>

	</div>

	<div id="ondev">ON DEV</div>
	<div id="subs-container" class="subs-container fullscreen" style="display:none;"><span></span></div>
	<!-- <div id="log-message" style="display:block;z-index:100"></div> -->

	 <div id="debug" class="debug"></div>
	<div id="player-bg-container" style="display:none; z-index:100; background-color:black!important; color:#eeeeee">
		<div id="wait2" style="position: absolute;top: 290px; left: 565px; display: block; z-index: 100;">
			<div class="loader"></div>
			<!-- <img src="img/loading.gif" style="width: 100px; height: 100px;"></img> -->
			<p id="mediaload" style="position:relative; font-size:25px; color:#eeeeee; text-align:center">Loading ...</p>
		</div>

	</div>
	<div id="player-container" style="display:none"></div>
	<div id="videotimer2" class="full-videotimer" style="display:none">
		<div id="player_control2">
			<img src="img/buttons/Control_0_Btn.png" alt="" />
			<img src="img/buttons/Control_Play_Btn.png" alt="" />
			<img src="img/buttons/Control_2_Btn.png" alt="" />
			<img src="img/buttons/Control_3_Btn.png" alt="" />
			<img src="img/buttons/Control_4_Btn.png" alt="" />
		</div>
		<div id="timeline2" class="full-timeline">
			<div id="duration"></div>
		</div>
		<div id="time2">00:00:00 / 00:00:00</div>
	</div>
	<div id="stop-img" style="display:none"></div>
	<div id="privacy-text" style="display:none">
		<p>Η πολιτική ιδιωτικότητας είναι σύμφωνη με τη Νομοθεσία της Ε.Ε. και του ελληνικού κράτους.</p>
	</div>
	<object id="appmgr" type="application/oipfApplicationManager" style="position: absolute; left: 0px; top: 0px; width: 1px; height: 1px"></object>
	<object id="oipfcfg" type="application/oipfConfiguration" style="position: absolute; left: 0px; top: 0px; width: 1px; height: 1px"></object>
	<div id="popup" class="hidden"></div>
	<div id="appscreen" style="left: 0px; top: 0px; width: 1280px; height: 720px; visibility: inherit; display: block;">
		<div id="radiostream" style="display:none;visibility:hidden;z-index:0;width:345px;height:194px">
			<object id="myradio" type="audio/mpeg"></object>
		</div>
	</div>
</body>

</html>
