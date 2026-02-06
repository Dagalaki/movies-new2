<?php
include('/var/www/html/cretetv/stats/config.php');
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$response = [];

if($mysqli->connect_error){
	$response['error'] = 'SQL connect error';
	die(json_encode($response));
}
$ip= isset( $_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:"127.0.0.2" ;

$smid = (isset($_GET['smid']) ? (int)$_GET['smid'] : 0);
$path = (isset($_GET['path']) ? $_GET['path'] : '');

if (!$smid)
	$response['error'] = 'Missing smart ID';
else if (!strlen($path)) {
	$response['error'] = 'Missing path';
	$response['error'] = 'Missing video URL';
} else {
	$dt = date('Ymd');
	$patj = mysqli_real_escape_string($mysqli, $patj);
	$q = "INSERT INTO moves SET path = '". $path ."', dt = $dt, smid = $smid, cnt=1 ON DUPLICATE KEY UPDATE cnt = cnt +1";
	$res = $mysqli->query($q);
	errcheck();
}
echo json_encode($response);

function errcheck() {
	global $response, $mysqli;
	if ($mysqli->error) {
		$response['error'] = 'SQL error: '. $mysqli->error;
		echo json_encode($response);
		exit;
	}
}

