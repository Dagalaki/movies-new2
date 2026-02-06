<?php
require("/var/www/html/cretetv/stats/config.php");
$ts = time() - 86400 * 1;
$sdt = 20241001; $dt = date('Ymd', $ts);

function getAll($dt, $channel) {
	global $mysqli;
	$res = $mysqli->query("SELECT data FROM unique_ids WHERE channel = '". $channel ."'");

	if ($row = $res->fetch_row()) {
		$ids = explode(',', $row[0]);
		return $ids;
	}
	return [];
}

function getIds($dt, $channel) {
	global $mysqli;
	//echo("SELECT data, nocookie FROM ids WHERE channel = '". $channel ."' AND dt = ". $dt);;exit;
	$res = $mysqli->query("SELECT data, nocookie FROM ids WHERE channel = '". $channel ."' AND dt = ". $dt);

	if ($row = $res->fetch_row()) {
		$ids = explode(',', $row[0]);
		$noc = explode(',', $row[1]);
		$a = [];
		$a['ids'] = $ids;
		$a['noc'] = $noc;
		return $a;
	}
	return [];
}
if (1) {
	$mysqli->query("UPDATE unique_ids SET data = '' WHERE channel = 'cretetv'");

	$sts = strtotime($sdt); $newIds = [];
	while ($sts < $ts+86400) {
		echo "date ". date('Y-m-d', $sts) ."\n";
		$dt = date('Ymd', $sts); $ids = []; $noc = [];

		$a = getIds($dt, 'cretetv');
		if (isset($a['ids']))
			$ids = $a['ids'];
		if (isset($a['noc']))
			$noc = $a['noc'];

		$ids = array_diff($ids, $noc);
		if (count($newIds))
			$dayNewIds = array_diff($ids, $newIds);
		else
			$dayNewIds = $ids;

		if (!count($dayNewIds)) {
			echo "empty new ids\n";
			$sts += 86400;
			continue;
		}
		$newIds = array_unique(array_merge($newIds, $dayNewIds));
		echo date('r', $sts) ." new ". count($newIds) ." day ". count($dayNewIds) ."\n";
		//$sts += 86400;
		//continue;
		//print_r($dayNewIds);
		//exit;

		$mysqli->query("UPDATE extra SET new = ". count($dayNewIds) .", newStart = ". count($newIds) ." WHERE dt = ". $dt ." AND channel = 'cretetv'");
		$mysqli->query("UPDATE unique_ids SET data = '". implode(',', $newIds) ."' WHERE channel = 'cretetv'");

		$sts += 86400;
	}
	exit;
} else {
	echo "date ". date('Y-m-d', $ts) ."\n";
	$dt = date('Ymd', $ts);

	$newIds = getAll($dt, 'cretetv');
	$a = getIds($dt, 'cretetv');
	$ids = $a['ids'];
	$noc = $a['noc'];

	$ids = array_diff($ids, $noc);
	echo 'newids '. count($newIds)."\n";
	echo 'ids '. count($ids)."\n";
	$dayNewIds = array_diff($ids, $newIds);
	echo 'day new ids '. count($dayNewIds)."\n";

	$newIds = array_unique(array_merge($newIds, $dayNewIds));
	//echo $dt ." new ". count($newIds) ." day ". count($dayNewIds) ."\n";exit;

	echo("UPDATE extra SET new = ". count($dayNewIds) .", newStart = ". count($newIds) ." WHERE dt = ". $dt ." AND channel = 'cretetv'\n");
	$mysqli->query("UPDATE extra SET new = ". count($dayNewIds) .", newStart = ". count($newIds) ." WHERE dt = ". $dt ." AND channel = 'cretetv'");
	echo $mysqli->error;
	$mysqli->query("UPDATE unique_ids SET data = '". implode(',', $newIds) ."' WHERE channel = 'cretetv'");
}
echo "Found ". count($a['ids']) .", noc ". count($a['noc']) ."\n";

