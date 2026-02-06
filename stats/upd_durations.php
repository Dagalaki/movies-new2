<?php
require_once('/var/www/html/stats-nginx/config.php');
define('DAYS', 10);
$ts = time();

while ($ts > time() - DAYS * 86400) {
	Echo date('r', $ts-86400). ' - '. date('r', $ts) ."\n";
	$res = $mysqli->query("SELECT id, ts, info FROM durations_n WHERE ts BETWEEN ". ($ts-86400) ." AND ". $ts);

	while ($row = $res->fetch_assoc()) {
		$info = json_decode($row['info']);
		echo("UPDATE durations_n SET ip = ". ip2long($info->ip) ." WHERE id = '". $row['id'] ."' AND ts = ". $row['ts'] ."\n");
		$mysqli->query("UPDATE durations_n SET ip = ". ip2long($info->ip) ." WHERE id = '". $row['id'] ."' AND ts = ". $row['ts']);
		if ($mysqli->error)
			echo "Error: ". $mysqli->error ."\n";
	}
	$ts-=86400;
}
