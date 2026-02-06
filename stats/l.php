<?php
require('./config.php');

$res = $mysqli->query("select from_unixtime(intime), channel from redbutton.access_log order by intime desc limit 10");
echo '<table border=1>';
while ($row = $res->fetch_row()) {
	echo '<tr>';
	echo '<td>'. $row[0] .'</td>';
	echo '<td>'. $row[1] .'</td>';
	echo '<tr>';
}
echo '</table>';
