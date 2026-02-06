<?php
ini_set("max_execution_time", "-1");
ini_set("memory_limit", "-1");

require_once('config.php');
error_reporting(E_ALL);
$deb = 0;
$a = []; $b = []; $checka = []; $checkb = []; $ips = [];
$ips2 = []; $ips3 = []; $ipsm1 = []; $ipsm2 = []; $ipsm3 = [];

$ts = time()-11;
$ts2 = time()-21;
$ts3a = time()-22;
$ts3b = time()-32;

$mints = time()-61;
$mints2 = time()-121;
$mints3a = time()-122;
$mints3b = time()-182;


$cnt2 = $cnt3 = 0; $ccnt= 0;
$mincnt = $mincnt2 = 0; $mincnt3 = 0;
$maxTs = 0; $minTs = time();

$table = "redbutton.access_log";
$res = $mysqli->query("SELECT intime, smartid FROM $table WHERE intime > UNIX_TIMESTAMP() - 60*3 ORDER BY intime DESC");
echo $mysqli->error;

while ($row = $res->fetch_assoc()) {
	$vts = $row['intime'];
	$ip = $row['smartid'];
	$maxTs = max($maxTs, $vts);
	$minTs = min($minTs, $vts);
	if ($deb && 1) {
		echo "ip $ip date ". date('r', $vts). "\n";
		if (in_array($ip, $ips))
			echo "found\n";
	}

	if ($vts >= $ts && !in_array($ip, $ips)) {
		$ips[] = $ip;
		$a[] = $ip;
	}

	if ($vts >= $ts2 && $vts <= $ts && !in_array($ip, $ips2)) {
		$cnt2++;
		$checka[] = $ip;
		$ips2[] = $ip;
	}

	if ($vts >= $ts3b && $vts <= $ts3a && !in_array($ip, $ips3)) {
		$cnt3++;
		$checkb[] = $ip;
		$ips3[] = $ip;
	}

	if ($vts >= $mints && !in_array($ip, $ipsm1)) {
		$mincnt++;
		$ipsm1[] = $ip;
	}

	if ($vts >= $mints2 && $vts <= $mints && !in_array($ip, $ipsm2)) {
		$mincnt2++;
		$ipsm2[] = $ip;
	}

	if ($vts >= $mints3b && $vts <= $mints3a && !in_array($ip, $ipsm3)) {
		$mincnt3++;
		$ipsm3[] = $ip;
	}
}
if (count($a))
	$b = array_intersect($a, $checka);

if (count($b)) {
	$tmp = array_intersect($b, $checkb);
	$ccnt = count($tmp);
}

$out["cnt2"] = $cnt2;
$out["cnt3"] = $cnt3;
$out["c_cnt"] = $ccnt;

$out["mincnt"] = $mincnt;
$out["mincnt2"] = $mincnt2;
$out["mincnt3"] = $mincnt3;

$out["cnt"] = count($a);
$out["b_cnt"] = count($b);
$out["ts"] = $ts;
$out["ts2"] = $ts2;
$out["ts3"] = $ts3b+1;

if ($deb) {
	echo "max ". date('r', $maxTs). " min ". date('r', $minTs). "\n";
	print_r($out);
	exit;
}

echo json_encode($out);
?>
