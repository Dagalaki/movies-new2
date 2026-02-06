<?php
require("/var/www/html/cretetv/stats/config.php");
require_once '/var/www/html/ionian/stats/scripts/device-detector/autoload.php';
require_once '/var/www/html/ionian/stats/scripts/spyc/Spyc.php';
require '/var/www/html/ionian/stats/scripts/GeoIP2-php/geoip2.phar';
use DeviceDetector\DeviceDetector;
use DeviceDetector\Parser\Device\DeviceParserAbstract;
use GeoIp2\Database\Reader;
$reader = new Reader('/var/www/html/ionian/stats/scripts/GeoIP2-php/maxmind-db/GeoLite2-City.mmdb');

$ts = time() - 86400 * 1;
if ($argc > 1)
	$ts = time() - 86400 * (int)$argv[1];

$dt = date('Ymd', $ts);
echo " > $dt\n";

$doInfos = 1; $doExtra = 1; $doIds = 1; $doSql =1; $doPos = 0;
$ids = []; $extra = []; $sums = 0; $nocookie = []; $agents = []; $jsons = [];

$res = $mysqli->query("SELECT smartid, cookie, agent, intime, outtime, provider FROM redbutton.access_archiv WHERE channel = 'cretetv' AND intime BETWEEN UNIX_TIMESTAMP('". date('Y-m-d 00:00:00', $ts) ."') AND UNIX_TIMESTAMP('". date('Y-m-d 23:59:59', $ts) ."')");

$infos['cretetv'] = [];
$extra['cookie'] = 0;
$extra['tvsgt10'] = 0;
while ($row = $res->fetch_assoc()) {
	$id = $row['smartid'];
	$cookie = $row['cookie'];
	$agentId = $row['agent'];
	$start = $row['intime'];
	$end = $row['outtime'];
	$provider = $row['provider'];

	if (!(int)$cookie) {
		$nocookie[] = $id;
		$extra['cookie']++;
	}

	if ($end - $start > 10)
		$extra['tvsgt10']++;

	if (!isset($agents[$agentId])) {
		$ares = $mysqli->query("SELECT agent FROM redbutton.agent WHERE id = ". $agentId);
		if ($arow = $ares->fetch_assoc())
			$agents[$agentId] = $arow['agent'];
	}
	$agent = $agents[$agentId];
	if ($agent) {
		if (isset($jsons[$agentId]))
			$json = $jsons[$agentId];
		else {
			$json = getInfo($agent, $provider);
			if (!$json)
				continue;
			$jsons[$agentId] = $json;
		}
		$infos['cretetv'][$id] = $json;
	}
	$ids[] = $id;

	if ($sums % 2000 == 0)
		echo "$sums...\n";
	$sums++;
}
if ($doExtra) {
	$mysqli->query("REPLACE INTO extra SET new=0, newStart=0, dt = ". $dt .", ws=0, channel = 'cretetv', cookie = ". $extra['cookie'] .", tvsgt10 = ". $extra['tvsgt10'] .", ids = ". (int)$sums);
	echo($mysqli->error);
}

if ($doIds) {
	$exit = array_keys(array_flip($ids));
	$exit2 = array_keys(array_flip($nocookie));
	$mysqli->query("REPLACE INTO ids SET dt = ". $dt .", channel = 'cretetv', data = '". implode(',', $exit) ."', nocookie = '". implode(',', $exit2) ."'");
	echo($mysqli->error);
}

if ($doPos) {
	$cpos = [];
	$res = $mysqli->query("SELECT smartid, channelpos FROM redbutton.access_archiv WHERE channel = 'cretetv' AND intime > UNIX_TIMESTAMP('2021-10-12 00:00:00') AND cookie > 0 AND smartid > 0 GROUP BY smartid");
	echo $mysqli->error;
	echo "Got ". $res->num_rows ." rows for channelpos\n";

	while ($row = $res->fetch_assoc()) {
		$pos = (int)$row['channelpos'];
		$id = (int)$row['smartid'];

		if (!isset($cpos[$pos]))
			$cpos[$pos] = 1;
		else
			$cpos[$pos]++;
	}
	$mysqli->query("DELETE FROM channelpos");
	foreach ($cpos as $pos=>$cnt) {
		$mysqli->query("REPLACE INTO channelpos SET pos = $pos, cnt = $cnt");
		if ($mysqli->error) {
			echo("REPLACE INTO channelpos SET pos = $pos, cnt = $cnt");
			echo $mysqli->error;
			exit;
		}
	}
}

if ($doInfos) {
	foreach ($infos as $channel=>$a) {
		$k = 0;
		$q = 'REPLACE INTO infos (channel,  id, info) VALUES ';
		echo "Setting ". count($a) ." infos for channel $channel\n";
		foreach ($a as $id=>$json) {
			//$mysqli->query("REPLACE INTO infos SET channel = '". $channel ."', id = ". $id .", info = '". $mysqli->real_escape_string($json) ."'");

			$q .= "('$channel', $id, '". $mysqli->real_escape_string($json) ."'),";

			if ($k % 1000 == 0) {
				$q = substr($q, 0, strlen($q)-1);
				$mysqli->query($q);
				if ($mysqli->error) {
					echo($q);
					die($mysqli->error);
				}
				$q = 'REPLACE INTO infos (channel,  id, info) VALUES ';
				echo "$k...\n";
			}

			$k++;
		}
		if (strlen($q) > 55) {
			$q = substr($q, 0, strlen($q)-1);
			$mysqli->query($q);
			if ($mysqli->error) {
				echo($q);
				die($mysqli->error);
			}
		}
	}
}

function getInfo($agent, $provider) {
	global $reader;

	$dd = new DeviceDetector($agent);
	$dd->parse();
	$brand = $dd->getBrandName();
	$model = $dd->getModel();
	$device = $dd->getDeviceName();
	$os = $dd->getOs();
	$client = $dd->getClient();

	$a = [];
	if ($client) {
		$a['br']        = $client['name'];
		if ($client['version'])
			$a['br_v']      = $client['version'];
		if ($client['engine'])
			$a['br_e']      = $client['engine'];
	}
	$a['brand']     = $brand;
	$a['model']     = $model;
	$a['device']    = $device;
	$a['agent']    = $agent;
	$a['provider']    = $provider;
	if ($os) {
		$a['os']        = $os['name'];
		if ($os['version'])
			$a['os_v']      = $os['version'];
	}
	$json = json_encode($a);

	return $json;
}

