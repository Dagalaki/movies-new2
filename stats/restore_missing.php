<?php
require("config.php");

// session end in missing time:
$handle = @fopen("missing2.sql", "r");

if (!$handle)
	die('error reading file');

$pmap = []; $ins = 0; $mis = 0;
while (($buffer = fgets($handle, 4096)) !== false) {
	$a = explode("\t", $buffer);
	$smartId = $a[0];
	$ts = $a[1];
	$end = $a[2];
	$ip = trim($a[3]);

	if (!isset($pmap[$smartId])) {
		echo("SELECT id, end FROM durations_n WHERE ts = ". $ts ." AND smart_id = ". $smartId ." ORDER BY ts DESC LIMIT 1\n");
		$res = $mysqli->query("SELECT id, end FROM durations_n WHERE ts BETWEEN ". ($ts-10) ." AND ". ($ts+10) ." AND smart_id = ". $smartId ." ORDER BY ts DESC LIMIT 1");
		if (!$res->num_rows) {
			echo "Piwik id not found for $smartId\n";
			$mis ++;
			continue;
		}
		$row = $res->fetch_row();
		$pmap[$smartId] = $row[0];
		echo "found entry with end = ". $row[1] ."\n";
	}
	$id = $pmap[$smartId];
	if (!$id) {
		echo "id not found for $smartId\n";
		exit;
	}

	echo("UPDATE durations_n SET end = ". $end ." WHERE id = '". $id ."' AND ts = ". $ts ."\n");
	/*$mysqli->query("UPDATE durations_n SET end = ". $end ." WHERE id = '". $id ."' AND ts = ". $ts ."\n");

	if ($mysqli->error) {
		echo $mysqli->error;
		exit;
	}
	 */
	$ins++;
}
echo "Done $ins inserts, missed $mis\n";

/* new entries:
$handle = @fopen("missing.sql", "r");

if (!$handle)
	die('error reading file');

$pmap = []; $ins = 0; $mis = 0;
while (($buffer = fgets($handle, 4096)) !== false) {
	$a = explode("\t", $buffer);
	$smartId = $a[0];
	$ts = $a[1];
	$end = $a[2];
	$ip = trim($a[3]);

	if (!isset($pmap[$smartId])) {
		$res = $mysqli->query("SELECT id FROM durations_n WHERE smart_id = ". $smartId ." ORDER BY ts DESC LIMIT 1");
		if (!$res->num_rows) {
			echo "Piwik id not found for $smartId\n";
			$mis ++;
			continue;
		}
		$row = $res->fetch_row();
		$pmap[$smartId] = $row[0];
	}
	$id = $pmap[$smartId];
	if (!$id) {
		echo "id not found for $smartId\n";
		exit;
	}

	echo("INSERT INTO durations_n SET id = '". $id ."', ts = ". $ts .", end = ". $end .", ip = ". $ip .", smart_id = ". $smartId ."\n");
	$mysqli->query("INSERT INTO durations_n SET id = '". $id ."', ts = ". $ts .", end = ". $end .", ip = ". $ip .", smart_id = ". $smartId);

	if ($mysqli->error) {
		echo $mysqli->error;
		exit;
	}
	$ins++;
}
echo "Done $ins inserts, missed $mis\n";
 */
