<?php
//create some json for rang, cols
require_once('/var/www/html/cretetv/stats/config.php');
$ts = time()-86400 * 1;
$lim=100;
$res = $mysqli->query("SELECT start, end, title FROM program WHERE dt = ". date('Ymd', $ts));
$addq = "channel = 'cretetv' AND ";
$table = "redbutton.access_archiv";
while ($row = $res->fetch_assoc()) {
	$from = $row['start'];
	$to = $row['end'];
	echo date('r', $from).' '. $row['title'] ."\n";

	$jsonFname = "/var/www/html/cretetv/stats/json/range-$from-$to-$lim.json";
	if (file_exists($jsonFname))
		continue;
	echo " > $jsonFname\n";

	$rrr = $mysqli->query("(SELECT smartid, intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". $from ." AND ". $to .") UNION (SELECT smartid, intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND outtime > ". $from .") ORDER BY outtime - intime DESC LIMIT ".$lim);
	if ($mysqli->error) {
		echo "Error 1: ". $mysqli->error."\n";
		exit;
	}
	echo "Got ". $rrr->num_rows ." rows\n";

	while ($row = $rrr->fetch_assoc()) {
		$vstart = $row['intime'];
		$vend = $row['outtime'];
		$row['duration'] = $row['outtime'] - $row['intime'];
		$row['start'] = tm($vstart);
		$row['end'] = tm($vend);

		if (($vstart >= $from && $vstart <= $to) ||
			($vstart <= $from && $vend > $from)) {
			$out[] = $row;
		}
	}
	file_put_contents($jsonFname, json_encode($out));

	$jsonFname = "/var/www/html/cretetv/stats/json/cols-$from-$to.json";
	if (file_exists($jsonFname))
		continue;
	echo " > $jsonFname\n";
	$rrr = $mysqli->query("SELECT intime, outtime, smartid FROM ". $table ." WHERE $addq (intime BETWEEN ". $from ." AND ". $to ." OR (intime BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND outtime > ". $from ."))");
	echo "Got ". $rrr->num_rows ." rows\n";
	while ($row = $rrr->fetch_assoc()) {
		$rows[] = $row;
	}
	file_put_contents($jsonFname, json_encode($rows));
}
function tm($d) {
	return date('H:i:s', $d);
}
