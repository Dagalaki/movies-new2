<?php
require_once('/var/www/html/stats-nginx/config.php');
$dupmysqli= new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
define('DAYS', 3);
$ts = time() - 2 * 86400;

while ($ts > time() - DAYS * 86400) {
	Echo date('r', $ts-86400). ' - '. date('r', $ts) ."\n";
	echo("DELETE FROM hits WHERE ts BETWEEN ". ($ts-86400) ." AND ". $ts ."\n");
	$mysqli->query("DELETE FROM hits WHERE ts BETWEEN ". ($ts-86400) ." AND ". $ts);
	$dupmysqli->query("DELETE FROM hits WHERE ts BETWEEN ". ($ts-86400) ." AND ". $ts);
	$ts-=86400;
}
