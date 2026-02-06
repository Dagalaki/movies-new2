<?php
$servername = "127.0.0.1";
$username = "stats";
$password = "stat-4512";
$dt = date('YmdH');
$ip = 0;
if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR']) {
	$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
	$ip = $_SERVER['REMOTE_ADDR'];
}

$mysqli = new mysqli($servername, $username, $password);
if ($mysqli->connect_error) {
	die("Connection failed: " . $mysqli->connect_error);
}
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$mysqli->set_charset("utf8");
mysqli_select_db($mysqli, "stats_cretetv");

$response = [];

$q = "INSERT INTO red SET dt = ". date('Ymd') .", cnt = 1 ON DUPLICATE KEY UPDATE cnt = cnt +1";
$res = $mysqli->query($q);
errcheck();

echo json_encode($response);

function errcheck() {
	global $response, $mysqli, $q;
	if ($mysqli->error) {
		$response['error'] = 'SQL error: '. $mysqli->error;
		$response['q'] = $q;
		echo json_encode($response);
		exit;
	}
}

