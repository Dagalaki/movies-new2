<?php

header('Content-Type: text/javascript; charset=UTF-8');
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Pragma: no-cache");
date_default_timezone_set('Europe/Athens');

$redir	= isset($_SERVER['REDIRECT_URL'])? $_SERVER['REDIRECT_URL']:"";
$pathinfo = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : $redir;
$getparams = preg_split('|/|', $pathinfo, -1, PREG_SPLIT_NO_EMPTY);
for($i=0; $i< count($getparams);$i++){
 $feld=$getparams[$i];
 $i++;
 $_GET[$feld] = ( isset($getparams[$i]) ? $getparams[$i]:"" );
}


$clientIpAddress = "";
if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR']) {
    $clientIpAddress = trim(str_replace('unknown','',$_SERVER['HTTP_X_FORWARDED_FOR']));
}
if($clientIpAddress=="") $clientIpAddress = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:'127.0.0.1';
$ip=explode(",",$clientIpAddress);
$ip=trim($ip[0]);
$agent= isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'No_USER_AGENT';
if(strpos($agent,' VID/')!==false) $agent=trim( strstr($agent, ' VID/',true) );
if(strpos($agent,' RVID/')!==false) $agent=trim( strstr($agent, ' RVID/',true) );
if(strpos($agent,' FXM-')!==false) $agent=trim( strstr($agent, ' FXM-',true) );
if(strpos($agent,' Firmware/')!==false) $agent=trim( strstr($agent, ' Firmware/',true) );

require "../sql.php";
$debug = ($ip=='93.190.254.164');

if($mysqli->connect_error){
  die('var fail="Connect Error";');
}
$mysqli->set_charset("utf8");

$agent	= utf8_to_ascii($agent);
$aghash	= md5($agent);
$agentsql=$mysqli->real_escape_string($agent);

$smart_co= "set_smart";
$smarttv_id= isset($_COOKIE[$smart_co]) ? $_COOKIE[$smart_co]: 0;
$sm= intval(isset($_GET["sm"])? $_GET["sm"]: 0);
if($sm>1000 && $sm!==$smarttv_id){
 if($smarttv_id==0 && $sm>1000) $smarttv_id=$sm;
}

$sql= "INSERT INTO agent (hits,agent,hash) VALUES (1,'$agentsql','$aghash') ON DUPLICATE KEY UPDATE hits=hits+1 ";
$mysqli->query($sql);
$agent_id= $mysqli->insert_id;


if($smarttv_id==0){

	$sql= "INSERT INTO provil (hits,agent,hash) VALUES (1,'$agentsql','$aghash') ";
	$mysqli->query($sql);
	$smarttv_id= $mysqli->insert_id;

}else{

	if($smarttv_id < 1000000){

	 $sql= "INSERT INTO provil (hits,agent,hash) VALUES (1,'$agentsql','$aghash') ";
	 $mysqli->query($sql);
	 $smarttv_id= $mysqli->insert_id;

	}else{

	 $smtest=0;

	 $sql="Select * FROM provil WHERE smid=$smarttv_id and hash='$aghash' LIMIT 1";
	 $result=$mysqli->query($sql);
	 while($row = $result->fetch_assoc()) $smtest=$row['smid'];

	 if($smtest==0){

	  $sql= "INSERT INTO provil (hits,agent,hash) VALUES (1,'$agentsql','$aghash') ";
	  $mysqli->query($sql);
	  $smarttv_id= $mysqli->insert_id;

	 }else{

	  $sql= "UPDATE provil SET hits=hits+1 where smid=$smtest ";
	  $mysqli->query($sql);

	 }
	}

}

if($smarttv_id>1000000) $mysqli->query("INSERT INTO smartlog SET channel='cretetv',smartid=$smarttv_id ON DUPLICATE KEY UPDATE hits=hits+1");
setcookie ($smart_co, $smarttv_id,  time()+60*60*24*360 , "/");

$links=json_decode(@file_get_contents('../img/link.json'));
echo("var deep=".json_encode($links).";");

echo( file_get_contents("/var/www/html/js/ws-min.js") );
echo( file_get_contents("/var/www/html/js/banner-min.web2") );
echo( file_get_contents("smid.js") );
echo( file_get_contents("app_index.js") );
//echo( file_get_contents("tracking.js") );
echo("\n".'var smid="'.$smarttv_id.'.'.time().'.'.$agent_id.'",pi_host="/matomo/img.php?idsite=6&rec=1&cookie=1",bannerfirst=0,piwid=0,knock_host="smarttv.anixa.tv",wsport=8081;ws_load();');


function utf8_to_ascii($text) {
      if (is_string($text)) {
        $text = preg_replace_callback('/\X/u', __FUNCTION__, $text);
      }
      elseif (is_array($text) && count($text) == 1 && is_string($text[0])) {
        $text = iconv("UTF-8", "ASCII//IGNORE//TRANSLIT", $text[0]);
        if ($text === '' || !is_string($text)) {
          $text = '?';
        }
        elseif (preg_match('/\w/', $text)) {
          $text = preg_replace('/\W+/', '', $text);
        }
      }
      else {
        $text = '';
      }
      return $text;
}
