<?php
require("config.php");
$doRep = 0;
define('TIMEEL', 60);

$mc = new Memcached(); 
$mc->addServer("localhost", 11211); 
$tms = time()-86400 * 1;
$isUpdate = 0;
function saveProgram($tms, $json, $mysqli, $getDurations = true) {
	global $mc, $doRep, $isUpdate;

	$cnts = []; $ranges = []; $cstart = []; $cend = []; $vgt1 = []; $genius = []; $geniusIPS = []; $compares = []; $reppa = []; $reppaIPS = []; $zero = [];
	$stTs = mktime(0, 0, 0, date('n', $tms), date('j', $tms), date('Y', $tms)); $totalDuration = []; $skipVgt1 = 0; $viewerIds = []; $hashes = [];

	$todayTsCond = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $tms) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $tms) ." 23:59:59')";

	$cond = $todayTsCond;
	$cond .= " OR (ts <= ". $stTs ." AND end > ". $stTs .")";
	//print_r($json);

	//$d = date_parse_from_format("d.m.Y", $json['Sendeprotokoll']['Datum']);
	//$ts = mktime( $d['hour'], $d['minute'], $d['second'], $d['month'], $d['day'], $d['year']);
	//$dt = date('Ymd', $ts);
	//echo("Date ". $dt. "\n");

	$lastStart = 0; $lastEnd = 0;

	foreach ($json as $item) {
		$sts = strtotime($item->begin);
		$ets = strtotime($item->end);
		$dt = date('Ymd', $sts);
		$duration = $ets - $sts;
		if (!isset($item->commercials))
			$item->commercials = '';

		$cnts[$sts] = 0;
		$cstart[$sts] = 0;
		$cend[$sts] = 0;
		$viewerIds[$sts] = [];
		$vgt1[$sts] = 0;
		$zero[$sts] = 0;
		$totalDuration[$sts] = 0;
		$ranges[$sts] = $ets;
		$hashes[$sts] = md5($item->article.' '.date('Hi', $sts));

		//echo "customer ". $item->article ." duration ". $duration ."\n";
		if (preg_match('#genius#si', $item->commercials) && $duration > 10)
			$genius[$sts] = $ets;

		if (preg_match('#reppa#si', $item->commercials) && $duration > 10)
			$reppa[$sts] = $ets;

		if (preg_match('#Window france24#si', $item->article))
			$skipVgt1 = $sts;

		//echo(date('r', $sts) .' -- '. date('r', $ets) ." duration ". $duration ."\n");

		if ($sts == 1557791119 || $sts > $ets || $ets - $sts > 6 * 3600) {
			echo "oops start is > from end, skipping ...\n";
			continue;
		}

		if ($duration > 60 * 5 - 1) { // create stats for comparisation
			$compares[$sts] = [];
			for ($i = 1; $i < (int)($duration / TIMEEL) + 2; $i++) {
				$compares[$sts][$i] = 0;
			}
		}

		$lastStart = $sts; $lastEnd = $ets;
	}

	if ($getDurations) {
		echo 'Getting durations for '. $cond ."\n";
		$pm = new DateTime();
		$pm->sub(new DateInterval('P1M'));
		$pmTs = $pm->getTimestamp();
		$table = "durations_n";
		if ($tms < $pmTs)
			$table = "durations_". date('mY', $tms);
		echo("SELECT id, ts, end, ip, smart_id FROM $table WHERE ". $cond);
		$res = $mysqli->query("SELECT id, ts, end, ip, smart_id FROM $table WHERE ". $cond);
		echo "Got ". $res->num_rows ." durations\n";
		echo $mysqli->error. "\n";
		$cache = [];
		$test = 0;

		while ($row = $res->fetch_assoc()) {
			$vstart = $row['ts'];
			$vend = $row['end'];
			$id = $row['id'];
			$ip = $row['ip'];
			$smartId = $row['smart_id'];

			foreach ($ranges as $pstart=>$pend) {

				if ($pend - $pstart > 120 && $vstart < $pend && $vend > $pstart && $vend - $vstart >= 60 && ($vend - $vstart) < 4 * 3600 && $skipVgt1 != $pstart) { // one minute or more
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
			}

			foreach ($genius as $pstart=>$pend) {
				if (($vstart >= $pstart && $vstart <= $pend) ||
					($vstart <= $pstart && $vend > $pstart)) {
					if (!isset($geniusIPS[$pstart]))
						$geniusIPS[$pstart] = [];
					$geniusIPS[$pstart][] = $ip;
				}
			}
			foreach ($reppa as $pstart=>$pend) {
				if (($vstart >= $pstart && $vstart <= $pend) ||
					($vstart <= $pstart && $vend > $pstart)) {
					if (!isset($reppaIPS[$pstart]))
						$reppaIPS[$pstart] = [];
					$reppaIPS[$pstart][] = $ip;
				}
			}
		}

		if (count($genius)) {
			echo "Got ". count($genius) ." genius programs\n";
			if ($mysqli->error) {
				echo $mysqli->error;
				exit;
			}

			foreach ($genius as $pstart=>$pend) {
				if (isset($geniusIPS[$pstart]) && count($geniusIPS[$pstart])) {
					$ips = $geniusIPS[$pstart];

					$s = implode($ips);
					$data = pack('a*', $s);
					echo "genius ips length: ". strlen($data) ."\n";
					$mysqli->query("REPLACE INTO customer_ips SET ts = ". $pstart .", data = '". mysqli_escape_string($mysqli, $data) ."'");

					if ($mysqli->error) {
						echo $mysqli->error;
						exit;
					}
				}
			}
		}
		if (count($reppa)) {
			echo "Got ". count($reppa) ." reppa programs\n";
			if ($mysqli->error) {
				echo $mysqli->error;
				exit;
			}

			foreach ($reppa as $pstart=>$pend) {
				if (isset($reppaIPS[$pstart]) && count($reppaIPS[$pstart])) {
					$ips = $reppaIPS[$pstart];

					$s = implode($ips);
					$data = pack('a*', $s);
					echo "$pstart reppa ips length: ". strlen($data) ."\n";
					$mysqli->query("REPLACE INTO customer_ips SET ts = ". $pstart .", data = '". mysqli_escape_string($mysqli, $data) ."', type=1");
				}
			}
		}
	}
}

if (1) {
	for ($i = 2;$i > 0; $i--) {
		$tms = time()-86400 * $i;
		$dt = date('Y-m-d', $tms);
		echo "($i) $dt\n";
		$url = 'https://www.anixehd.tv/ait/runas/expo.php?ch=anixehd&day='. $dt;
		$data = file_get_contents($url);
		if (!$data)
			continue;

		$json = json_decode($data);
		saveProgram($tms, $json, $mysqli, true);
	}
	exit;
}
?>
