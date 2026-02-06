<?php
// outputs a total number for visits in a date / time range
require_once('config.php');

$pm = new DateTime();
$pm->sub(new DateInterval('P1M'));
$pmTs = $pm->getTimestamp();

$sdt = $_GET['sdt'];
$edt = $_GET['edt'];
$st = $_GET['st'];
$et = $_GET['et'];
$cst = $_GET['cst'];
$cet = $_GET['cet'];
$du = $_GET['du'];
$out = [];

$table = "durations";
if ($from < $pmTs)
        $table = "durations_". date('mY', $from);

$debug = 0;
if (!$sdt || !$edt) {
	$out['error'] = "No from or to found";
} else {
	$from = strtotime($sdt.' '. ($cst ? $cst : $st));
	$dur = strtotime($sdt.' '. ($cet ? $cet : $et)) - $from;

	$end = strtotime($edt.' '.($cst ? $cst : $st));
	//echo "[$from]". strtotime($sdt.' '. ($cet ? $cet : $et)) ."[$dur]";

	$ts = $from;
	$total = 0;

	// get visits for every day
	while ($ts < $end+1) {
		$table = "durations_n";
		if ($ts < $pmTs)
			$table = "durations_". date('mY', $ts);
		$to = $ts + $dur;

		$cond = "WHERE";

		if ($debug) {
			echo("SELECT COUNT(*) FROM ". $table ." ". $cond ." (ts BETWEEN ". $ts ." AND ". $to .") OR (ts <= ". $from ." AND end > ". $from .") AND (end - ts) >= ". ($du-4) ."\n");
		}
		$res = $mysqli->query("SELECT COUNT(*) FROM ". $table ." ". $cond ." ((ts BETWEEN ". $ts ." AND ". $to .") OR (ts <= ". $from ." AND end > ". $from ." )) AND (end - ts) >= ". ($du-4));
		if ($mysqli->error) {
			echo $mysqli->error;
			exit;
		}

		if ($row = $res->fetch_row()) {
			$total += $row[0];
			if ($debug) {
				echo "got $row[0]\n";
			}
		}
		$ts+= 86400;
	}
	$out['total'] = $total;
}
//print_r($out);
echo json_encode($out);
