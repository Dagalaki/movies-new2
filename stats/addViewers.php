<?php
// parse program and add viewers
require("config.php");
$dupmysqli = new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$doRep = 1;
define('PERC', 90);

$tms = time()-86400 * 1;
function getProgram($tms, $json, $mysqli) {
	global $dupmysqli, $doRep;

	$readOnly = 0;
	$stTs = mktime(0, 0, 0, date('n', $tms), date('j', $tms), date('Y', $tms)); $viewerIds = []; $mapTitle = []; $ranges = [];

	$cond = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $tms) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $tms) ." 23:59:59')";
	$cond .= " OR (ts <= ". $stTs ." AND end > ". $stTs .")";

	$lastStart = 0; $lastEnd = 0;

	foreach ($json as $item) {
		$sts = strtotime($item->begin);
		$ets = strtotime($item->end);
		$dt = date('Ymd', $sts);
		$duration = $ets - $sts;
		if (!isset($item->commercials))
			$item->commercials = '';

		$viewerIds[$sts] = [];
		$ranges[$sts] = $ets;
		$hash[$sts] = md5($item->article.' '.date('Hi', $sts));
		//echo $hash[$sts]. ' '. $item->article .' '. date('H:i:s', $sts) ."\n";

		//echo(date('r', $sts) .' -- '. date('r', $ets) ." duration ". $duration ."\n");

		if ($sts == 1557791119 || $sts > $ets || $ets - $sts > 6 * 3600) {
			echo "oops start is > from end, skipping ...\n";
			continue;
		}

		if ($lastStart && $lastEnd && $lastEnd != $sts) {
			$ranges[$lastStart] = $sts;
		}
		$lastStart = $sts; $lastEnd = $ets;
	}

	echo 'Getting durations for '. $cond ."\n";
	$pm = new DateTime();
	$pm->sub(new DateInterval('P1M'));
	$pmTs = $pm->getTimestamp();
	$table = "durations_n";
	if ($tms < $pmTs)
		$table = "durations_". date('mY', $tms);
	$res = $mysqli->query("SELECT id, ts, end FROM $table WHERE ". $cond);
	echo "Got ". $res->num_rows ." durations\n";
	echo $mysqli->error. "\n";
	$cache = [];
	$test = 0;

	while ($row = $res->fetch_assoc()) {
		$vstart = $row['ts'];
		$vend = $row['end'];
		$id = $row['id'];

		foreach ($ranges as $pstart=>$pend) {
			if (($vstart < $pstart && $vend > $pstart) ||
				($vstart > $pstart && $vstart < $pend)) {
				$cst = $pstart; $cen = $pend;

				if ($vstart > $pstart)
					$cst = $vstart;
				if ($vend < $pend)
					$cen = $vend;
				$vdur = $cen - $cst;
				$pdur = $pend - $pstart;

				//if ($vstart <= $pstart && $vend >= $pend) {
				if ($pdur > 5 * 60-1) {
					$per = ($vdur * 100) / $pdur;
					if ($per >= PERC) {
						//echo "progr: ". date('r', $pstart) ." - ". date('r', $pend) .'. visit '. date('r', $vstart) .' '. date('r', $vend) ."\n";
						//echo "for program duration $pdur percent of $vdur is $per\n";
						$viewerIds[$pstart][] = $id;
					}
				}
			}
		}
	}
	foreach ($viewerIds as $ts=>$v) {
		if (!count($v))
			continue;
		$h = $hash[$ts];
		$q = 'REPLACE INTO viewers (ts, id, hash) VALUES ';

		foreach ($v as $id) {
			$q .= '('. $ts .', \''. $id .'\', \''. $h .'\'),';
		}
		$q = substr($q, 0, strlen($q)-1);

		$mysqli->query($q);
		if ($mysqli->error) {
			Echo "Failed [$q]\n";
			echo $mysqli->error;
			exit;
		}
		$dupmysqli->query($q);
	}
}

//for ($i = 2;$i < 124; $i++) {
for ($i = 1;$i > 0; $i--) {
	$tms = time()-86400 * $i;
	$dt = date('Y-m-d', $tms);
	$url = 'https://www.anixehd.tv/ait/runas/expo.php?ch=anixehd&day='. $dt;
	echo $url. "\n";
	$data = file_get_contents($url);

	$json = json_decode($data);
	getProgram($tms, $json, $mysqli);
}
?>
