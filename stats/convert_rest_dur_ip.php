<?php
require_once('config.php');

$tableres = $mysqli->query("SHOW TABLES LIKE 'durations\_%'");
$i = 0;
error_reporting(E_ALL & ~E_NOTICE);

while ($r = $tableres->fetch_row()) {
	$table = $r[0];
	if ($table == 'durations_n')
		continue;
	if ($i < 8) {
		$i++;
		continue;
	}
	echo "[$table]\n";
	$a = explode('_', $table);
	$newtable = 'durations2_'. $a[1];
	echo "[$newtable]\n";

	$mysqli->query("CREATE TABLE IF NOT EXISTS ". $newtable ." (id varchar(16) not null, ts int unsigned not null, end int unsigned not null, smart_id int unsigned not null, `ip` varchar(32) NOT NULL, PRIMARY KEY (`id`,`ts`), KEY `ip` (`ip`), KEY `ts` (`ts`), KEY `ts_2` (`ts`,`end`), KEY(smart_id))");
	if ($mysqli->error) echo $mysqli->error;

	$pg = 1; $lim = 100000;
	if ($i == 8)
		$pg = 34;
	while (true) {
		echo "page $pg\n";
		$q = 'INSERT ignore INTO '. $newtable .' VALUES ';
		$res = $mysqli->query("SELECT * FROM ". $table ." LIMIT ". ($pg -1) * $lim .','. $lim);
		if ($mysqli->error) echo $mysqli->error;

		if ($res->num_rows == 0)
			break;
		while ($row = $res->fetch_assoc()) {
			$q .= "('". $row['id']. "', ". $row['ts'] .", ". $row['end'] .", ". (int)$row['smart_id'] .", '". md5($row['ip']) ."'),";
		}
		$q = substr($q, 0, strlen($q)-1);

		$mysqli->query($q);
		echo $mysqli->error;
		if ($mysqli->error)
			exit;
		$pg++;
	}
	$i++;
}
