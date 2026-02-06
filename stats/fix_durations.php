<?php
// will delete unwanted insertions (nbetween existing duration
date_default_timezone_set("Europe/Berlin");

$sm_host = "localhost";
$sm_data = "netflow";
$sm_user = "netflow";
$sm_pass = "123";

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");

$res = $mysqli->query("SELECT * FROM durations_n WHERE duration > 0 AND ts > UNIX_TIMESTAMP() - 7 * 86400");
echo 'Found '. $res->num_rows ."\n";

while($row = $res->fetch_assoc()) {
	$id = $row['id'];
	$ts = $row['ts'];
	$end = $row['end'];

	//echo("duration ". $row['duration'] ."\n");
	//echo("DELETE FROM durations WHERE id = ". $id . " AND ts BETWEEN ". $ts ."+1 AND ". $end ."\n");
	$mysqli->query("DELETE FROM durations WHERE id = ". $id . " AND ts BETWEEN ". $ts ."+1 AND ". $end);
}
