<?php
function fm($n) {
	return number_format($n, 0, ',', '.');
}
function percent($x, $total) {
	if (!$total)
		return 0;
	$percent = ($x * 100) / $total;
	return number_format( $percent, 2 ); // change 2 to # of decimals
}
require_once('config.php');
function dt($ts) {
	return date('D d M', $ts);
}
function timer_diff($timeStart)
{
    return number_format(microtime(true) - $timeStart, 3). ' sec.';
}
function getDuration($secs) {
	$secs = floor($secs);
	$duration = '';
	$days = floor($secs / 86400);
	$secs -= $days * 86400;
	$hours = floor($secs / 3600);
	$secs -= $hours * 3600;
	$minutes = floor($secs / 60);
	$seconds = $secs - $minutes * 60;

	if($days > 0) {
		$duration .= $days . 'd';
	}
	if($hours > 0) {
		$duration .= ' ' . $hours . 'h';
	}
	if($minutes > 0) {
		$duration .= ' ' . $minutes . 'm';
	}
	if($seconds > 0) {
		$duration .= ' ' . $seconds . 's';
	}
	return $duration;
}

$visitsTime = $_GET['visitsTime'];
$curDt = $_GET['curDt'];
$showGenius = $_GET['showGenius'];
$showReppa = $_GET['showReppa'];

$add = '';

if ($showReppa)
	$add = " AND customer LIKE '%Reppa%'";

if ($showGenius)
	$add = " AND customer LIKE '%Genius%'";

if (1) {
$filename = ($showReppa ? 'reppa':'genius') .'-'. $curDt;
header('Content-Type: application/csv');
header('Content-Disposition: attachment; filename='. $filename .'.csv');
header('Pragma: no-cache');
}

$program = [];
$res = $mysqli->query("SELECT * FROM program_run WHERE dt = ". $curDt . $add);
while ($row = $res->fetch_assoc()) {
	$program[] = $row;
}

if (0) {
$table = "durations_n"; $from = strtotime($curDt);
if ($from < $pmTs) {
	$table = "durations_". date('mY', $from);
}

$res = $mysqli->query("SELECT COUNT(*) FROM ". $table ." WHERE ts != end AND end - ts >= 10 AND ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $from) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $from) ." 23:59:59')");
echo $mysqli->error;
if ($row = $res->fetch_row())
	$totalMorethan10 = $row[0];

$res = $mysqli->query("SELECT new_piwik, new FROM total_new WHERE dt = ". $curDt);
echo $mysqli->error;
if ($row = $res->fetch_row()) {
	$newPiwik = $row[0];
	$newSmids = $row[1];
}
}

$k = 1;
echo '"","Start","Title","End","Duration","Visits","Visits start","Visits end","Viewers > 1 minute","Avg duration"'."\n";
foreach ($program as $row) {
	$cnt = $row['cnt'];
	echo '"'. $k .'","'. date('H:i:s', $row['start']) .'","'. str_replace('"', "'", $row['title']);

	if ($row['inf'])
		echo " ". $row['inf'];

	if ($row['customer'])
		echo " ". $row['customer'];
	$ctype = 0;
	if (preg_match('#Reppa#si', $row['customer'])) {
		$ctype = 2;
	} else if (preg_match('#Genius#si', $row['customer']))
		$ctype = 1;

	echo '","'. date('H:i:s', $row['end']) .'","'. getDuration($row['duration']) .'","';
	$more='';
	if ($ctype && $row['visited']) {
		$n = $row['visited'];
		$ctype == 1 ? $geniusPageVisits += $n : $reppaPageVisits += $n;
		$more .= ' (' .$n. ')';
	}

	echo ($cnt > 1 ? fm($cnt) .' visits'.$more : '-') .'","'. $row['count_start'] .'","'. $row['count_end'] .'","';
	echo ($row['vgt1'] ? $row['vgt1'] .' '. percent($row['vgt1'], $row['cnt']) .'%' : '') .'","';
	echo ($row['vgt1'] ? getDuration($row['avg_duration']) : '') ."\"\n";
	++$k;
}

