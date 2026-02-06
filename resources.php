<?php

/*** 
	Resources and optimization
***/
$isHTTPS = ( (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') || $_SERVER['SERVER_PORT'] == 443 );

// use this to determine if optimization is used by default. Always can be switched by url parameter
$optimizeDefault = false;

// modify here
$resources = array();

if( isset( $profileResources ) ){
	echo "<!-- " . $profileResources. " -->\n";
	if( $profileResources == "mse-eme" ){		
		$dashjs = isset($_GET["dashjs"]) ? $_GET["dashjs"] : "";
		if($dashjs=="nightly")
			$resources[] = ($isHTTPS?"https:":"http:")."//reference.dashif.org/dash.js/nightly/dist/dash.all.debug.js";
		else if($dashjs=="latest")
			$resources[] = ($isHTTPS?"https:":"http:")."//cdn.dashjs.org/latest/dash.all.min.js";
		else // if($dashjs=="local" || $dashjs=="")
			$resources[] = "videoplayer/dash.all.min.js";
		
		$resources[] = "videoplayer/videoplayer_mse-eme.js";
	}
	else if( $profileResources == "html5" ){
		$resources[] = "videoplayer/videoplayer_html5.js";
	}
	else if( $profileResources == "oipf" ){
		$resources[] = "videoplayer/videoplayer_oipf.js";
	}
}
else{
	echo "<!-- No correct videoplayer version found guess HbbTV 1.5 -->\n";
	$resources[] = "videoplayer/videoplayer_oipf.js";
}

//if( !$useMinified || !$useMinifiedCss ){
	foreach($resources as $file){
		$fileversion = $file;		
		if( substr( $file, 0,4 ) != "http" ){
			if(file_exists($file))
				$fileversion = $file . "?version=" . filemtime( $file );
		}
		
		if( /*!$useMinified && */substr( $file, -2 ) == "js" ){
			//echo "<script src='$fileversion' type='text/javascript'></script>\n";
			echo "<script src='$fileversion' type='application/javascript'></script>\n";
		}else if( !$useMinifiedCss && substr( $file, -3 ) == "css" ){
			echo "<link href='$fileversion' rel='stylesheet' type='text/css'/>\n";
		}
	}
//}

/*** 
	End of Resources and optimization
***/

?>