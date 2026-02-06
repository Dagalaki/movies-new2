<?php
require_once('config.php');

$from = $_GET['dt'];
$start = $_GET['from'];
$per10 = (bool)$_GET['per10'];

if (!$from || !$start)
	die("No from found");

//echo $from ."\n";
$from = strtotime(urldecode($from));

$total = 0;
define('TIMEEL', $per10 ? 10 : 30);
define('DEBUG', false);
define('RETURN_PROGRAM', false);
define('CACHE', true);

$to = $from + TIMEEL;
$program = []; $out = []; $visits = [];
//echo $from ."\n"; echo date('r', $from);exit;

if (CACHE && $mc) {
	// note: if we should return program we have to do it below
	$key = $per10 ? 'convisits.v2.run.10.'.$from : 'convisits.v2.run.'.$from;

	$dec = json_decode($mc->get($key));

	foreach ($dec as $item) {
		$vstart = $item->ts;
		$vend = $item->end;

		$row['id'] = $item->id;
		$row['ts'] = $vstart;
		$row['end'] = $vend;
		$row['stm'] = (date('d', $vstart) != date('d', $from) ? date('d M', $vstart).' ' : ''). date('H:i:s', $vstart);
		$row['etm'] = (date('d', $vend) != date('d', $to) ? date('d M', $vend).' ' : ''). date('H:i:s', $vend);
		$row['eh'] = date('H', $vend);
		$row['em'] = minFloor(date('i', $vend));

		$visits[] = $row;
	}

	if (count($visits)) {
		$start = $from - 5 * 3600;
		$d = date('d', $start);
		$m = date('m', $start);
		$Y = date('Y', $start);
		$h = date('H', $start);
		$sts = strtotime("$d.$m.$Y $h:00:00");

		$out['visits'] = $visits;
		$out['from'] = $from;
		$out['to'] = $to;
		$out['minTs'] = $sts;
		$out['maxTs'] = $sts + 13 * 3600;
		$a = []; $tss = [];
		for ($t = $out['minTs']; $t < $out['maxTs']; $t += 3600) {
			$a[] = date('H', $t);
			$tss[] = $t;
		}
		$out['hours'] = $a;
		$out['tss'] = $tss;

		echo json_encode($out); exit;
	}
}

if (RETURN_PROGRAM) {
	$res = $mysqli->query("SELECT start, end, title, inf FROM program WHERE dt = ". date('Ymd', $from));

	while ($row = $res->fetch_assoc()) {
		$program[] = $row;
	}
}

$pm = new DateTime();
$pm->sub(new DateInterval('P1M'));
$pmTs = $pm->getTimestamp();
$table = "redbutton.access_archiv";

if (DEBUG)
	echo("SELECT id, ts, end FROM ". $table ." WHERE duration > 0 AND (ts BETWEEN ". $start ." AND ". $to ." OR (ts BETWEEN ". ($start - 86400 * 7) ." AND ". $start ." AND end > ". $start .")) ORDER BY ts\n");

$res = $mysqli->query("SELECT smartid, intime, outtime FROM ". $table ." WHERE intime != outtime AND (intime BETWEEN ". $start ." AND ". $to ." OR (intime BETWEEN ". ($start - 86400 * 7) ." AND ". $start ." AND outtime > ". $start .")) ORDER BY intime");
if ($mysqli->error) {
	echo "Error: ". $mysqli->error."\n";
}
if (DEBUG)
	echo("Found ". $res->num_rows ."\n");

while ($row = $res->fetch_assoc()) {
	$vstart = $row['intime'];
	$vend = $row['outtime'];
	if (DEBUG) echo date("H:i:s", $vstart). ' - '. date("H:i:s", $vend). " start ". $start ." (". date("d H:i:s", $start). ")\n";

	if ($vstart <= $start && $vend > $from) {
		$row['stm'] = (date('d', $vstart) != date('d', $from) ? date('d M', $vstart).' ' : ''). date('H:i:s', $vstart);
		$row['etm'] = (date('d', $vend) != date('d', $to) ? date('d M', $vend).' ' : ''). date('H:i:s', $vend);

		$visits[] = $row;
	}
}
if (RETURN_PROGRAM)
	$out['program'] = $program;
$out['visits'] = $visits;
$out['from'] = $from;
$out['to'] = $to;
$out['minTs'] = $from - 6 * 3600;
$out['maxTs'] = $from + 7 * 3600;

$a = []; $tss = [];
for ($t = $out['minTs']; $t < $out['maxTs']; $t += 3600) {
	$a[] = date('H', $t);
	$tss[] = $t;
}
$out['hours'] = $a;
$out['tss'] = $tss;

if (DEBUG) {
	print_r($out);exit;
}
echo json_encode($out);

function minFloor($m) {
	$r = 0;
	if ($m >= 0 && $m < 8)
		$r = 0;
	else if ($m >= 8 && $m < 23)
		$r = 15;
	else if ($m >= 23 && $m < 38)
		$r = 30;
	else if ($m >= 38 && $m < 53)
		$r = 45;
	else if ($m >= 53 && $m < 60)
		$r = 60;
	return $r;
}
?>
