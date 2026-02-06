<?php
require_once '/var/www/html/stats-nginx/device-detector/autoload.php';
require_once '/var/www/html/stats-nginx/spyc/Spyc.php';
require '/var/www/html/stats-nginx/GeoIP2-php/geoip2.phar';
use DeviceDetector\DeviceDetector;
use DeviceDetector\Parser\Device\DeviceParserAbstract;
use GeoIp2\Database\Reader;
define('SKIP_TS', 1572158460);
//$BADIPS = ['45.89.94.69','45.89.92.45','45.89.95.19'];
$hits = []; $infos = [];
$debug = false; $readonly = false; $skipInfos = true;
$reader = new Reader('/var/www/html/stats-nginx/GeoIP2-php/maxmind-db/GeoLite2-City.mmdb');

$file = '/var/log/nginx/tmp/access.log.4';
//$file = '/var/log/nginx/tmp/access.log.2';

echo "About to open nginx log, size: ". filesize($file) ."\n";
$fh = fopen($file, 'r');
//$fh = fopen('/var/log/nginx/access.log', 'r');

require_once '/var/www/html/stats-runas/config.php';
$dupmysqli= new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$dupmysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 3600);
$i = 0; $ids=[];
while (($s = fgets($fh, 4096)) !== false) {
	if ($i % 10000 == 0)
		echo "$i $s\n";
	$m = explode('@', $s);
	if (count($m)) {
		if (strpos($m[2], 'GET /save.php') === false)
			continue;
		$vars = explode('&', $m[2]);

		$ip = $m[0];
		$agent = $m[4];
		$ts = strtotime($m[1]);
		$idsite = 1;
		$smartId = 0;

		if (SKIP_TS && $ts <= SKIP_TS)
			continue;

		// from vars get piwik id and resolution
		foreach ($vars as $v) {
			$e = explode('=', $v);

			if ($e[0] == 'idsite')
				$idsite = (int)$e[1];

			if ($e[0] == '_id')
				$id = $e[1];

			if ($e[0] == 'res') {
				$res = $e[1];
			}
			if ($e[0] == '_cvar') {
				$cvar = (array)json_decode(urldecode($e[1]));
				$smartId = $cvar['1'][1];
			}
		}
		if ($idsite != 1) {
			echo "missing idsite\n";
			continue;
		}


		if (!$id) {
			echo "id not found:\n". $m[2];
			continue;
		}
		if ($smartId) {
			$ids[$id] = $smartId;
		}
		$i++;
		continue;

		$dd = new DeviceDetector($agent);
		$dd->parse();
		$brand = $dd->getBrandName();
		$model = $dd->getModel();
		$device = $dd->getDeviceName();
		$os = $dd->getOs();
		$client = $dd->getClient();

		try {
			$ipr = $reader->city($ip);
		} catch (Exception $e) {
			echo "Caught exception: ".  $e->getMessage(). "\n";
			continue;
		}

		//echo "ip ". $ip ." date ". date('r', $ts). " country ". $ipr->country->isoCode ." city ". $ipr->city->name ." brand ". $brand ." model ". $model ."\n";
		if (!$skipInfos) {
			$a['ip'] 	= $ip;
			$a['lon'] 	= $ipr->location->longitude;
			$a['lat'] 	= $ipr->location->latitude;
			$a['country'] 	= $ipr->country->name;
			$a['city'] 	= $ipr->city->name;
			if ($res)
				$a['res'] 	= $res;
			if ($client) {
				$a['br'] 	= $client['name'];
				if ($client['version'])
					$a['br_v'] 	= $client['version'];
				if ($client['engine'])
					$a['br_e'] 	= $client['engine'];
			}
			$a['brand'] 	= $brand;
			$a['model'] 	= $model;
			$a['device'] 	= $device;
			if ($os) {
				$a['os'] 	= $os['name'];
				if ($os['version'])
					$a['os_v'] 	= $os['version'];
			}
			$json = json_encode($a);
			//echo strlen($json);

			if (strlen($json) > 512)
				die('json failed');

			if (!isset($infos[$id])) {
				$infos[$id] = $json;
			}
		}

		$s = [];
		$s['id'] = $id;
		$s['ip'] = ip2long($ip);
		$s['ts'] = $ts;
		$s['smart_id'] = $smartId;
		$hits[] = $s;

		$i++;
	} else
		echo "failed\n";
}
fclose($fh);
echo "total ". $i."\n";
foreach ($ids as $id => $smartId) {
	$mysqli->query("UPDATE durations_n SET smart_id = ". $smartId ." WHERE id = '". $id ."'");
	echo $mysqli->error;
	$dupmysqli->query("UPDATE durations_n SET smart_id = ". $smartId ." WHERE id = '". $id ."'");
}
exit;

// moved here becasue of "Lost connection to backend server; (for dupmysqli...)
require_once '/var/www/html/stats-runas/config.php';
$dupmysqli= new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$dupmysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 3600);

if (!$skipInfos) {
	$i = 0;
	echo "Setting ". count($infos) ." infos\n";
	foreach ($infos as $id=>$json) {
		$mysqli->query("REPLACE INTO infos SET id = '". $id ."', info = '". $mysqli->real_escape_string($json) ."'");
		if ($mysqli->error)
			die('mysqli: '. $mysqli->error);

		$dupmysqli->query("REPLACE INTO infos SET id = '". $id ."', info = '". $dupmysqli->real_escape_string($json) ."'");
		if ($dupmysqli->error)
			die('dupmysqli: '. $dupmysqli->error .". i = ". $i ."\n");
		$i++;
	}
}

$debId = 1563156301;
$updates = []; $ips = []; $ipsStart = [];
$i = 0; $u = 0; $j = 0; $sm = 0;
echo "Total ". count($hits) ." hits \n";
	
// load previous
//echo("SELECT MAX(ts) FROM durations_n WHERE channel = '". $channel ."' AND ".$todayTsCond ."\n");
$mres = $mysqli->query("SELECT MAX(ts) FROM durations_n");
if ($r = $mres->fetch_row())
	$maxTs = $r[0];
else
	$maxTs = time() - 86400;

echo "Max ts: ". date('r', $maxTs). "\n";

$ures = $mysqli->query("SELECT id, ts, end FROM durations_n WHERE (ts >= ". ($maxTs - 40) ." OR end >= ". ($maxTs -40) .")");
if ($mysqli->error)
	die($mysqli->error);

echo "Got ". $ures->num_rows ." rows for previous durations_n\n";

while ($row = $ures->fetch_assoc()) {
	$id = $row['id'];
	$ts = $row['ts'];
	$end = $row['end'];

	$ips[$id] = $end;
	$ipsStart[$id] = $ts;
}

usort($hits, 'sort_by_time');
print_r( $hits[count($hits)-1]);

foreach ($hits as $s) {
	$id = $s['id'];
	$ts = $s['ts'];
	$ip = $s['ip'];
	$smartId = (int)$s['smart_id'];
	$lastTs = 0;
	$ins = true;

	if (!isset($ips[$id])) {
		$ips[$id] = $ts;
		$ipsStart[$id] = $ts;
	} else {
		$lastTs = $ips[$id];
		$ins = false;

		if ($ts < $lastTs) {
			echo "Ooops ts ($ts) is smaller thant lastTs ($lastTs)\n";
			continue;
		} else if ($ts == $lastTs) {
			//echo "ts same with lastTs ($lastTs) for $id\n";
			continue;
		}

		if ($ts > $lastTs && $ts - $lastTs < 5) {
			$ips[$id] = $ts;
			continue;
		}
		if ($ts > $lastTs && $ts - $lastTs > 18) {
			$ips[$id] = $ts;
			$ipsStart[$id] = $ts;
			$ins = true;
			$sm++;
		}
	}
	$ips[$id] = $ts;
	$diff = $ts - $lastTs;

	if ($ins) {
		$i++;
		if ($debug && ($i % 100 == 0 || $debId == $id))
			echo("INSERT INTO durations_n SET id = '". $id ."', ts = ". $ts .", ip = ". $ip ."\n"); // add info here or to another table?...
		if (!$readonly) {
			$mysqli->query("INSERT INTO durations_n SET id = '". $id ."', ts = ". $ts .", ip = ". $ip .", end = ". $ts .", smart_id = ". $smartId ." ON DUPLICATE KEY UPDATE end = ". $ts .", smart_id = ". $smartId);
			$dupmysqli->query("INSERT INTO durations_n SET id = '". $id ."', ts = ". $ts .", ip = ". $ip .", end = ". $ts .", smart_id = ". $smartId ." ON DUPLICATE KEY UPDATE end = ". $ts .", smart_id = ". $smartId);
		}
		if ($mysqli->error)
			die("err: ".$mysqli->error);
		if ($dupmysqli->error)
			die("err,: ".$dupmysqli->error);
	} else {
		$u++;
		if ($diff > 0) {
			$k = md5($id.$ipsStart[$id]);

			if (isset($updates[$k])) {
				$updates[$k]['end'] = $ts;
			} else {
				$s = [];
				$s['ts'] = $ipsStart[$id];
				$s['id'] = $id;
				$s['end'] = $ts;
				$s['diff'] = $diff;
				$updates[$k] = $s;
			}
		}
	}
}

echo "Found ". $sm ." smart IDs...\n";
echo "Doing ". count($updates) ." updates...\n";
$k = 0;
foreach ($updates as $s) {
	//if ($test)
	if ($debug && ($k % 100 == 0 || $debId == $s['id']))
		echo("UPDATE durations_n SET end = ". $s['end'] ." WHERE id = '". $s['id'] ."' AND ts = ". $s['ts'] ."... diff ". ($s['end'] - $s['ts']) ."\n");
	//else
	if (!$readonly) {
		$mysqli->query("UPDATE durations_n SET end = ". $s['end'] ." WHERE id = '". $s['id'] ."' AND ts = ". $s['ts']);
		$dupmysqli->query("UPDATE durations_n SET end = ". $s['end'] ." WHERE id = '". $s['id'] ."' AND ts = ". $s['ts']);
	}
	if ($mysqli->error)
		die($mysqli->error);
	$k++;
}
echo("done ". $i . " inserts ". $u ." updates\n");

function sort_by_time($a, $b) {
	if ($a['ts'] == $b['ts']) {
		return 0;
	}       
	return ($a['ts'] < $b['ts']) ? -1 : 1;
}
?>
