<?php
// parse program stats
include('/var/www/html/cretetv/stats/config.php');
define('TIMEEL', 60);
define('TIMEPR', 60 * 30);

$tms = time()-86400 * 1;
//$tms = strtotime('2025-09-01');
$isUpdate = 0;
function saveProgram($tms, $items, $mysqli, $getDurations = true) {
	global $isUpdate;

	$readOnly = 0;
	$cnts = []; $ranges = []; $cstart = []; $cend = []; $vgt1 = []; $compares = []; $zero = [];
	$stTs = mktime(0, 0, 0, date('n', $tms), date('j', $tms), date('Y', $tms)); $totalDuration = []; $skipVgt1 = 0; $viewerIds = [];

	$stTs = $items[0]['start']; $enTs = $items[count($items)-1]['end'];
	$todayTsCond = " (intime BETWEEN UNIX_TIMESTAMP('". date('Y-m-d H:i:s', $stTs) ."') AND UNIX_TIMESTAMP('". date('Y-m-d H:i:s', $enTs) ."')";

	$cond = $todayTsCond;
	$cond .= " OR (intime <= ". $stTs ." AND outtime > ". $stTs ."))";
	//echo $cond;exit;
	//print_r($items);
	$lastStart = 0; $lastEnd = 0;

	foreach ($items as $item) {
		$sts = $item['start'];
		$ets = $item['end'];
		$duration = $ets - $sts;

		$cnts[$sts] = 0;
		$cstart[$sts] = 0;
		$cend[$sts] = 0;
		$viewerIds[$sts] = [];
		$vgt1[$sts] = 0;
		$zero[$sts] = 0;
		$totalDuration[$sts] = 0;
		$ranges[$sts] = $ets;

		if ($duration > 60 * 5 - 1) { // create stats for comparisation
			$compares[$sts] = [];
			for ($i = 1; $i < (int)($duration / TIMEEL) + 2; $i++) {
				$compares[$sts][$i] = 0;
			}
		}
	}
	//print_r($ranges);exit;

	if ($getDurations) {
		echo 'Getting durations for '. $cond ."\n";
		$pm = new DateTime();
		$pm->sub(new DateInterval('P1M'));
		$pmTs = $pm->getTimestamp();
		$table = "redbutton.access_archiv";
		if (time() - $tms > 2 * 30 * 86400)
			$table = "redarchiv.archiv_". date('Y', $tms) .'_'. date('m', $tms);

		$q = "SELECT id, smartid, intime, outtime FROM $table WHERE channel = 'cretetv' AND ". $cond;
		echo "[$q]\n";
		$res = $mysqli->query($q);
		echo $mysqli->error. "\n";
		echo "Got ". $res->num_rows ." durations\n";
		$test = 0; $do1 = 1;
		$bef=$ins=0;$ids=[];

		again:
		while ($row = $res->fetch_assoc()) {
			$vstart = $row['intime'];
			$vend = $row['outtime'];
			$id = $row['id'];
			$smartid = $row['smartid'];

			foreach ($ranges as $pstart=>$pend) {
				$lim=120;
				if ($pend - $pstart > $lim && $vstart < $pend && $vend > $pstart && ($vend - $vstart) < 4 * 3600) {
					// check also case that visit start is before program start and that end is not less than one minute - and same for end
					$go = true;
					$diffStart = 0; $diffEnd = 0;

					if ($vstart < $pstart)
						$diffStart = $vend - $pstart;

					if ($vend > $pend)
						$diffEnd = $vend - $pend;

					if ($diffStart && $diffStart < 60)
						$go = false;
					if ($diffEnd && $vstart > $pstart && $pend - $vstart < 60 && $diffEnd < 60)
						$go = false;

					if ($go) {
						$vgt1[$pstart]++;
					}
				}
				if ($vstart <= $pstart && $vend >= $pstart) {
					//if ($pstart == 1561328046) echo 'hit '. date('r', $vstart). ' id '. $id .' cnt '. $cstart[$pstart] ."\n";
					$cstart[$pstart]++;

					if (isset($compares[$pstart])) {
						$t = $pstart; $i = 1;

						while ($t <= $vend && $t <= $pend) {
							$compares[$pstart][$i]++;
							$t += TIMEEL;
							$i++;
						}
					}
				}

				if ($vstart <= $pstart && $vend >= $pend) {
					$cend[$pstart]++;
					if ($pend - $pstart > 5 * 60-1) {
						$viewerIds[$pstart][] = $id;
					}
				}


				if (($vstart >= $pstart && $vstart <= $pend) ||
					($vstart <= $pstart && $vend > $pstart)) {
					$cnts[$pstart]++;
					if (0 && $pstart == 1727834400) {
						echo $smartid .' '. date('r', $vstart) .' to '. date('r', $vend) ."\n";
						$ids[]=$smartid;
						if ($vstart < $pstart)
							$bef++;
						else if ($vstart >= $pstart)
							$ins++;
					}

					if ($vstart == $vend)
						$zero[$pstart]++;
					else {
						$dur = $vend - $vstart;
						if ($dur > $pend - $pstart)
							$dur = $pend - $pstart;

						$totalDuration[$pstart] += $dur;
					}
				}
			}
		}
		$ts2 = $tms+86400;
		$todayTsCond = "channel ='cretetv' AND intime BETWEEN UNIX_TIMESTAMP('". date('Y-m-d 00:00:00', $ts2) ."') AND UNIX_TIMESTAMP('". date('Y-m-d H:i:s', $enTs) ."')";
		$cond = $todayTsCond;
		$cond .= " OR (intime <= ". $stTs ." AND outtime > ". $stTs .")";
		$table = "redbutton.access_log";
		echo("SELECT id, smartid, intime, outtime FROM $table WHERE ". $cond);

		$res = $mysqli->query("SELECT id, smartid, intime, outtime FROM $table WHERE ". $cond);
		echo $mysqli->error. "\n";
		echo "$table Got ". $res->num_rows ." durations\n";

		if ($do1) {
			$do1 = false;
			goto again;
		}
		/*
		$cond = "((intime >= UNIX_TIMESTAMP('2024-10-02 04:00:00') and outtime > UNIX_TIMESTAMP('2024-10-02 04:00:00')) or (intime < UNIX_TIMESTAMP('2024-10-02 04:00:00') and outtime > UNIX_TIMESTAMP('2024-10-02 04:00:00')) or (intime >= UNIX_TIMESTAMP('2024-10-02 04:00:00') and outtime < UNIX_TIMESTAMP('2024-10-02 06:00:00')))";
		$res = $mysqli->query("SELECT smartid, intime, outtime FROM redbutton.access_log WHERE channel='cretetv' AND $cond");
		while ($row = $res->fetch_assoc()) {
			$id = $row['smartid'];
			$nids[]=$id;
		}
		foreach ($ids as $id) {
			if (!in_array($id, $nids))
				die($id);
		}
		exit;
*/

		if (count($compares)) {
			echo 'Saving '. count($compares). " compares..\n";
			foreach ($compares as $ts => $v) {
				$mysqli->query("REPLACE INTO compares SET ts = ". $ts .", v = '". implode(',', $v) ."'");
				echo $mysqli->error;
			}
		}

		echo "saving counts ". count($cnts). "\n";
		//print_r($ranges); print_r($cnts); exit;
		foreach ($cnts as $k => $cnt) {
			$mysqli->query("UPDATE program SET cnt = ". $cnt ." WHERE start = ". $k);
		}

		//print_r($cstart);
		echo "saving start end counts ". count($cstart). "\n";
		foreach ($cstart as $ts => $cnt) {
			$avg = 0; $vgt5 = $cnts[$ts] - $zero[$ts];
			if ($vgt5) {
				$avg = $totalDuration[$ts] / $vgt5;
				//echo 'for '. $ts .': '. $totalDuration[$ts] .' / '. $vgt5 ." $avg\n";
			}
			$mysqli->query("UPDATE program SET count_start = ". $cnt .", count_end = ". $cend[$ts] .", zero = ". $zero[$ts] .", vgt1 = ". $vgt1[$ts] .", avg_duration = ". $avg ." WHERE start = ". $ts);
			echo $mysqli->error;
			//echo date('r', $ts). " start ". $cnt ." end ". $cend[$ts]. "\n";
		}
	}
}

if (0) {
	for ($i = 41;$i > 0; $i--) {
		$tms = time()-86400 * $i;
		$dt = date('Y-m-d', $tms);

		echo "Getting program for ". date('r', $tms). "\n";

		$items = [];
		echo("SELECT * FROM program WHERE dt = ". date('Ymd', $tms)."\n");
		$res = $mysqli->query("SELECT * FROM program WHERE dt = ". date('Ymd', $tms));
		echo $mysqli->error;

		while ($row = $res->fetch_assoc()) {
			$items[] = $row;
		}

		saveProgram($tms, $items, $mysqli, true);
	}
	exit;
}

echo "Getting program for ". date('r', $tms). "\n";
$dt = date('Y-m-d', $tms);

$items = [];
echo("SELECT * FROM program WHERE dt = ". date('Ymd', $tms)."\n");
$res = $mysqli->query("SELECT * FROM program WHERE dt = ". date('Ymd', $tms));
echo $mysqli->error;

while ($row = $res->fetch_assoc()) {
	$items[] = $row;
}
if (!count($items)) {
	$stTs = mktime(0, 0, 0, date('n', $tms), date('j', $tms), date('Y', $tms));
	$du = 15*60;
	$t = $stTs; $endTs = $stTs + 86400;

	while ($t < $endTs + 86400) {
		$du = TIMEPR;
		$sts = $t;
		$ets = $t+$du;
		$mysqli->query("REPLACE INTO program SET vgt1 = 0, zero = 0, avg_duration = 0, customer='', descr='', end = ". ($t+$du) .", start = ". $t .", title = '-', dt = ". date('Ymd', $tms) .", duration = ". $du);
		if ($mysqli->error) {
			echo $mysqli->error. "\n";
			exit;
		}

		$t += TIMEPR;
	}
	$res = $mysqli->query("SELECT * FROM program WHERE dt = ". date('Ymd', $tms));
	while ($row = $res->fetch_assoc()) {
		$items[] = $row;
	}
}

saveProgram($tms, $items, $mysqli, true);
?>
