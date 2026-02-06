<?php
require("config.php");

for ($i = 1;$i < 12; $i++) {
	$tms = time()-86400 * $i;
	$dt = date('Ymd', $tms);
	$type = 0;
	echo "fixing date ". $dt ."\n";

	$res = $mysqli->query("SELECT start, end, customer, duration FROM program_run WHERE dt = ". $dt);

	while ($row = $res->fetch_assoc()) {
		$start = $row['start'];
		$end = $row['end'];
		$duration = $row['duration'];
		$customer = $row['customer'];

		if (preg_match('#reppa#si', $customer) && $duration > 10) {
			$page ="page IN ('reppa.de','reppa.com')";
			$type = 1;
		} else if (preg_match('#genius#si', $customer) && $duration > 10) {
			$page ="page = 'genius'";
			$type = 2;
		}

		if (!$type)
			continue;

		$res2 = $mysqli->query("SELECT data FROM customer_ips WHERE ts = ". $start);

		if ($row = $res2->fetch_row()) {
			$ips = unpack('I*', $row[0]);

			$res3 = $mysqli->query("SELECT COUNT(DISTINCT ip) AS cnt FROM visits WHERE ts BETWEEN ". ($start - 6 * 3600) ." AND ". ($end + 6 * 3600) . " AND ". $page ." AND ip IN (". implode(',', $ips) .")");
			echo $mysqli->error;

			if ($row = $res3->fetch_row()) {
				$mysqli->query("UPDATE program_run SET visited = ". $row[0] ." WHERE start = ". $start);
				echo("UPDATE program_run SET visited = ". $row[0] ." WHERE start = ". $start ."\n");
			}

			if ($mysqli->error) {
				echo $mysqli->error;
				exit;
			}
		}
	}
}
