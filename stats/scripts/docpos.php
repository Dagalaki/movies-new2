<?php
require("/var/www/html/stats/config.php");
$cpos = [];

$res = $mysqli->query("SELECT smartid, channelpos FROM redbutton.access_archiv WHERE intime > UNIX_TIMESTAMP('2021-10-12 00:00:00') AND cookie > 0 AND smartid > 0 GROUP BY smartid");
echo $mysqli->error;
echo "Got ". $res->num_rows ." rows for channelpos\n";
$t = 0;

while ($row = $res->fetch_assoc()) {
	$pos = (int)$row['channelpos'];
	$id = (int)$row['smartid'];

	if (!isset($cpos[$pos]))
		$cpos[$pos] = 1;
	else
		$cpos[$pos]++;
	$t++;
}
print_r($cpos);
echo "t = $t\n";
$mysqli->query("DELETE FROM channelpos");
$tot;
foreach ($cpos as $pos=>$cnt) {
	$tot+=$cnt;
	$mysqli->query("REPLACE INTO channelpos SET pos = $pos, cnt = $cnt");
	if ($mysqli->error) {
		echo("REPLACE INTO channelpos SET pos = $pos, cnt = $cnt");
		echo $mysqli->error;
		exit;
	}
}
echo "tot = $tot\n";
