<?php
require_once('config.php');

$pg = 1; $lim = 100000;
while (true) {
	echo "page $pg\n";
	$q = 'INSERT INTO visits VALUES ';
	$res = $mysqli->query("SELECT * FROM visits_old WHERE ts > 1597356000 LIMIT ". ($pg -1) * $lim .','. $lim);

	if ($res->num_rows == 0)
		break;
	while ($row = $res->fetch_assoc()) {
		$q .= "(". $row['ts']. ", '". md5($row['ip']) ."', '". $row['page'] ."', ". $row['agent_id'] .", ". $row['pstart'] .", '". $mysqli->real_escape_string($row['referrer']) ."'),";
	}
	$q = substr($q, 0, strlen($q)-1);

	$mysqli->query($q);
	echo $mysqli->error;
	if ($mysqli->error)
		exit;
	$pg++;
}
