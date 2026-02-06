<?php
date_default_timezone_set("Europe/Berlin");

$id = $_GET['id'];
$ts = $_GET['ts'];
$out = [];

if (!$id || !$ts) {
	$out['error'] = "No id or ts found";
} else {
	$sm_host = "localhost";
	$sm_data = "netflow";
	$sm_user = "netflow";
	$sm_pass = "123";
	$total = 0;

	$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
	$mysqli->set_charset("utf8");
	//echo("SELECT ts, duration FROM durations WHERE id = ". $id ." AND ts != ". $ts);
	$res = $mysqli->query("SELECT ts, duration FROM durations WHERE id = ". $id ." AND ts != ". $ts);

	while ($row = $res->fetch_assoc()) {
		$out[] = $row;
	}
}
echo json_encode($out);
