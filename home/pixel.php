<?php
/*



http://skai.smart-tv-data.com/home/pixel.php

http://skai.smart-tv-data.com/home/pixel.php/b/RED-BUTTON_offline.png


*/
$redir	= isset($_SERVER['REDIRECT_URL'])? $_SERVER['REDIRECT_URL']:"";
$pathinfo = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : $redir;
$getparams = preg_split('|/|', $pathinfo, -1, PREG_SPLIT_NO_EMPTY);

for($i=0; $i< count($getparams);$i++){
 $feld=$getparams[$i];
 $i++;
 $_GET[$feld] = ( isset($getparams[$i]) ? $getparams[$i]:"" );
}
$bild	= isset($_GET["b"]) ? $_GET["b"]: "";
$klick	= isset($_GET["k"]) ? 1:0;
$clientIpAddress = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:'127.0.0.1';

if($bild!==""){

 if($bild=="RED-BUTTON_offline.png"){
	file_put_contents("/var/www/html/skai/home/dsm-cc_offline.log", date("Y-m-d H:i:s").'|'.$clientIpAddress."\n", FILE_APPEND);
 }else{
/*
  $smhost= "192.168.203.19";
  $smdata= "redbutton";
  $smuser= "smuser";
  $smpass= "MZPclKhvZ092plMy";
  $mysqli = @new mysqli($smhost, $smuser, $smpass, $smdata);
  $mysqli->connect_errno and die('could not connect to db: ' . $mysqli->connect_errno . ' ' . $mysqli->connect_error);
  $mysqli->set_charset("utf8");
  if($klick==1) $sql="Update button_manager SET klick=klick+1 WHERE button='$bild' ";
  else $sql="Update button_manager SET hits=hits+1 WHERE button='$bild' ";
  $mysqli->query($sql);
*/
	file_put_contents("/var/www/html/skai/home/hbbtv-pixel.log", date("Y-m-d H:i:s").'|'.$clientIpAddress.'|'.$bild."\n", FILE_APPEND);

 }
}

header('Content-Type: image/gif');
echo "\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b";


