<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$day = isset($_GET["day"]) ?  $_GET["day"] : "";
$time = isset($_GET["time"]) ?  $_GET["time"] : "";
$channel = isset($_GET["channel"]) ?  $_GET["channel"] : "";
$days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

$resp = [];
if (!$channel) {
	$resp['error'] = 'Missing channel';
} else {
	$mysqli = new mysqli('localhost', 'root', 'i0d956v4', 'redbutton');
	//$resp['error'] = $mysqli->error;

	$q = "SELECT title, start, ende, category, subcategory FROM zugriff_portal_programm_ert1 WHERE sender = '". $channel ."'";
	$stday = date('Y-m-d');
	$sttime = date('H:i:s');
	if ($time) {
		if (strlen($time) == 5)
			$sttime = $time.':00';
		else if (strlen($time) == 2)
			$sttime = $time.':00:00';
	}

	if ($day) {
		if (isset($days[$day])) {
			$d = $days[$day];
			$n = date('d');
			$diff = $d - date('w');
			if ($diff < 0)
				$diff += 7;
			$n += $diff;

			$stday = date('Y-m-'.$n);
		}
	}
	$sts = strtotime($stday .' '. $sttime)-10;
	$ets = $sts + 100;

	//$q .= " AND start BETWEEN '". date('Y-m-d H-i-s', $sts). "' AND '". date('Y-m-d H:i:s', $ets) ."'";
	$q .= " ORDER BY start DESC LIMIT 1";
	$res = $mysqli->query($q);
	if ($mysqli->error)
		$resp['error'] = $mysqli->error;
	else if ($row = $res->fetch_assoc()) {
		$resp['start'] = $row['start'];
		$resp['title'] = mb_convert_encoding($row['title'], 'HTML-ENTITIES', 'UTF-8');
		$resp['category'] = mb_convert_encoding($row['category'], 'HTML-ENTITIES', 'UTF-8');
		$resp['subcategory'] = mb_convert_encoding($row['subcategory'], 'HTML-ENTITIES', 'UTF-8');
	} else
		$resp['q'] = $q;
}

echo json_encode($resp);

?>

