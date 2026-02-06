<?php
// fill table all smids for one or more days
require("config.php");
$dupmysqli = new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$tms = time()-86400 * 1;
define('START_SMIDS', 20191027);
define('START_MONTH', 20190901);
define('START_SMIDS_TS', strtotime(START_SMIDS));

function getTable($ts) {
	$pm = new DateTime();
	$pm->sub(new DateInterval('P1M'));
	$pmTs = $pm->getTimestamp();
	$table = "durations_n";
	if ($ts < $pmTs)
		$table = "durations_". date('mY', $ts);
	return $table;
}

function unique($v) {
	global $prev;
	return !in_array($v, $prev);
}

function getMonthIds($ts) {
	global $mysqli, $dupmysqli;

	$ids = [];
	echo("SELECT DISTINCT smart_id FROM ". getTable($ts) ."\n");
	$res = $mysqli->query("SELECT DISTINCT smart_id FROM ". getTable($ts));

	while ($row = $res->fetch_row()) {
		$ids[] = $row[0];
	}
	return $ids;
}

function getIds($ts) {
	global $mysqli, $dupmysqli;

	$ids = [];
	echo("SELECT DISTINCT smart_id FROM ". getTable($ts) ." WHERE ts < ". $ts ."\n");
	$res = $mysqli->query("SELECT DISTINCT smart_id FROM ". getTable($ts) ." WHERE ts < ". $ts);

	while ($row = $res->fetch_row()) {
		$ids[] = $row[0];
	}
	return $ids;
}

if (1) { // build ids
	// previous month
	$ids = getMonthIds(strtotime(START_MONTH));
	echo 'For '. START_MONTH .' got '. count($ids) ."\n";

	for ($dt = START_SMIDS; $dt < date('Ymd', $tms); $dt++) {
		echo '----- DT '. $dt ." ------\n";

		$new = getIds(strtotime($dt));
		echo 'new '. count($new) ."\n";

		$mer = array_merge($ids, $new);
		echo 'merged '. count($mer) ."\n";

		$ids = array_unique($mer);

		echo 'For day '. $dt ." now ".  count($ids) ." ids\n";

		$data = pack('I*', ...$ids);
		$mysqli->query("REPLACE INTO all_smids SET dt = ". $dt .", data = '". mysqli_escape_string($mysqli, $data) ."'");
	}
} else if (1) { // update program new ids
	for ($dt = START_SMIDS; $dt < date('Ymd', $tms); $dt++) {
		$ts = strtotime($dt);
		echo '----- DT '. $dt ." ------\n";

		$res = $mysqli->query("SELECT data FROM all_smids WHERE dt = ". $dt);

		$ids = [];
		if ($row = $res->fetch_row()) {
			$ids = unpack('I*', $row[0]);
			echo 'Got '. count($ids) ." smart ids\n";

			$ranges = []; $newIds =[];
			echo("SELECT start, end FROM program_run WHERE dt = ". $dt ."\n");
			$res = $mysqli->query("SELECT start, end FROM program_run WHERE dt = ". $dt);

			while ($row = $res->fetch_row()) {
				$sts = $row[0];
				$ets = $row[1];

				$ranges[$sts] = $ets;
				$newIds[$sts] = 0;
			}

			echo "getting visits\n";
			echo("SELECT ts, end, smart_id FROM durations_n WHERE smart_id > 0 AND ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 23:59:59')\n");
			$res = $mysqli->query("SELECT ts, end, smart_id FROM durations_n WHERE smart_id > 0 AND ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 23:59:59')");
			echo 'Got '. $res->num_rows ." visits\n";
			while ($row = $res->fetch_row()) {
				$vstart = $row[0];
				$vend = $row[1];
				$smartId = $row[2];
				//echo $vstart .', '. $vend .', '. $smartId ."\n";

				foreach ($ranges as $pstart=>$pend) {
					if ($vstart <= $pstart && $vend >= $pstart) {
						if ($smartId && !in_array($smartId, $ids))
							$newIds[$pstart]++;
					}
				}
			}

			foreach ($newIds as $ts => $cnt) {
				//$mysqli->query("UPDATE program_run SET new = ". $newIds[$ts] ." WHERE start = ". $ts);
				if ($cnt)
					echo("UPDATE program_run SET new = ". $newIds[$ts] ." WHERE start = ". $ts ."\n");
			}
		}
	}
}
