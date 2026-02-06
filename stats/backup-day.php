<?php
// will move a day from previous month to new table (per month)
// we miss a day: 28/9/19, at 28/10 we added smart_id and this was missed from durations_092019
require_once '/var/www/html/stats-runas/config.php';
$dupmysqli= new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$readOnly = false;
$minTs = 1566770400 + 6 * 86400;
$pm = new DateTime();
$pm->sub(new DateInterval('P1M'));
$pmTs = $pm->getTimestamp();

if (0)
	$ts = $minTs;
else 
	$ts = $pmTs - 86400;

$ymd = date('Y-m-d', $ts);
echo "Doing inserts for ", date('r', $ts). "...\n";

if (!$readOnly) {
	$mysqli->query("CREATE TABLE IF NOT EXISTS durations_". date('mY', $ts) ." (id varchar(16) not null, ts int unsigned not null, end int unsigned not null, smart_id int unsigned not null, `ip` varchar(32) NOT NULL, PRIMARY KEY (`id`,`ts`), KEY `ip` (`ip`), KEY `ts` (`ts`), KEY `ts_2` (`ts`,`end`), KEY(smart_id))");
	if ($mysqli->error) echo $mysqli->error;
	//$dupmysqli->query("CREATE TABLE IF NOT EXISTS durations_". date('mY', $ts) ." (id varchar(16) not null, ts int unsigned not null, end int unsigned not null, smart_id int unsigned not null, `ip` int(10) unsigned NOT NULL DEFAULT '0', PRIMARY KEY (`id`,`ts`), KEY `ip` (`ip`), KEY `ts` (`ts`), KEY `ts_2` (`ts`,`end`), KEY(smart_id))");
	//if ($dupmysqli->error) echo $dupmysqli->error;
} else
	echo("CREATE TABLE IF NOT EXISTS durations_". date('mY', $ts) ." (id varchar(16) not null, ts int unsigned not null, end int unsigned not null, `ip` int(10) unsigned NOT NULL DEFAULT '0', PRIMARY KEY (`id`,`ts`), KEY `ip` (`ip`), KEY `ts` (`ts`), KEY `ts_2` (`ts`,`end`))\n");

$res = $mysqli->query("SELECT id, ts, end, ip, smart_id FROM durations_n WHERE ts BETWEEN UNIX_TIMESTAMP('". $ymd ." 00:00:00') AND UNIX_TIMESTAMP('". $ymd ." 23:59:59')");
echo $mysqli->error;

$tot = $res->num_rows;
echo "Got ". $res->num_rows ." rows\n";
$i = 0;

while ($row = $res->fetch_assoc()) {
	if (!$readOnly) {
		//$mysqli->query("INSERT INTO durations_". date('mY', $ts) ." SET id = '". $row['id'] ."', ts = ". $row['ts'] .", end = ". $row['end'] .", ip = '". $row['ip'] ."', smart_id = ". $row['smart_id']);
		$mysqli->query("INSERT INTO durations_". date('mY', $ts) ." SET id = '". $row['id'] ."', ts = ". $row['ts'] .", end = ". $row['end'] .", ip = '". md5($row['ip']) ."', smart_id = ". $row['smart_id']);
		if ($mysqli->error) echo $mysqli->error;

		//$dupmysqli->query("INSERT INTO durations_". date('mY', $ts) ." SET id = '". $row['id'] ."', ts = ". $row['ts'] .", end = ". $row['end'] .", ip = ". $row['ip'] .", smart_id = ". $row['smart_id']);
		//if ($dupmysqli->error) echo $dupmysqli->error;
	} else
		echo("INSERT INTO durations_". date('mY', $ts) ." SET id = '". $row['id'] ."', ts = ". $row['ts'] .", end = ". $row['end'] .", smart_id = ". $row['smart_id'] .", ip = ". $row['ip'] ."\n");
	$i++;
	if ($i % 10000 == 0)
		echo per($i, $tot) ."% (". $i . ") ";
	if ($i % 100000 == 0)
		echo "\n";
}
function per($n, $tot) {
	return number_format(($n*100)/$tot, 2);
}
echo "Done inserts\n";

$mysqli->query("DELETE FROM durations_n WHERE ts BETWEEN UNIX_TIMESTAMP('". $ymd ." 00:00:00') AND UNIX_TIMESTAMP('". $ymd ." 23:59:59')");
if ($mysqli->error) echo $mysqli->error;
//$dupmysqli->query("DELETE FROM durations_n WHERE ts BETWEEN UNIX_TIMESTAMP('". $ymd ." 00:00:00') AND UNIX_TIMESTAMP('". $ymd ." 23:59:59')");
if ($dupmysqli->error) echo $dupmysqli->error;
echo "Done delete\n";
?>
