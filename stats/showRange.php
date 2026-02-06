<?php
require_once('config.php');
//$mc = new Memcached(); 
//$mc->addServer("localhost", 11211); 

$pm = new DateTime();
$pm->sub(new DateInterval('P1M'));
$pmTs = $pm->getTimestamp();

$from = $_GET['from'];
$to = $_GET['to'];
$ctype = $_GET['ctype'];
$visitsTime = $_GET['visitsTime'];
$more = $_GET['more'];
$out = [];

$addq = "channel = 'cretetv' AND ";
$table = "redbutton.access_archiv";
if (date('Ymd', $from) == date('Ymd'))
	$table= 'redbutton.access_log';
$extra = '';
$lim = 100;
if ($more)
	$lim = '100, 7900';
$jsonFname = "json/range-$from-$to-$lim.json";

if (!$from || !$to) {
	$out['error'] = "No from or to found";
} else {
	// these are saved to memcached by parseProgram.php
	$dec = [];

	if (count($dec)) {
		foreach ($dec as $item) {
			$row['id'] = $item->id;
			$row['ts'] = $item->ts;
			$row['end'] = $item->end;
			$row['duration'] = $item->end - $item->ts;

			$out[] = $row;
		}
	} else if (file_exists($jsonFname)) {
		$out = json_decode(file_get_contents($jsonFname), true);
	} else {
		if (1 && $_GET['test']) {
			echo("(SELECT id, intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". $from ." AND ". $to .") UNION (SELECT id, intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND outtime > ". $to .")");
			exit;
		}
		if ($_GET['test']) {
			echo("SELECT DISTINCT ip FROM visits WHERE ts BETWEEN ". $from ." AND ". ($to + $visitsTime) .$add);
			exit;
		}

		$res = $mysqli->query("(SELECT smartid, intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". $from ." AND ". $to .") UNION (SELECT smartid, intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND outtime > ". $from .") ORDER BY outtime - intime DESC LIMIT ".$lim);
		if ($mysqli->error) {
			echo "Error 1: ". $mysqli->error."\n";
		}

		while ($row = $res->fetch_assoc()) {
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
	}
}
echo json_encode($out);
function tm($d) {
	return date('H:i:s', $d);
}
