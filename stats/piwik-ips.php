<?php
date_default_timezone_set("Europe/Berlin");
$sm_host = "localhost";
$sm_data = "piwik";
$sm_user = "piwik";
$sm_pass = "GGvd8M596sQ444*";

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");

// 10 seconds wuery:
//$res = $mysqli->query("SELECT UNIX_TIMESTAMP(visit_first_action_time), UNIX_TIMESTAMP(visit_last_action_time), location_ip FROM matomo_log_visit WHERE visit_first_action_time between '2019-06-15 08:08:11' AND '2019-06-15 08:08:21' OR visit_last_action_time between '2019-06-15 08:08:11' AND '2019-06-15 08:08:21'");
//
$res = $mysqli->query("SELECT UNIX_TIMESTAMP(visit_first_action_time), UNIX_TIMESTAMP(visit_last_action_time), location_ip FROM matomo_log_visit WHERE visit_first_action_time between '2019-06-15 08:00:11' AND '2019-06-15 08:58:21' OR visit_last_action_time between '2019-06-15 08:00:11' AND '2019-06-15 08:58:21'");
//$res = $mysqli->query("SELECT UNIX_TIMESTAMP(visit_first_action_time), UNIX_TIMESTAMP(visit_last_action_time), location_ip FROM matomo_log_visit WHERE location_ip = conv(hex('87.177.112.179'), 16, 16) AND (visit_first_action_time between '2019-06-15 08:00:11' AND '2019-06-15 08:58:21' OR visit_last_action_time between '2019-06-15 08:00:11' AND '2019-06-15 08:58:21')");

if ($mysqli->error) {
	echo "Error: ". $mysqli->error."\n";
}

while ($row = $res->fetch_row()) {
	$ts = $row[0]+2 * 3600;
	$ts2 = $row[1]+2 * 3600;
	echo date('r', $ts). ', '. date('r', $ts2) .", ". @inet_ntop($row[2]) ."\n";
}

