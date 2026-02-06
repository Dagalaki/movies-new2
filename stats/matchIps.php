<?php
// match IPs for a time range
require("config.php");
require_once '/var/www/html/stats-nginx/device-detector/autoload.php';
require_once '/var/www/html/stats-nginx/spyc/Spyc.php';
require '/var/www/html/stats-nginx/GeoIP2-php/geoip2.phar';
use DeviceDetector\DeviceDetector;
use DeviceDetector\Parser\Device\DeviceParserAbstract;
use GeoIp2\Database\Reader;
function myip($s) {
	return $s;
}
$from = $_GET['from'];
$to = $_GET['to'];
$ips = []; $ip2id = [];
$visitsTime = 6 * 3600;
if (isset($_GET['visitsTime']))
	$visitsTime = $_GET['visitsTime'];

/*
 * $res = $mysqli->query("SELECT info, id FROM durations_n WHERE ts != end AND (ts BETWEEN ". $from ." AND ". $to ." OR (ts <= ". $from ." AND end > ". $from ."))");

while ($row = $res->fetch_row()) {
	$json = json_decode($row[0]);
	$ip = ip2long($json->ip);
	$ips[] = $ip;
	$ip2id[$ip] = $row[1];
}
 */

$res = $mysqli->query("SELECT title, customer FROM program_run WHERE start = ". $from);
if ($mysqli->error) {
	echo "Error: ". $mysqli->error."\n";
}

$title='';
if ($row = $res->fetch_assoc())
	$title = $row['title'] .' '. $row['customer'];

$ctype = 0; $pg = " page = 'genius'";
if (preg_match('#Reppa#si', $row['customer'])) {
	$ctype= 1;
	$pg = " page IN ('reppa.de','reppa.com')";
}

//echo("SELECT ts, ip FROM visits WHERE pstart BETWEEN ". $from ." AND ". $to ." ORDER BY ip, ts");
//$res = $mysqli->query("SELECT ts, ip, agent FROM visits LEFT JOIN visits_agent ON agent_id = visits_agent.id WHERE pstart BETWEEN ". $from ." AND ". $to ." ORDER BY ip, ts");

$visits = []; $ips = [];
// get ips that were in previous shows (till visitsTime)

$res = $mysqli->query("SELECT start, end FROM program_run WHERE start BETWEEN ". ($from-$visitsTime) ." AND ". ($from - 1) ." AND customer LIKE '%". ($ctype == 1 ? 'reppa' : 'genius') ."%'");

while ($row = $res->fetch_row()) {
	$start = $row[0];
	$end = $row[1];

	$res2 = $mysqli->query("SELECT data FROM customer_ips WHERE ts = ". $start ." AND type = ". $ctype);
	if ($row = $res2->fetch_row()) {
		$a = unpack('a*', $row[0]);
		$a = str_split($a[1], 32);

		$res3 = $mysqli->query("SELECT DISTINCT ip FROM visits WHERE ts BETWEEN ". $start ." AND ". ($end + $visitsTime) . " AND $pg AND ip IN ('". implode("','", $a) .'\')');
		while ($row = $res3->fetch_row()) {
			$ips[] = $row[0];
		}
	}
}

$res = $mysqli->query("SELECT data FROM customer_ips WHERE ts = ". $from ." AND type = ". $ctype);
if ($row = $res->fetch_row()) {
	$a = unpack('a*', $row[0]);
	$a = str_split($a[1], 32);

	// see if there is another show from same customer in the next visitsTime
	// if so we select until the next show time not until visitsTime
	$vend = $to + $visitsTime;

	if ($_GET['test']) echo("SELECT start FROM program_run WHERE customer LIKE '%". ($ctype == 1 ? 'reppa' : 'genius') ."%' AND start BETWEEN ". $to ." AND ". ($to + $visitsTime));

	if ($_GET['test']) echo("SELECT ts, ip, agent FROM visits LEFT JOIN visits_agent ON agent_id = visits_agent.id WHERE ts BETWEEN ". $from ." AND ". $vend ." AND ip IN ('". implode("','", $a) ."') AND ". $pg ." ORDER BY ip, ts");


	$res = $mysqli->query("SELECT ts, ip, agent, referrer FROM visits LEFT JOIN visits_agent ON agent_id = visits_agent.id WHERE ts BETWEEN ". $from ." AND ". $vend ." AND ip IN ('". implode("','", $a) ."') AND ". $pg ." ORDER BY ts");

	while ($row = $res->fetch_assoc()) {
		$ip = $row['ip'];
		$ts = $row['ts'];

		//if (in_array($ip, $ips))
			//continue;

		if (!isset($visits[$ip]))
			$visits[$ip] = [];
		$visits[$ip][] = $row;
	}

} else die('data not fouind');
?>
<html>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>anixa HbbTV Ad Server</title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<!-- Global stylesheets -->
	<link href="css/reset.css" rel="stylesheet" type="text/css">
	<link href="css/common.css" rel="stylesheet" type="text/css">
	<link href="css/form.css" rel="stylesheet" type="text/css">
	<link href="css/standard.css" rel="stylesheet" type="text/css">
	
	<!-- Comment/uncomment one of these files to toggle between fixed and fluid layout -->
	<!--<link href="css/960.gs.css" rel="stylesheet" type="text/css">-->
	<link href="css/960.css" rel="stylesheet" type="text/css">
	
	<!-- Custom styles -->
	<link href="css/simple-lists.css" rel="stylesheet" type="text/css">
	<link href="css/block-lists.css" rel="stylesheet" type="text/css">
	<link href="css/planning.css?v5" rel="stylesheet" type="text/css">
	<link href="css/table.css" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">

	<!-- Modernizr for support detection, all javascript libs are moved right above </body> for better performance -->
	<script src="js/modernizr.js"></script>
	<script src="js/libs/jquery-1.11.3.min.js"></script>
<script>
function showmore(ip) {
	$('#tb-'+ ip).toggle();
}
</script>
</head>
<body>
<article class="container_12">
<section class="grid_12">
<div class="block-border">
<div class="block-content">

<?php
function dt($ts) {
	return date('H:i:s', $ts);
}

if ($mysqli->error)
	echo 'error: '. $mysqli->error;
else
	echo '<h1> '. $res->num_rows .' visits for "'. $title .'"  '. date('d M H:i:s', $from) .' - '. date('H:i:s', $to) .'</h1>'."\n";

echo('<table class="table" id="visits"  cellspacing="0">'."\n");
echo '<thead>';
echo '<tr><th></th><th>IP</th><th>Time</th><th>Referrer</th></tr>';
echo '</thead>';
echo '<tbody>';
$k=0;
foreach ($visits as $ip => $v) {
	$row = $v[0];
	$dd = new DeviceDetector($row['agent']);
	$dd->parse();
	$client = $dd->getClient();

	echo '<tr>';
	echo '<th scope="row" class="table-check-cell">'. ($k+1). '</th>';
	if (count($v) > 1) {
		echo '<td><a href="javascript:void(0)" onclick="showmore(\''. $ip .'\')">'. myip($ip) .' <b>('. count($v) .')</b></a> '. $dd->getDeviceName() .' '. $dd->getModel() .' '. $client['name'] .' '. $client['version'] .' '. $ipp .'</td>';
	} else
		echo '<td>'. myip($ip) .' '. $ipp .'</td>';
	echo '<td>'. dt($v[0]['ts']) .'</td>';
	echo '<td><a target="_blank" href="'. $row['referrer'] .'">'. $row['referrer'] .'</a></td>';

	echo '</tr>';

	if (count($v) > 1) {
		echo '<tbody id="tb-'. $ip .'" style="display: none">';
		foreach ($v as $j=>$row) {
			if (!$j)
				continue;

			$dd = new DeviceDetector($row['agent']);
			$dd->parse();
			$client = $dd->getClient();

			echo '<tr>';
			echo '<th></th>';

			if (1) {
				echo '<td>'. myip($ip) .' '. $dd->getDeviceName() .' '. $dd->getModel() .' '. $client['name'] .' '. $client['version'] .'</td>';
			} else
			echo '<td>'. myip($ip) .' '. $row['agent'] .' '. $ipp .'</td>';
			echo '<td>'. dt($row['ts']) .'</td>';
			echo '<td'. (preg_match('#checkout#si', $row['referrer']) ? ' style="background: #d9ffd9;"':'') .'><a target="_blank" href="'. $row['referrer'] .'">'. $row['referrer'] .'</a></td>';
			echo '</tr>';
		}
		echo '</tbody>';
	}

	$k++;
}
echo '</tbody>';
echo '</table>';
?>
</div>
</div>

</section>
</article>
	<footer>
		<div class="float-right">
			<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>
		</div>
		
	</footer>
</body>
</html>
