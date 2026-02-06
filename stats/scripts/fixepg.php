<?php
// parse program by URL. Also saves visits to memcached (will be used by showRange.php which is called by groupdurations.php)
include('/var/www/html/stats/config.php');

$res = $mysqli->query("SELECT * FROM program WHERE dt >= 20211001");
echo $mysqli->error;

while ($row = $res->fetch_assoc()) {
	$ts = $row['start'];
	$dt = date('Ymd', $ts);
	echo("UPDATE program SET dt = $dt WHERE start = $ts\n");
	$mysqli->query("UPDATE program SET dt = $dt WHERE start = $ts");
}
