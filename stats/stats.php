<?php
function fm($n, $tot) {
	$f = number_format($n, 0, ',', '.');
	return sprintf('%'. $tot .'s', $f);
}
require_once('config.php');

$ts = mktime(0,0,0, 7, 1, 2019);
$ets = mktime(0,0,0, 1, date('j'), 2020);
//echo date('r', $ts);

echo 'Date   Reppa IP total  Reppa IP Unique  Genius IP total  Genius IP Unique'."\n";
while ($ts < $ets) {
	$c = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 23:59:59')";
	$res = $mysqli->query("SELECT COUNT(ip), COUNT(DISTINCT(ip)), page FROM visits WHERE ". $c ." GROUP BY page" );

	$ipRepa = 0; $ipdRepa = 0;
	$ipGeni = 0; $ipdGeni = 0;
	while ($row = $res->fetch_row()) {
		if ($row[2] == 'reppa.de' || $row[2] == 'reppa.com') {
			$ipRepa = $row[0];
			$ipdRepa = $row[1];
		} else if ($row[2] == 'genius') {
			$ipGeni = $row[0];
			$ipdGeni = $row[1];
		}
	}
	echo date('d/m', $ts). '  '. fm($ipRepa, 14) .'  '. fm($ipdRepa, 15) .'  '. fm($ipGeni, 15) .'  '. fm($ipdGeni, 16) ."\n";
	$dt = date('Ymd', $ts);
	$mysqli->query("REPLACE INTO visits_totals VALUES ($dt, $ipRepa, $ipdRepa, $ipGeni, $ipdGeni)");
	echo $mysqli->error;
	$ts += 86400;
}
