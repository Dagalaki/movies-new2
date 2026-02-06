<?php
require_once('config.php');

$pg = 1; $lim = 100000;
while (true) {
	echo "page $pg\n";
	//$q = 'INSERT IGNORE INTO durations2_072020 VALUES ';
	//$res = $mysqli->query("SELECT * FROM durations_072020 WHERE ts BETWEEN unix_timestamp('2020-07-16 00:00:00') and unix_timestamp('2020-07-16 23:59:59') LIMIT ". ($pg -1) * $lim .','. $lim);
	$q = 'INSERT IGNORE INTO durations VALUES ';
	$res = $mysqli->query("SELECT * FROM durations_n WHERE ts > 1597356026 LIMIT ". ($pg -1) * $lim .','. $lim);

	if ($res->num_rows == 0)
		break;
	while ($row = $res->fetch_assoc()) {
		$q .= "('". $row['id']. "', ". $row['ts'] .", ". $row['end'] .", '". md5($row['ip']) ."', ". $row['smart_id'] ."),";
	}
	$q = substr($q, 0, strlen($q)-1);

	$mysqli->query($q);
	echo $mysqli->error;
	if ($mysqli->error)
		exit;
	$pg++;
}
