<style>

table {
  border-collapse: collapse;
  border: 1px solid #ddd;
}

table, th, td {
  border: 1px solid #ddd;
  padding: 8px;
}


tr:nth-child(even) {background-color: #f2f2f2;} 

</style>
<?php
date_default_timezone_set("Europe/Berlin");
$sm_host = "localhost";
$sm_data = "netflow";
$sm_user = "netflow";
$sm_pass = "123";

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");

$mres = $mysqli->query("SELECT MAX(ts), MIN(ts) FROM piwik_test.ips");
if ($r = $mres->fetch_row()) {
	$maxTs = $r[0];
	$minTs = $r[1];
}
$cond = "ts BETWEEN $minTs AND $maxTs";
$cond = "time_offset BETWEEN $minTs AND $maxTs";

//echo("SELECT INET_NTOA(id) AS ip, ts FROM durations WHERE ".$cond);
///$pes = $mysqli->query("SELECT id, INET_NTOA(id) AS ip, ts FROM durations WHERE ".$cond);
//echo("SELECT ipv4_dst_addr, INET_NTOA(ipv4_dst_addr) AS ip, time_offset FROM netflow WHERE ".$cond ." GROUP BY ipv4_dst_addr");
$pes = $mysqli->query("SELECT ipv4_dst_addr, INET_NTOA(ipv4_dst_addr) AS ip, time_offset FROM netflow WHERE ".$cond ." GROUP BY ipv4_dst_addr");
$net = [];
while ($row = $pes->fetch_assoc())
	$net[$row['ipv4_dst_addr']] = $row;

$res = $mysqli->query("SELECT ip, INET_ATON(ip) AS nip, ts FROM piwik_test.ips");
$piw = [];
while ($row = $res->fetch_assoc())
	$piw[] = $row;
Echo "<p>Total piwik: ". count($piw) .". Total netflow: ". count($net) ."</p>";
?>
<table>
<thead>
<tr>
<th>IP</th><th>Piwik date</th>
<th>netflow date</th><th>difference</th>
</tr></thead>
<tbody>
<?php
foreach ($piw as $row) {
	if (isset($net[$row['nip']])) {
		$nrow = $net[$row['nip']];
		echo '<tr><td>'. $row['ip'] .'</td><td>'. date('r', $row['ts']) .'</td><td>'. date('r', $nrow['time_offset']) .'</td><td>';
		if ($nrow['time_offset'] > $row['ts'])
			echo getDuration($nrow['time_offset'] - $row['ts']);
		echo '</td></tr>';
	}
}

function getDuration($secs) {
	$duration = '';
	$days = floor($secs / 86400);
	$secs -= $days * 86400;
	$hours = floor($secs / 3600);
	$secs -= $hours * 3600;
	$minutes = floor($secs / 60);
	$seconds = $secs - $minutes * 60;

	if($days > 0) {
		$duration .= $days . 'd';
	}
	if($hours > 0) {
		$duration .= ' ' . $hours . 'h';
	}
	if($minutes > 0) {
		$duration .= ' ' . $minutes . 'm';
	}
	if($seconds > 0) {
		$duration .= ' ' . $seconds . 's';
	}
	return $duration;
}
?>
</tbody>
</table>
