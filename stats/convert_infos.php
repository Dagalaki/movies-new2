<?php
require_once('config.php');

$pg = 1; $lim = 100000;
while (true) {
	echo "page $pg\n";
	$q = 'INSERT IGNORE INTO infos2 VALUES ';
	$res = $mysqli->query("SELECT * FROM infos LIMIT ". ($pg -1) * $lim .','. $lim);

	if ($res->num_rows == 0)
		break;
	while ($row = $res->fetch_assoc()) {
		$info = (array)@json_decode($row['info']);

		$n = ip2long($info['ip']);
		$info['ip'] = md5($n);
		$json = json_encode($info);

		$q .= "('". $row['id']. "', '". $mysqli->real_escape_string($json) ."'),";
	}
	$q = substr($q, 0, strlen($q)-1);
	echo strlen($q)."\n";

	$mysqli->query($q);
	echo $mysqli->error;
	if ($mysqli->error)
		exit;
	$pg++;
}
