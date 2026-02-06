<?php
date_default_timezone_set("Europe/Berlin");

$sm_host = "46.4.18.190";
$sm_data = "piwik";
$sm_user = "dio";
$sm_pass = "dio123";
$mysqli = new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");

$res = $mysqli->query("insert into hits set ts=unix_timestamp(), ip=127, info='', pid='';");
//$mysqli->query("insert into lala set id = 7");
if ($mysqli->error)
	echo $mysqli->error ."\n";
?>
