<?php
$btn_dir = "/var/www/html/cretetv/home/img/";
function fm($n) {
	return number_format($n, 0, ',', '.');
}
function percent($x, $total) {
	if (!$total)
		return 0;
	$percent = ($x * 100) / $total;
	return number_format( $percent, 2 ); // change 2 to # of decimals
}
require_once('config.php');
function dt($ts) {
	return date('D d M', $ts);
}
function timer_diff($timeStart)
{
    return number_format(microtime(true) - $timeStart, 3). ' sec.';
}
$pages = ['home'=>'5 days Stats', 'program'=>'CreteTV Program', 'stats'=>'TV Show Comparison','settings'=>'Chart','man_wlist'=>'Manage whitelist'];
$pages2 = ['hbbtvapp'=>'HbbTV App', 'man_but'=>'Manage red button'];
$pages3 = ['mgr'=>'Manager'];
$pages3 = [];
$pg = 1; $now = microtime(true); $log = '';
$perPage = 50;
$lastPg =  0;
$asc = false;
$sort = "ts";
$cont = "";
$pgMode = 'home';
$counts = [];
error_reporting(E_ALL);
//error_reporting(E_ERROR | E_WARNING | E_PARSE);
ini_set('display_errors', 1);
ini_set('memory_limit' , '256M');
$userLoggedName = '';
$visitsTime = 6 * 3600;
$visitsReppa = []; $visitsGenius = [];

if (isset($_GET['pgMode'])) $pgMode = $_GET['pgMode'];
if (isset($_POST['pgMode'])) $pgMode = $_POST['pgMode'];

$pageTitle = (isset($pages[$pgMode]) ? $pages[$pgMode] : (isset($pages2[$pgMode]) ? $pages2[$pgMode] : $pages3[$pgMode]));

if (isset($_GET['visitsTime']))
	$visitsTime = $_GET['visitsTime'];

if (isset($_GET['action']) && $_GET['action'] == 'logout') {
        $val = $_COOKIE['stats-cretetv-userid'];

        $res = base64_decode($val);
        $a = explode('-', $res);
	//print_r($a); echo USERHASH;exit;

        if (count($a) == 2 && $a[1] === USERHASH) {
                $userLoggedName = $a[0];
		login($userLoggedName, 'logout');
	}

        setcookie('stats-cretetv-userid', '', time()-3600);
        setcookie('stats-cretetv-userid', '', time()-3600, "/");
        header('location: /cretetv/stats/');
        exit;
}

if (isset($_COOKIE['stats-cretetv-userid'])) {
        $val = $_COOKIE['stats-cretetv-userid'];

        $res = base64_decode($val);
        $a = explode('-', $res);
	//print_r($a); echo USERHASH;exit;

        if (count($a) == 2 && $a[1] === USERHASH)
                $userLoggedName = $a[0];
}

if (count($_GET) && isset($_GET['custom-dt']) && $_GET['custom-dt']) {
	$customdt = date('Ymd', strtotime($_GET['custom-dt']));
}

if (count($_POST) && isset($_POST['username']) && isset($_POST['pass'])) {
        $res = $mysqli->query("SELECT ts FROM users WHERE username='". $mysqli->real_escape_string($_POST['username']) ."' AND pass = '". $mysqli->real_escape_string(pass_encrypt($_POST['pass'])) ."'");
        if ($res->num_rows) {
                $val = base64_encode($_POST['username']. '-'. USERHASH);
		login($_POST['username'], 'login');
                setcookie('stats-cretetv-userid', $val, time()+1*86400, "/");
                header('location: /cretetv/stats/');
                exit;
        } else {
                echo('<p>Username not found or pass incorrect</p>');
        }
}
if(isset($_POST["action"]) && $_POST['action'] == 'upload') {
	//print_r($_FILES); print_r($_POST);exit;
	$target_dir = $btn_dir;
	$target_file = $target_dir . basename($_FILES["filename"]["name"]);

	// Check if image file is a actual image or fake image
	$check = getimagesize($_FILES["filename"]["tmp_name"]);
	$msg='';
	if($check !== false) {
		$fname = $_FILES["filename"]["name"];
		//echo("INSERT INTO buttons SET filename = '". mysqli_escape_string($mysqli, $fname) ."', w = ". $check[0] .", h = ". $check[1] .", active=0");
		if (move_uploaded_file($_FILES["filename"]["tmp_name"], $target_file)) {
			$mysqli->query("INSERT INTO buttons SET filename = '". mysqli_escape_string($mysqli, $fname) ."', w = ". $check[0] .", h = ". $check[1] .", active=0");
			$msg = 'File '. htmlspecialchars( basename( $fname)). " has been uploaded.";
		}
	} else {
		$msg = "File is not an image.";
	}
	header('location: /cretetv/stats/?pgMode=mgr&msg='. $msg);
        exit;
} else if(isset($_POST["action"]) && $_POST['action'] == 'savedescr') {
	$cat = $_POST['cat'];
	$descr = $_POST['descr'];
	$mysqli->query("REPLACE INTO descr SET id = '". mysqli_escape_string($mysqli, $cat) ."', descr = '". mysqli_escape_string($mysqli, $descr) ."'");
	echo $mysqli->error;

	$res = $mysqli->query("SELECT id, descr FROM descr");
	$all = [];
	while ($row = $res->fetch_assoc()) {
		$all[$row['id']] = $row['descr'];
	}
	$tot = file_put_contents('/var/www/html/cretetv/json/descr.json', json_encode($all));
	header('location: /cretetv/stats/?pgMode=mgr&cat='. $cat);
}

$showOther = false;
if (isset($_GET['showOther']))
	$showOther = $_GET['showOther'];

$showAll = true;
if (isset($_GET['showAll']))
	$showAll = $_GET['showAll'];

$showGenius = false;
if (isset($_GET['showGenius']))
	$showGenius = $_GET['showGenius'];

$showReppa = false;
if (isset($_GET['showReppa']))
	$showReppa = $_GET['showReppa'];

$cat ='';
if (isset($_GET['cat']))
	$cat = $_GET['cat'];

if (isset($_GET['sort']))
	$sort = $_GET['sort'];
if (isset($_GET['msg']))
	$msg = $_GET['msg'];

if (isset($_GET['asc']))
	$asc = (bool)$_GET['asc'];

if (isset($_GET['pg']))
	$pg = (int)$_GET['pg'];

$order = "ORDER BY ". $sort .($asc ? "" : " DESC");
$sortDtUp = "?pg=". $pg ."&sort=ts&asc=0";
$sortDtDown = "?pg=". $pg ."&sort=ts&asc=1";

$sortDrUp = "?pg=". $pg ."&sort=duration&asc=0";
$sortDrDown = "?pg=". $pg ."&sort=duration&asc=1";

$sortViUp = "?pg=". $pg ."&sort=cnt&asc=0";
$sortViDown = "?pg=". $pg ."&sort=cnt&asc=1";
//echo $order;

function getDuration($secs) {
	$secs = floor($secs);
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

if (!ENABLE_LOGIN || (ENABLE_LOGIN && $userLoggedName)) {
	if (isset($_GET['action']) && $_GET['action'] == 'delb' && isset($_GET['id'])) {
		$res = $mysqli->query("SELECT filename FROM buttons WHERE id = ". $_GET['id']);
		if ($row = $res->fetch_assoc()) {
			unlink('/var/www/html/cretetv/home/img/'. $row['filename']);
			$mysqli->query("DELETE FROM buttons WHERE id = ". $_GET['id']);
			$msg = "Το κουμπί διαγράφηκε";
		} else 
			$msg = "Το κουμπί δεν βρέθηκε";
		header('location: /cretetv/stats/?pgMode=mgr&msg='. $msg);
	} else if (isset($_GET['action']) && $_GET['action'] == 'setb' && isset($_GET['id'])) {
		$res = $mysqli->query("SELECT filename, w,h FROM buttons WHERE id = ". $_GET['id']);
		if ($row = $res->fetch_assoc()) {
			$mysqli->query("UPDATE buttons SET active=1 WHERE id = ". $_GET['id']);
			$mysqli->query("UPDATE buttons SET active=0 WHERE id != ". $_GET['id']);
			$j = [];
			$b = [];
			$b[$row['filename']] = [];
			$b[$row['filename']]['w'] = $row['w'];
			$b[$row['filename']]['h'] = $row['h'];
			$b[$row['filename']]['ab'] = 0;
			$b[$row['filename']]['an'] = 0;
			$j[] = $b;
			$tot = file_put_contents('/var/www/html/cretetv/home/js/button.php', json_encode($j));
		}

		$msg = "Το κουμπί ενεργοποιήθηκε";
		header('location: /cretetv/stats/?pgMode=mgr&msg='. $msg);
	}

	if ($pgMode == 'home') {
		$dt = date('Ymd', time()-86400); $all = [];
		//$dt = date('Ymd', time()); //temp for testing - REMOVE!
		$res = $mysqli->query("SELECT MAX(dt) FROM program WHERE cnt > 0");
		if ($row = $res->fetch_row())
			$dt = $row[0];
		$days = 5; $i = 0; $d = $dt;
		if($dt){
			while ($i < $days) {
				$res = $mysqli->query("SELECT SUM(cnt) AS cnt, SUM(count_start) AS count_start, SUM(count_end) AS count_end, SUM(vgt1) AS vgt1, SUM(zero) AS zero FROM program WHERE dt = ". $d ." ORDER BY cnt DESC");
				//echo "SELECT SUM(cnt) AS cnt, SUM(count_start) AS count_start, SUM(count_end) AS count_end, SUM(vgt1) AS vgt1, SUM(zero) AS zero FROM program WHERE dt = ". $d ." ORDER BY cnt DESC";
				echo $mysqli->error;
				$a = [];
				while ($row = $res->fetch_assoc()) {
					if ($row['cnt']) {
						$res2 = $mysqli->query("SELECT cookie, ws, ids, new, newStart, tvsgt10 FROM extra WHERE dt = ". $d );

						echo $mysqli->error;
						if ($r = $res2->fetch_assoc()) {
							$row['cookie'] = $r['cookie'];
							$row['ws'] = $r['ws'];
							$row['ids'] = $r['ids'];
							$row['new'] = $r['new'];
							$row['newStart'] = $r['newStart'];
							$row['tvsgt10'] = $r['tvsgt10'];
							if ($d == $dt)
								$newStart = $r['newStart'];
						}
						$a[] = $row;
					}
				}

				$all[$d] = $a;
				$ts = strtotime($d);
				$ts -= 86400;
				$d = date('Ymd', $ts);
				$i++;
			}
		}
		if (isset($_GET['test'])) {
			print_r($all);exit;
		}
	} else if ($pgMode == 'mgr') {
		$buttons = [];
		$res = $mysqli->query("SELECT id, filename, w,h, active FROM buttons");
		while ($row = $res->fetch_assoc()) {
			$buttons[] = $row;
		}
	} else if ($pgMode == 'program') {
		$programDts = []; $program = []; $totalMorethan10 = 0; $newPiwik = 0; $newSmids = 0; $b1 = time();
		//echo "SELECT DISTINCT dt FROM program WHERE dt <= ".date('Ymd');
		$res = $mysqli->query("SELECT DISTINCT dt FROM program WHERE dt < ".date('Ymd'));

		$pm = new DateTime();
		$pm->sub(new DateInterval('P1M'));
		$pmd = $pm->format('Ymd');

		while ($row = $res->fetch_row()) {
			$dt = $row[0];
			if ($dt >= $pmd)
				$programDts[] = $row[0];
		}

		$curDt = $programDts[count($programDts)-1];

		if (isset($_GET['curDt']) && $_GET['curDt']){
			$curDt = $_GET['curDt'];
			
		}
		if (isset($customdt) && $customdt)
			$curDt = $customdt;

		$add = '';
		if (!$showAll)
			$add = " AND duration > 5 * 60 - 1";

		if ($showOther)
			$add = " AND customer NOT LIKE '%Reppa%' AND customer NOT LIKE '%Genius%' AND duration > 120 AND duration < 4 * 3600";

		if ($showReppa)
			$add = " AND customer LIKE '%Reppa%'";

		if ($showGenius)
			$add = " AND customer LIKE '%Genius%'";

		if (isset($_POST['sip']) && $_POST['sip'] && !filter_var($_POST['sip'], FILTER_VALIDATE_IP)) {
			$add .= " AND title LIKE '%". mysqli_escape_string($mysqli, $_POST['sip']) ."%'";
			$showAll = false;
		}
		//echo "SELECT * FROM program WHERE dt = ". $curDt . $add;
		$res = $mysqli->query("SELECT * FROM program WHERE dt = ". $curDt . $add);
		//$reppaIPs = []; $geniusIPS = [];

		while ($row = $res->fetch_assoc()) {
			$program[] = $row;
		}
		$log .= 'Time for program: '. timer_diff($now);

			//if ($d) {print_r($visitsGenius); print_r($visitsReppa); exit; }
			$table = "redbutton.access_archiv"; $from = strtotime($curDt);
			$log .= '<br>Time for visits: '. timer_diff($b1);
			$b1 = microtime(true);
			//echo '1 - '.$b1;
			$res = $mysqli->query("SELECT COUNT(*) FROM ". $table ." WHERE channel = 'cretetv' AND intime != outtime AND outtime - intime >= 10 AND intime BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $from) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $from) ." 23:59:59')");
			echo $mysqli->error;
			if ($row = $res->fetch_row())
				$totalMorethan10 = $row[0];

			if (0)
			$res = $mysqli->query("SELECT new_piwik, new FROM total_new WHERE dt = ". $curDt);
			echo $mysqli->error;
			if ($row = $res->fetch_row()) {
				$newPiwik = $row[0];
				$newSmids = $row[1];
			}

			$log .= '<br>Time for total visits > 10 seconds: '. timer_diff($b1);
	} else if ($pgMode == 'sponsors') {
		$sponsors = []; $all = []; $wwwvisits = [];

		$res = $mysqli->query("SELECT count_start, count_end, visited, visits_total, customer, dt FROM program ORDER BY dt DESC");

		while ($row = $res->fetch_assoc()) {
			$dt = $row['dt'];
			if (!isset($all[$dt]))
				$all[$dt] = [];
			$all[$dt][] = $row;
		}

		$res = $mysqli->query("SELECT * FROM visits_totals ORDER BY dt DESC");

		while ($row = $res->fetch_assoc()) {
			$dt = $row['dt'];
			$wwwvisits[$dt] = $row;
		}

		foreach($all as $dt=>$v) {
			if (!isset($sponsors[$dt])) {
				$sponsors[$dt] = [];
				$sponsors[$dt]['reppa'] = [];
				$sponsors[$dt]['genius'] = [];
				$sponsors[$dt]['reppa']['ipstot'] = $wwwvisits[$dt]['ip_reppa'];
				$sponsors[$dt]['reppa']['ipsuni'] = $wwwvisits[$dt]['ip_d_reppa'];
				$sponsors[$dt]['genius']['ipstot'] = $wwwvisits[$dt]['ip_genius'];
				$sponsors[$dt]['genius']['ipsuni'] = $wwwvisits[$dt]['ip_d_genius'];
			}
			foreach ($v as $row) {
				if (preg_match('#reppa#si', $row['customer'])) {
					$sponsors[$dt]['reppa']['start'] += $row['count_start'];
					$sponsors[$dt]['reppa']['end'] += $row['count_end'];
					$sponsors[$dt]['reppa']['ips'] += $row['visited'];
					$sponsors[$dt]['reppa']['ipst'] += $row['visits_total'];
				}
				else if (preg_match('#genius#si', $row['customer'])) {
					$sponsors[$dt]['genius']['start'] += $row['count_start'];
					$sponsors[$dt]['genius']['end'] += $row['count_end'];
					$sponsors[$dt]['genius']['ips'] += $row['visited'];
					$sponsors[$dt]['genius']['ipst'] += $row['visits_total'];
				}
			}
		}
		//if ($_GET['test']) { print_r($sponsors); exit; }
	} else if ($pgMode == 'users') {
		$items = []; $hashes = []; $shows = []; $tss = [];

		$res = $mysqli->query("SELECT ts, id, hash, count(*) AS cnt FROM viewers GROUP BY id, hash ORDER BY cnt DESC LIMIT ". ($pg -1) * $perPage . ','. $perPage);

		while ($row = $res->fetch_assoc()) {
			$items[] = $row;
			//$hashes[] = $row['hash'];
			$tss[] = $row['ts'];
		}
		$total = $perPage * 100;
		$lastPg = ceil($total / $perPage);
		if ($lastPg > 100)
			$lastPg = 100;

		//$res = $mysqli->query("SELECT title, start, end, duration, customer, MD5(CONCAT(title, ' ', DATE_FORMAT(FROM_UNIXTIME(start), '%H%i'))) AS hash FROM program WHERE duration > 5 * 60 -1 AND MD5(CONCAT(title, ' ', DATE_FORMAT(FROM_UNIXTIME(start), '%H%i'))) IN ('". implode("','", $hashes) ."')");
		$res = $mysqli->query("SELECT title, start, end, duration, customer FROM program WHERE duration > 5 * 60 -1 AND start IN (". implode(",", $tss) .")");
		echo $mysqli->error;
		while ($row = $res->fetch_assoc()) {
			$shows[$row['start']] = $row;
		}

	} else if ($pgMode == 'stats' && count($_POST)) {
		$start = $_POST['stats-start'];
		$end = $_POST['stats-end'];
		$startTs = strtotime($start);
		$endTs = strtotime($end) + 86399;
		$programStart = $_POST['tvshow'];

		if ($startTs > $endTs || $endTs - $startTs > 60 * 86400)
			die('Invalid dates selected');
	} else if ($pgMode == 'search' && count($_POST) && $_POST['search-start']) {
		$items = [];
		$start = $_POST['search-start'];
		$end = $_POST['search-end'];
		$tvshow = $_POST['tvshow'];

		$sts = strtotime($_POST['search-start']);
		$ets = strtotime($_POST['search-end'] .' 23:59:59');
		//echo("SELECT * FROM program WHERE start BETWEEN ". $sts ." AND ". $ets ." AND title = '". mysqli_escape_string($mysqli, $_POST['tvshow']) ."'");exit;
		$res = $mysqli->query("SELECT * FROM program WHERE start BETWEEN ". $sts ." AND ". $ets ." AND title = '". mysqli_escape_string($mysqli, $_POST['tvshow']) ."'");
		while ($row = $res->fetch_assoc()) {
			$items[] = $row;
		}
	}

	if ($pgMode == 'stats') {
		if (!count($_POST) && isset($_GET['start']) && $_GET['start'])
			$programStart = $_GET['start'];

		if (!isset($programStart))
			$programStart = time()-86400;

		if (!isset($startTs)) {
			$startTs = time() - 5 * 86400;
			$endTs = time() - 86400;
		}

		$start = date('d-m-Y', $startTs);
		$end = date('d-m-Y', $endTs);
		//echo "start $start end $end $startTs $endTs";

		$res = $mysqli->query("SELECT title, customer, start, end FROM program WHERE dt = ". date('Ymd', $programStart) ." AND duration > 5 * 60 - 1");
		while ($row = $res->fetch_row()) {
			$programCompare[$row[2]] = [];
			$programCompare[$row[2]]['title'] = $row[0]  .' '. $row[1];
			$programCompare[$row[2]]['end'] = $row[3];

			if ($row[2] == $programStart)  {
				$pageTitle = "Viewers for '". $row[0] .' '. $row[1] ."' ". dt($startTs) .' - '. dt($endTs);
			}
		}

		if (isset($_GET['test']) && $_GET['test']) echo("SELECT ts, v FROM compares WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $startTs) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $endTs) ." 23:59:59') AND HOUR(TIME(FROM_UNIXTIME(ts))) = HOUR('". date('H:i:s', $programStart) ."') AND MINUTE(TIME(FROM_UNIXTIME(ts))) BETWEEN MINUTE('". date('H:i:s', $programStart) ."') - 4 AND MINUTE('". date('H:i:s', $programStart) ."') + 4");
		$res = $mysqli->query("SELECT ts, v FROM compares WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $startTs) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $endTs) ." 23:59:59') AND HOUR(TIME(FROM_UNIXTIME(ts))) = HOUR('". date('H:i:s', $programStart) ."') AND MINUTE(TIME(FROM_UNIXTIME(ts))) BETWEEN MINUTE('". date('H:i:s', $programStart) ."') - 4 AND MINUTE('". date('H:i:s', $programStart) ."') + 4");
		$compares = [];
		while ($row = $res->fetch_assoc()) {
			$row['a'] = explode(',', $row['v']);
			$row['n'] = count($row['a']);
			$compares[] = $row;
		}
		//usort($compares, 'sortbyn');
		if (isset($_GET['test']) && $_GET['test']) { print_r($compares);exit; }
	}
}
function sortbyn($a, $b) {
	if ($a['n'] == $b['n']) {
		return 0;
	}
	return ($a['n'] > $b['n']) ? -1 : 1;
}
?>
<!DOCTYPE html>
<!--[if lt IE 8 ]><html lang="en" class="no-js ie ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="no-js ie"><![endif]-->
<!--[if (gt IE 8)|!(IE)]><!-->
<html class=" js hashchange backgroundsize boxshadow cssgradients" firetv-fullscreen="false" lang="en"><!--<![endif]--><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>CreteTV statistics</title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<!-- Global stylesheets -->
	<link href="css/reset.css" rel="stylesheet" type="text/css">
	<link href="css/common.css" rel="stylesheet" type="text/css">
	<link href="css/form.css?v1.1" rel="stylesheet" type="text/css">
	<link href="css/standard.css?v10" rel="stylesheet" type="text/css">
	
	<!-- Comment/uncomment one of these files to toggle between fixed and fluid layout -->
	<!--<link href="css/960.gs.css" rel="stylesheet" type="text/css">-->
	<link href="css/960.css" rel="stylesheet" type="text/css">
	
	<!-- Custom styles -->
	<link href="css/simple-lists.css" rel="stylesheet" type="text/css">
	<link href="css/block-lists.css" rel="stylesheet" type="text/css">
	<link href="css/planning.css" rel="stylesheet" type="text/css">
	<link href="css/table.css" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">
	
	<!-- Favicon -->
	<link rel="shortcut icon" type="image/x-icon" href="https://www.media-theia.de/images/favicon/favicon.ico">
	<link rel="icon" type="image/png" href="https://www.media-theia.de/images/favicon/favicon-large.png">
	
	<!-- Modernizr for support detection, all javascript libs are moved right above </body> for better performance -->
	<script src="https://www.gstatic.com/charts/loader.js"></script>
	<script src="js/modernizr.js"></script>
	<script src="js/libs/jquery-1.11.3.min.js"></script>
        <script src="js/libs/amchart/amcharts.js"></script>
        <script src="js/libs/amchart/serial.js"></script>
<style>
	.table tbody tr.sub td {
		background: #f2f2f2;
	}
	#latest-visits {
		width: 50%;
display: none;
	}

	table.latest-cnts {
		float: right;
		width: 50%;
	}
	table.latest-cnts td {
		width: 33%;
	}
	table.latest-cnts th,
	table.latest-cnts td {
		text-align: left;
		padding: 0 2px;
		cursor: pointer;
	}
	table.latest-cnts th small {
		font-size: 14px !important;
		vertical-align: middle;
	}
	button.loading,
	a.button.loading {
		background-image: url(images/info-loader.gif);
    		color: #1e5774;
	}
#visits_result {
	text-align: left;
}
.custom-dts {
	display: inline-block;
	width: 7%;
	vertical-align: top;
}
</style>
<script>
var descr = [], months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var sortTmAsc = false, lastCnts = {}, cntChart = null, pgMode = '<?php echo $pgMode?>';
google.charts.load('current', {'packages':['corechart']});

window.addEventListener('message', function (event) {
        //Here We have to check content of the message event  for safety purpose
        //event data contains message sent from page added in iframe as shown in step 3
        if (event.data.hasOwnProperty("FrameHeight")) {
                document.getElementById("statsIframe").style.height = event.data.FrameHeight+'px';
        }
});
function resizeIframe(ifr) {
        var height = ifr.contentWindow.postMessage("FrameHeight", "*");
}

function resizeFrame(ifr) {
        ifr.style.height = ifr.contentWindow.document.body.scrollHeight + 'px';
}

<?php
if (file_exists('/var/www/html/cretetv/json/descr.json')) {
	echo "descr = JSON.parse('". file_get_contents('/var/www/html/cretetv/json/descr.json') ."');\n";
}
?>

function selCat(v) {
	if (descr[v])
		$('#descr').val(descr[v]);
	else
		$('#descr').val('');
}
function resizeIframe(ifr) {
	var height = ifr.contentWindow.postMessage("FrameHeight", "*");
}

function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function showIframe() {
	var el = $('#inc-iframe');
	var ta = $('#stats-table');
	var hidden = el.css('display') == 'none';

	if (hidden) {
		ta.css({
			'width': '82%',
			'float': 'left',
		});
		el.css('height', ta.height());
		el.show();
	} else {
		ta.css({
			'width': '100%',
			'float': 'none',
		});
		el.hide();
	}
}

function getDuration(secs) {
	var duration = '';
	var days = Math.floor(secs / 86400);

	secs -= days * 86400;
	var hours = Math.floor(secs / 3600);

	secs -= hours * 3600;
	var minutes = Math.floor(secs / 60);
	var seconds = secs - minutes * 60;

	if(days > 0) {
		duration += days + 'd';
	}
	if(hours > 0) {
		duration += ' ' + hours + 'h';
	}
	if(minutes > 0) {
		duration += ' ' + minutes + 'm';
	}
	if(seconds > 0) {
		duration += ' ' + seconds + 's';
	}
	return duration;
}

function showTm(from, to, ctype, visitsTime, sortAsc = false, ret = true, more = false) {
	var tr = document.getElementById('data-'+ from +'-0');
	if (tr && !more) {
		for (var i = 0; i < 8000; i++) {
			var tr = document.getElementById('data-'+ from +'-'+ i);
			if (tr)
				tr.remove();
			else
				break;
		}
		document.getElementById('load-more').remove();
		if (ret)
			return;
	}
	const http = new XMLHttpRequest();
	const url = 'showRange.php?from='+ from +'&to='+ to +'&ctype='+ ctype +'&visitsTime='+ visitsTime+(more ? '&more=1':'');

	$('#a-'+ from).addClass('loading');

	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText);
			$('#a-'+ from).removeClass('loading');

			if (!res) {
				alert('json failed');
				return;
			} else if (res.error) {
				alert(res.error);
				return;
			} else {
				res.sort(function(a, b) {
					if (sortAsc)
						return a['duration'] - b['duration'];
					else
						return b['duration'] - a['duration'];
				});
				var el = document.getElementById('ts-'+ from);
				var cnt = res.length > 8000 ? 8000 : res.length, addSort = true, j = 0;
				if (more) {
					el = document.getElementById('load-more');
					j = 100;
				}

				if (1) {
					for (var i = 0;i < cnt; i++) {
						var o = res[i];
						var node = document.createElement("tr"); 
						var endDt = o.end, a ='',
						startDt = o.start;

						/*
						if (addSort) {
							a = '<a onclick="showTm('+ from +', '+ to +', ' + ctype +', '+ visitsTime +', '+ (sortAsc ? 'false':'true') +', false)" href="javascript:void(0)">sort '+ (sortAsc ? "desc":"asc") +'</a>';
							addSort = false;
					}*/

						node.innerHTML = '<td>'+ (i+j+1) + '</td><td'+ (o.tracked ? ' style="background: #bbffbb;"':'') +'><a target="show-id" href="show-id.php?id='+ o.smartid +'">' +(parseInt(o.smartid) > 0 ? o.smartid : o.id)+ '</a></td><td>'+ startDt +'</td><td>'+ endDt +'</td><td>'+ (o.duration > 0 ? getDuration(o.duration) : '4s') +'</td><td>'+ a +'</td><td></td><td></td>';
						node.id = 'data-'+ from +'-'+ (i+j);
						insertAfter(node, el);
						el = node;
					}
					if (!more) {
						var node = document.createElement("tr");
						node.innerHTML = '<td colspan="8"><a  onclick="showTm('+ from +', '+ to +', '+ ctype +', '+ visitsTime +', '+ sortAsc +', false, true)" href="javascript:void(0)">Περισσότερα</a></td>';
						node.id = 'load-more';
						insertAfter(node, el);
					} else
						document.getElementById('load-more').remove();
				} else {
					var ptitle = $(el).find('td').each(function(j, e) {
						if (j == 1)
							ptitle = e.innerHTML;
					});
					var s = '<table><thead><tr><th scope="blavk-cell"></th><th scope="col">ID</th><th scope="col">Start</th><th scope="col">End</a></th><th scope="col">Duration</th></tr></thead><tbody>';
					for (var i = 0;i < cnt; i++) {
						var o = res[i];
						var tempDt = new Date(o.ts * 1000);
						var d = toUTC(tempDt);
						var endDt = '', a = '';

						if (parseInt(o.duration)) {
							var n = (parseInt(o.ts) + parseInt(o.duration)) * 1000;
							var tmpDt = new Date(n);
							var t = toUTC(tmpDt);

							endDt = tm(t);
						}

						s += '<tr><th sceop="row">'+ (i+1) +'</th><td><a target="show-id" href="show-id.php?id='+ o.id +'">' +o.smartid+ '</a></td><td>'+ tm(d) +'</td><td>'+ endDt +'</td><td>'+ (o.duration > 0 ? getDuration(o.duration) : '') +'</td></tr>';
					}
					s += '</tbody></table>';

					$.modal({
						content: s,
						title: ptitle + ' ' +' '+ res.length +' visits',
						//maxWidth: 500,
						buttons: {
							'Open new modal': function(win) { openModal(); },
							'Close': function(win) { win.closeModal(); }
						}
					});
				}
			}
		}
	}
	return false;
}

function showGraph() {
	var cols = [], visits = [], i = 0, w = $(window).width() - 200;

	$.modal({
		content: '<div id="chart_div" style="height: 330px;"></div>',
		title: 'Program visits',
		width: w,
		buttons: {
			'Close': function(win) { win.closeModal(); }
		}
	});

	$($('.table')[1]).find('tbody tr').each(function(i, el) {
		$(el).find('td').each(function(j, td) {
			if (j == 0) {
				cols.push($(td).text());
			} else if (j == 4) {
				visits.push(parseInt($(td).text().replace(' visits', '')));
			}
		});
	});

	visits.unshift('Visits');

	// Create our data table.
	var data = new google.visualization.DataTable();
	var raw_data = [visits];
	
	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i) {
		data.addColumn('number', raw_data[i][0]);	
	}
	
	data.addRows(cols.length);
	
	for (var j = 0; j < cols.length; ++j) {	
		data.setValue(j, 0, cols[j]);	
	}

	for (var i = 0; i < raw_data.length; ++i) {
		for (var j = 1; j < raw_data[i].length; ++j) {
			data.setValue(j-1, i+1, raw_data[i][j]);	
		}
	}
	
	// Create and draw the visualization.
	googleChart = new google.visualization.ChartWrapper();

	googleChart.setContainerId('chart_div');
	googleChart.setChartType('LineChart');
	//googleChart.setChartType('ColumnChart');
	googleChart.setDataTable(data);
	googleChart.setOptions({
		title: 'Program Visits',
		width: w-50,
		height: 330,
		legend: 'right',
		yAxis: {title: '(thousands)'}
	});
	googleChart.draw();
	
	// Message
	notify('Chart updated');
}

function toUTC(date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours()+2, date.getUTCMinutes(), date.getUTCSeconds()); 
}

function showId(id, ts) {
	var tr = document.getElementById('data-'+ id +'-0');
	if (tr) {
		for (var i = 0; i < 1000; i++) {
			var tr = document.getElementById('data-'+ id +'-'+ i);
			if (tr)
				tr.remove();
			else
				break;
		}
		return;
	}
	const http = new XMLHttpRequest();
	const url = 'showId.php?id='+ id +'&ts='+ ts;

	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText);
			console.log(res);

			if (!res) {
				alert('json failed');
				return;
			} else if (res.error) {
				alert(res.error);
				return;
			} else {
				var el = document.getElementById('id-'+ id);

				for (var i = 0;i < res.length; i++) {
					var o = res[i];
					var node = document.createElement("tr"); 
					var d = new Date(o.ts * 1000);
					var dt = d.getDate() + ' '+ months[d.getMonth()] +' '+ d.getHours() +':'+ d.getMinutes() +':'+ d.getSeconds();

					node.innerHTML = '<td></td><td></td><td></td><td>'+ dt +'</td><td>'+ (o.duration > 0 ? getDuration(o.duration) : '0') +'</td><td></td>';
					node.id = 'data-'+ id +'-'+ i;
					node.className = 'sub';
					insertAfter(node, el);
					el = node;
				}
			}
		}
	}
	return false;
}

function tm(d) {
	return (d.getHours() < 10 ? '0':'') + d.getHours() +':'+ (d.getMinutes() < 10 ? '0':'') + d.getMinutes() +':'+ (d.getSeconds() < 10 ? '0':'')+ d.getSeconds();
}
function redrawCntsGraph() {
	if (cntChart == null)
		return;
	// Create our data table.
	var dt = new Date(lastCnts.ts * 1000);
	var dt2 = new Date(lastCnts.ts2 * 1000);
	var dt3 = new Date(lastCnts.ts3 * 1000);
	var data = new google.visualization.DataTable();
	var raw_data = [['Visits total', lastCnts.cnt, lastCnts.cnt2, lastCnts.cnt3],
			['Visits: same IDs', 0, lastCnts.b_cnt, lastCnts.c_cnt],
			['Visits: IDs left', 0, lastCnts.cnt - lastCnts.b_cnt, lastCnts.cnt - lastCnts.c_cnt]];
	
	var cols = [tm(dt3), tm(dt2), tm(dt)];
	
	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i)
	{
		data.addColumn('number', raw_data[i][0]);	
	}
	
	data.addRows(cols.length);
	
	for (var j = 0; j < cols.length; ++j)
	{	
		data.setValue(j, 0, cols[j]);	
	}
	for (var i = 0; i < raw_data.length; ++i)
	{
		for (var j = 1; j < raw_data[i].length; ++j)
		{
			data.setValue(j-1, i+1, raw_data[i][j]);	
		}
	}
	cntChart.setDataTable(data);
	cntChart.draw();
}
function openCntsGraph() {
	var i = 0, w = $(window).width();
	console.log(lastCnts);
	//return;
	$.modal({
		content: '<div id="cnt_chart" style="height: 330px;"></div>',
		title: 'Latest counts',
		width: w - 700,
		buttons: {
			'Close': function(win) {
				win.closeModal();
				cntChart = null;
			}
		}
	});

	// Create our data table.
	var dt = new Date(lastCnts.ts * 1000);
	var dt2 = new Date(lastCnts.ts2 * 1000);
	var dt3 = new Date(lastCnts.ts3 * 1000);
	var data = new google.visualization.DataTable();
	var raw_data = [['Visits total', lastCnts.cnt, lastCnts.cnt2, lastCnts.cnt3],
			['Visits: same IPs', 0, lastCnts.b_cnt, lastCnts.c_cnt],
			['Visits: IPs left', 0, lastCnts.cnt - lastCnts.b_cnt, lastCnts.cnt - lastCnts.c_cnt]];
	
	var cols = [tm(dt3), tm(dt2), tm(dt)];
	
	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i)
	{
		data.addColumn('number', raw_data[i][0]);	
	}
	
	data.addRows(cols.length);
	
	for (var j = 0; j < cols.length; ++j)
	{	
		data.setValue(j, 0, cols[j]);	
	}
	for (var i = 0; i < raw_data.length; ++i)
	{
		for (var j = 1; j < raw_data[i].length; ++j)
		{
			data.setValue(j-1, i+1, raw_data[i][j]);	
		}
	}

	// Create and draw the visualization.
	cntChart = new google.visualization.ChartWrapper();

	cntChart.setContainerId('cnt_chart');
	cntChart.setChartType('ColumnChart');
	cntChart.setDataTable(data);
	cntChart.setOptions({
		title: 'Latest Smart TVs',
		width: w-880,
		height: 330,
		legend: 'right',
		yAxis: {title: '(thousands)'},
		colors: ['#4374e0', 'green', '#e2431e']
	});
	cntChart.draw();
}
function relo() {
	return;
	const http = new XMLHttpRequest();
	const url = 'latest-cnts.php';

	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText);

			if (!res) {
				alert('json failed');
				return;
			} else if (res.error) {
				alert(res.error);
				return;
			} else {
				var el = document.getElementById('latest-visits');
				var dt = new Date(res['ts'] * 1000);
				var dt2 = new Date(res['ts2'] * 1000);
				var dt3 = new Date(res['ts3'] * 1000);
				var s = '';
				lastCnts = $.extend({}, res);
				redrawCntsGraph();

				s += '<table class="latest-cnts"><tbody><tr><td>1 min</td><td>2 min</td><td>3 min</td></tr>';
				s += '<tr><th>'+ res['mincnt'] +'</th><th>'+ res['mincnt2'] +'</th><th>'+ res['mincnt3'] +'</th></tr>';

				s += '<table class="latest-cnts" onclick="openCntsGraph()"><tbody><tr><td>'+ tm(dt3) +'</td><td>'+ tm(dt2) +'</td><td>'+ tm(dt) +'</td></tr>';
				s += '<tr><th>'+ res['cnt'] +'</th><th>'+ res['cnt2'] +' <small>('+ res['b_cnt'] +')</small></th><th>'+ res['cnt3'] +' <small>('+ res['c_cnt'] +')</small></th></tr>';

				el.innerHTML = s;//res['cnt']+ ' (10 sec)';
			}
		}
	}
}

</script>
</head>
<body onload="load();">
	
	<!-- Header -->
	
	<!-- Server status -->
	<header><div class="container_12">
		
		<p id="skin-name"><small>CreteTV HbbTV Stats<br> <br> </small></p></div></header>
	<!-- End server status -->
	
	<!-- Main nav -->
	<nav id="main-nav">
		<img src="images/cretetv-stats.png" width="124" height="auto" style="float: left; margin: 6px 20px;">
		<ul class="container_12">
<?php
foreach ($pages as $key => $val) {
	echo '<li class="'. $key .' '. ($key == $pgMode ? 'current' : '') .'"><a href="?pgMode='. $key .'" title="'. $val .'">'. $val .'</a></li>';
	if ($key == $pgMode)
		$curPageTitle = $val;
}
?>
		</ul>
                <img src="images/cretetv-vod.png" style="margin:-21px 0px auto 50px; float: left;" width="124" height="auto">
                <ul style="margin-top: -20px; float: left;">
<?php
foreach ($pages2 as $key => $val) {
	echo '<li class="'. $key .' '. ($key == $pgMode ? 'current' : '') .'"><a href="?pgMode='. $key .'" title="'. $val .'">'. $val .'</a></li>';
	if ($key == $pgMode)
		$curPageTitle = $val;
}
?>
                </ul>
<?php if (count($pages3)) { ?>
                <img src="images/cretetv-mgr.png" style="margin:-21px -18px auto 50px; float: left;" width="124" height="auto">
                <ul style="margin-top: -20px; float: left;">
<?php
foreach ($pages3 as $key => $val) {
	echo '<li class="'. $key .' '. ($key == $pgMode ? 'current' : '') .'"><a href="?pgMode='. $key .'" title="'. $val .'">'. $val .'</a></li>';
	if ($key == $pgMode)
		$curPageTitle = $val;
}
?>
                </ul>
<?php } ?>
	</nav>
	<!-- End main nav -->
<?php
if (ENABLE_LOGIN && !$userLoggedName) {
        require('login.php');
        exit;
}
?>

	<!-- Sub nav -->
	<div id="sub-nav"><div class="container_12">
		
		<form id="search-form" name="search-form" method="post" action="">
		<input name="sip" id="s" title="Search..."  type="text" value="<?php echo isset($_POST['sip'])?$_POST['sip']:""?>">
			<button type="submit">Search program</button>
		</form>
	
	</div></div>
<?php
if (isset($_POST['sip']) && $_POST['sip'] && filter_var($_POST['sip'], FILTER_VALIDATE_IP))
	echo '<p>'. $_POST['sip'] .' not found</p>';
?>
	<!-- End sub nav -->
	
	<!-- Status bar -->
	<div id="status-bar"><div class="container_12">
	
		<ul id="status-infos">
 			<li class="spaced">Logged as: <strong><?php echo $userLoggedName;?></strong></li>
			<li><a href="?action=logout" class="button red" title="Logout"><span class="smaller">LOGOUT</span></a></li>

		</ul>
		
		<!-- v1.5: you can now add class red to the breadcrumb -->
		<ul id="breadcrumb">
<?php
echo '<li>'. $curPageTitle .'</li>';
//<a href="?" title="Dashboard">Dashboard</a></li>
?>
		</ul>
	
	</div></div>
	<!-- End status bar -->
<div id="header-shadow"></div>
	
	<article class="container_12">
<?php if ($pgMode != 'hbbtvapp' && $pgMode != 'settings' && $pgMode!='man_wlist' && $pgMode != 'man_but') { ?>

		<section class="grid_12">
			<div class="block-border"><div class="block-content">

<?php
}

if ($pgMode == 'home' || $pgMode == 'users') {
	echo '<h1>'. $curPageTitle .'</h1> <div> <div class="block-controls"> <ul class="controls-buttons"><li><a href="?pgMode=program">Program</a></li>';
} else if ($pgMode == 'program') {
	echo '<h1> '. $curPageTitle .' </h1> <div> <div class="block-controls">';
	echo '<form method="get" style="padding-right: 10%;" class="form">';
	echo '<input type="hidden" name="pgMode" value="'. $pgMode .'">';
	echo '<input type="hidden" name="showReppa" value="'. $showReppa .'">';
	echo '<input type="hidden" name="showAll" value="'. $showAll .'">';
	echo '<input type="hidden" name="showGenius" value="'. $showGenius .'">';
	echo '<input type="hidden" name="visitsTime" value="'. $visitsTime .'">';
	//echo '<label for="selectdt">Date</label> <select name="curDt" id="selectdt" onchange="location=\'?pgMode=program&curDt=\'+this.value">';
	echo '<label class="inline" for="selectdt">Date</label> <select name="curDt" id="selectdt" onchange="this.form.submit()">';

	foreach ($programDts as $d) {
		$ts = strtotime($d);
		echo '<option value="'. $d .'"'. ($curDt == $d ? ' selected="selected"':'') .'>'. date('d M Y', $ts) .'</option>'. "\n";
	}

	if (isset($customdt) && $customdt && !in_array($customdt, $programDts))
		echo '<option value="'. $customdt .'" selected="selected">'. date('d M Y', strtotime($customdt)) .'</option>'. "\n";

	echo '</select>';
	echo '<label class="inline" for="custom-dt"> Other date </label>';
	echo '<span class="input-type-text"><input name="custom-dt" id="custom-dt" class="datepicker" type="text" autocomplete="off" value=""><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</form>';

	echo '<span style="float: right; margin-top: 12px;" id="get-visits">';
	echo 'Smart TVs for dates: ';
        echo '<span class="input-type-text"><input name="visits_start_dt" id="visits_start_dt" class="datepicker" type="text" autocomplete="off" value=""></span>';

        echo ' - <span class="input-type-text"><input name="visits_end_dt" id="visits_end_dt" class="datepicker" type="text" autocomplete="off" value=""></span>';

	echo ' <div class="custom-dts"><select name="visits_start_time" id="visits_start_time">';
	$visits_start_time = '12:00';
	for ($i = 0; $i < 24; $i++) {
		for ($j = 0; $j < 60; $j+=15) {
			$v = sprintf('%02d:%02d', $i, $j, $i, $j);
			printf('<option value="'. $v .'"'. ($visits_start_time == $v ? ' selected="selected"':'') .'>'. $v .'</label>');
		}
	}
	echo '</select>';
	echo '<input style="width: 4em" type="text" id="visits_start_time_txt" name="visits_start_time_txt">';
	echo '</div>';

	echo ' - <div class="custom-dts"><select name="visits_end_time" id="visits_end_time">';
	$visits_end_time = '12:30';
	for ($i = 0; $i < 24; $i++) {
		for ($j = 0; $j < 60; $j+=15) {
			$v = sprintf('%02d:%02d', $i, $j);
			printf('<option value="'. $v .'"'. ($visits_end_time == $v ? ' selected="selected"':'') .'>'. $v .'</label>');
		}
	}
	echo '</select>';
	echo '<input style="width: 4em" type="text" id="visits_end_time_txt" name="visits_end_time_txt">';
	echo '</div>';

	echo ' <label for="visits_duration" style="margin-left:10px">Duration:</label> <select name="visits_duration" id="visits_duration">';
	for ($i = 1; $i < 151; $i++) {
		$d = 4 * $i;
		echo '<option value="'. $d .'">'. getDuration($d) .'</option>';
	}
	echo '</select>';
	echo ' <button style="font-size: 14px;" id="get_visits_range">Get visits</button>';

	echo '<div id="visits_result"></div>';

	echo '</span>';
} else if ($pgMode == 'medias') {
	echo '<h1>L-Banner</h1> <div> <div class="block-controls">';
} else if ($pgMode == 'sponsors') {
	echo '<h1>'. $curPageTitle .'</h1> <div> <div class="block-controls">';
} else if ($pgMode == 'users') {
	echo '<h1>Popular shows</h1> <div> <div class="block-controls">';
} else if ($pgMode == 'stats' || $pgMode == 'mgr')
	echo '<h1>'. $curPageTitle .'</h1><div class="block-controls"> <ul class="controls-buttons"></ul>';
else if ($pgMode == 'search')
	echo '<h1>'. $curPageTitle .'</h1><div class="block-controls"> <ul class="controls-buttons"></ul>';
else if ($pgMode == 'hbbtvapp') {
	echo '<iframe id="statsIframe" src="http://smarttv.anixa.tv/cretetv/stats/hbbtv_stats/" onload="resizeIframe(this)" style="width:100%;" frameborder="0"  scrolling="yes" /></article>a';
} else if ($pgMode == 'man_but') {
	echo '<iframe id="button" src="http://smarttv.anixa.tv/stats/button.php?ch=cretetv" onload="resizeFrame(this)" style="height: 700px;width:100%;" frameborder="0"  scrolling="yes" /></article>a';
} else if ($pgMode == 'settings') {
	echo '<iframe id="statsIframe" src="http://smarttv.anixa.tv/cretetv/stats/tools/chart.php" style="width:100%; height:650px;" frameborder="0"  scrolling="no" /></article>a';
}

if ($pgMode == 'home' || $pgMode == 'users') {
	echo '</ul>';
}

?>
					</div>
					<div class="infos clearfix">
						<h2 class="bigger">
<?php
if ($pgMode == 'home')
	echo '5 days Stats';
else if ($pgMode == 'program')
	echo 'Program '. date('d M Y', strtotime($curDt));
else if ($pgMode == 'sponsors')
	echo 'All sponsors visits';
else if ($pgMode == 'sponsors')
	echo 'Popular shows';
else
	echo $pageTitle;
?>
<?php if (0 && $pgMode == 'program') echo '<a href="javascript:void(0)" style="margin-left: 100px;" onclick="showGraph()"><img src="images/Line-Chart.png" width="48" height="48" title="Lines Chart" alt="Lines-Chart" style="vertical-align:middle"></a>';?>
<span style="float: right;" id="latest-visits"></span>
</h2>
					</div>

<?php
if ($pgMode == 'program') {
	$reppaPageVisits = 0; $geniusPageVisits = 0; $b1 = time(); $otherVCnt = 0;
	//echo '2 - '.$b1;
	$repTotal = 0; $genTotal = 0; $customers = [];
	$otherCnt = 0; $cstart = 0; $cend = 0; $otherVgt1 = 0; $zero =0; $new = 0;
	foreach ($program as $row) {
		$cnt = $row['cnt'];

		$ctype = 0;
		if (preg_match('#Reppa#si', $row['customer'])) {
			$customers['Reppa']['count_start'] += $row['count_start'];
			$customers['Reppa']['count_end'] += $row['count_end'];
			$customers['Reppa']['cnt'] += $row['cnt'];
			if ($row['duration'] > 120 && $row['duration'] < 4 * 3600) {
				$customers['Reppa']['vgt1'] += $row['vgt1'];
				$customers['Reppa']['vcnt'] += $row['cnt'];
			}
			$customers['Reppa']['zero'] += $row['zero'];
			$customers['Reppa']['new'] += $row['new'];
			$ctype = 2;
		} else if (preg_match('#Genius#si', $row['customer'])) {
			$customers['Genius']['count_start'] += $row['count_start'];
			$customers['Genius']['count_end'] += $row['count_end'];
			$customers['Genius']['cnt'] += $row['cnt'];
			if ($row['duration'] > 120 && $row['duration'] < 4 * 3600) {
				$customers['Genius']['vcnt'] += $row['cnt'];
				$customers['Genius']['vgt1'] += $row['vgt1'];
			}
			$customers['Genius']['zero'] += $row['zero'];
			$customers['Genius']['new'] += $row['new'];
			$ctype = 1;
		} else if (isset($customers[$row['customer']]) && $customers[$row['customer']]) {
			$customers[$row['customer']]['count_start'] += $row['count_start'];
			$customers[$row['customer']]['count_end'] += $row['count_end'];
			echo $row['customer'];
		} else {
			$otherCnt += $row['cnt'];
			if ($row['duration'] > 120 && $row['duration'] < 4 * 3600) {
				$otherVgt1 += $row['vgt1'];
				$otherVCnt += $row['cnt'];
			}
			$cstart += $row['count_start'];
			$cend += $row['count_end'];
			$zero += $row['zero'];
			if(isset($row['new']) && $row['new'])
				$new += $row['new'];
		}

		//if ($ctype && ($visitsReppa[$row['start']] || $visitsGenius[$row['start']])) {
		if ($ctype && $row['visited']) {
			//$n = ($ctype == 1 ? count($visitsGenius[$row['start']]) : count($visitsReppa[$row['start']]));
			$n = $row['visited'];
			if ($_GET['testips']) {
				if ($row['start'] == 1571777125) {
					print_r($visitsGenius[1571777125]);
				}
			}
			$ctype == 1 ? $geniusPageVisits += $n : $reppaPageVisits += $n;
			$n = $row['visits_total'];
			$ctype == 1 ? $genTotal += $n : $repTotal += $n;
		}
	}
	$log .= '<br>Time for calc totals: '. timer_diff($b1);
	$b1 = microtime(true);
	//echo '3 - '.$b1;
?>
	<table class="table" width="100%" cellspacing="0">
	<thead>
		<tr>
			<th scope="col"></th>
			<th scope="col">Smart TVs</th>
			<!--<th scope="col">Smart TVs &gt; 10 seconds</th>-->
			<th scope="col">Smart TVs start</th>
			<th scope="col">Smart TVs end</th>
			<th scope="col">Viewers &gt; 1 minute</th>
		</tr>
	</thead>
	<tbody>
<?php
$v = 0; $vs = 0; $ve = 0; $vi = 0; $z = 0; $n = 0; $vc = 0;
foreach ($customers as $c => $o) {
	$v += $o['cnt'];
	$vs += $o['count_start'];
	$ve += $o['count_end'];
	$vi += $o['vgt1'];
	$vc += $o['vcnt'];
	$z += $o['zero'];
	$t += $o['total'];

	echo '<tr><td>'. $c .'</td><td>'. fm($o['cnt']) .'</td><td></td><td>'. fm($o['cnt'] - $o['zero']) .'</td><td>'. fm($o['count_start']) .'</td><td>'. fm($o['count_end']) .'</td><td>'. fm($o['vgt1']) .'&nbsp;&nbsp;'. percent($o['vgt1'], $o['vcnt']) .'%' .'</td></tr>';
}
$v += $otherCnt;
$z += $zero;
$vs += $cstart;
$ve += $cend;
$vi += $otherVgt1;
$vc += $otherVCnt;
$n += $new;
$otherPercent = 0;
echo '<tr><td>Total</td><td>'. fm($v) .'</td><td>'. fm($vs) .'</td><td>'. fm($ve) .'</td><td>'. fm($vi) .'&nbsp;&nbsp;'. percent($vi, $vc) .'%</td></tr>';
//echo '<tr><td>Total Smart Tvs > 10 seconds</td><td colspan="6">'. fm($totalMorethan10) .'</td></tr>';
?>
	</tbody>
	</table>


<?php
echo '<div style="float: right;">';
//echo '<button style="margin-left: 10px;" title="Only shows > 5 minutes" onclick="location=\'?pgMode=program&curDt='. $curDt .'&visitsTime='. $visitsTime .'&showAll='. ($showAll && (!$showReppa && !$showGenius) ? '0':'1') .'\'">'. ($showAll && (!$showReppa && !$showGenius) ? 'Hide short':'Show All') .'</button>';
if ($showGenius || $showReppa)
	echo '<button style="margin-left: 10px;" onclick="window.open(\'export-csv.php?curDt='. $curDt .'&visitsTime='. $visitsTime .'&showGenius='. $showGenius .'&showReppa='. $showReppa .'\')">Export CSV</button>';
echo '</div>';
?>
					<table id="stats-table" class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell"></th>
							<th scope="col">Start</th>
							<th scope="col">Title</th>
							<th scope="col">End</th>
							<th scope="col">Duration</th>
							<th scope="col">Smart TVs</th>
							<th scope="col">Smart TVs start</th>
							<th scope="col">Smart TVs end</th>
							<th scope="col">Viewers &gt;1 minute</th>
							<th scope="col">Avg duration</th>
						</tr>
					</thead>
					<tbody>
<?php
$k=0;
$b1 = microtime(true);
//echo '4 - '.$b1;
foreach ($program as $row) {
	$cnt = $row['cnt'];

	echo ("<tr id=\"ts-". $row['start'] ."\">\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo ("<td>". date('H:i:s', $row['start']) ."</td>\n");

	echo ("<td>". $row['title']);

	if (isset($row['inf']) && $row['inf'])
		echo " ". $row['inf'];

	if ($row['customer'])
		echo " ". $row['customer'];
	$ctype = 0;
	if (preg_match('#Reppa#si', $row['customer'])) {
		$ctype = 2;
	} else if (preg_match('#Genius#si', $row['customer']))
		$ctype = 1;

	echo ("</td>\n");

	echo ("<td>". date('H:i:s', $row['end']) ."</td>\n");
	echo ("<td>". getDuration($row['duration']) ."</td>\n");
	$more = '';
	if ($row['duration'] > 100)
		$more = " - <a class=\"button\" href=\"showCols.php?from=". $row['start']. '&to='. $row['end']. "\" target=\"show-cols\">Stats</a>";
	if ($row['duration'] > 5 * 60 - 1)
		$more .= " - <a class=\"button red\" href=\"?pgMode=stats&start=". $row['start']. "\">Compare</a>";

	//if ($ctype && ($visitsReppa[$row['start']] || $visitsGenius[$row['start']])) {
	if ($ctype && $row['visited']) {
		//$n = ($ctype == 1 ? count($visitsGenius[$row['start']]) : count($visitsReppa[$row['start']]));
		$n = $row['visited'];
		if ($_GET['testips']) {
		if ($row['start'] == 1571777125) {
			print_r($visitsGenius[1571777125]);
		}
		}
		$ctype == 1 ? $geniusPageVisits += $n : $reppaPageVisits += $n;
		$more .= " - <a class=\"button\" href=\"matchIps.php?from=". $row['start']. '&to='. $row['end']. "&visitsTime=". $visitsTime ."\" target=\"show-ips\" style=\"background: #bbffbb;\">". $n ."</a>";
	}

	echo ("<td>". ($cnt > 1 ? "<a id=\"a-". $row['start'] ."\" onclick=\"showTm(". $row['start'] .", ". $row['end'] .", ". $ctype .", ". $visitsTime .") \" class=\"button\" href=\"javascript:void(0)\">". fm($cnt) ." smart TVs</a>". $more : '-'). "</td>\n");
	echo ("<td>". $row['count_start'] ."</td>\n");
	echo ("<td>". $row['count_end'] ."</td>\n");
	echo ("<td>". ($row['vgt1'] ? $row['vgt1'] .'&nbsp;&nbsp;'. percent($row['vgt1'], $row['cnt']) .'%' : '') ."</td>\n");
	echo ("<td>". ($row['vgt1'] ? getDuration($row['avg_duration']) : '') ."</td>\n");
	echo ("</tr>\n");
	if ($row['vgt1'])
		$otherPercent += percent($row['vgt1'], $row['cnt']);
	++$k;
}
$log .= '<br>Time for program: '. timer_diff($b1);
?>
	</tbody>
	</table>
<?php //echo number_format($otherPercent / ($k+1), 2)?>

	<iframe id="inc-iframe" style="display: none; float: right; width: 18%; top: 0;right: 0; overflow-y: hidden;" scrolling="no" src='http://db1.anixa.tv/fr.php';></iframe>
<?php } else if ($pgMode == 'sponsors') {
 ?>
					<table class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell" rowspan="2"></th>
							<th scope="col" rowspan="2">Date</th>
							<th scope="col" colspan="5">Reppa</th>
							<th scope="col" colspan="5">Genius</th>
						</tr>
						<tr>
							<th scope="col">Visits start</th>
							<th scope="col">Visits end</th>
							<th scope="col">Page visits</th>
							<th scope="col">Site Unique IPs</th>
							<th scope="col">Site Total IPs</th>
							<th scope="col">Visits start</th>
							<th scope="col">Visits end</th>
							<th scope="col">Page visits</th>
							<th scope="col">Site Unique IPs</th>
							<th scope="col">Site Total IPs</th>
						</tr>
					</thead>
					<tbody>
<?php
$k=0; $reppaStart = 0; $reppaEnd = 0; $reppaIps = 0; $geniusStart = 0; $geniusEnd = 0; $geniusIps = 0;
$reppaUni = 0; $reppaTot = 0; $genUni = 0; $genTot = 0;
$jsStart = "[['Sponsor',{'label': 'Reppa', type: 'number'}, {'label': 'Genius', type: 'number'}],";
$jsEnd = "[['Sponsor',{'label': 'Reppa', type: 'number'}, {'label': 'Genius', type: 'number'}],";
$jsIps = "[['Sponsor',{'label': 'Reppa', type: 'number'}, {'label': 'Genius', type: 'number'}],";

foreach ($sponsors as $dt=>$row) {
	echo ("<tr>\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo ("<td>". dt(strtotime($dt)) ."</td>\n");

	echo ("<td>". fm($row['reppa']['start']) .'</td>');
	echo ("<td>". fm($row['reppa']['end']) .'</td>');
	echo ("<td>". fm($row['reppa']['ips']) .' / '. fm($row['reppa']['ipst']) .'</td>');
	echo ("<td>". fm($row['reppa']['ipsuni']) .'</td>');
	echo ("<td>". fm($row['reppa']['ipstot']) .'</td>');
	echo ("<td>". fm($row['genius']['start']) .'</td>');
	echo ("<td>". fm($row['genius']['end']) .'</td>');
	echo ("<td>". fm($row['genius']['ips']) .' / '. fm($row['genius']['ipst']) .'</td>');
	echo ("<td>". fm($row['genius']['ipsuni']) .'</td>');
	echo ("<td>". fm($row['genius']['ipstot']) .'</td>');

	$reppaStart += $row['reppa']['start'];
	$reppaEnd += $row['reppa']['end'];
	$reppaIps += $row['reppa']['ips'];
	$reppaUni += $row['reppa']['ipsuni'];
	$reppaTot += $row['reppa']['ipstot'];
	$geniusStart += $row['genius']['start'];
	$geniusEnd += $row['genius']['end'];
	$geniusIps += $row['genius']['ips'];
	$genUni += $row['genius']['ipsuni'];
	$genTot += $row['genius']['ipstot'];

	$jsStart .= "['". dt(strtotime($dt)) ."',". $row['reppa']['start'] .','. $row['genius']['start'] ."],\n";
	$jsEnd .= "['". dt(strtotime($dt)) ."',". $row['reppa']['end'] .','. $row['genius']['end'] ."],\n";
	if ($row['reppa']['ips'])
		$jsIps .= "['". dt(strtotime($dt)) ."',". $row['reppa']['ips'] .','. $row['genius']['ips'] ."],\n";

	echo ("</tr>\n");
	++$k;
}
$jsStart .=']'; $jsEnd .=']'; $jsIps .=']';

echo '<tr><td></td><td>Total</td><td>'. fm($reppaStart) .'</td><td>'. fm($reppaEnd) .'</td><td>'. fm($reppaIps) .'</td>';
echo '<td>'. fm($reppaUni) .'</td><td>'. fm($reppaTot) .'</td>';
echo '<td>'. fm($genUni) .'</td><td>'. fm($genTot) .'</td>';
echo '<td>'. fm($geniusStart) .'</td><td>'. fm($geniusEnd).'</td><td>'. fm($geniusIps) .'</td></tr>';
?>
	</tbody>
	</table>
	<ul class="message no-margin">
	<li>Tracked visits -+ <?php echo ($visitsTime / 3600)?> hours</li>
	</ul>
		<div id="chart_start" style="height:530px;"></div>
		<div id="chart_end" style="height:530px;"></div>
		<div id="chart_ips" style="height:530px;"></div>

<?php } else if ($pgMode == 'users') {
 ?>
					<table class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell"></th>
							<th scope="col">Profile</th>
							<th scope="col">Show</th>
							<th scope="col">Customer</th>
							<th scope="col">Time</th>
							<th scope="col">Duration</th>
							<th scope="col">Views</th>
						</tr>
					</thead>
					<tbody>
<?php

$k = ($pg - 1) * $perPage;
foreach ($items as $row) {
	$show = $shows[$row['ts']];
	echo ("<tr>\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo '<td><a href="show-id.php?id='. $row['id'] .'" target="_blank">'. $row['id'] .'</a></td>';

	echo ("<td><span title=". $row['hash'] .">". ($show ? $show['title'] : $row['ts']) .'</span></td>');
	echo ("<td>". $show['customer'] .'</td>');
	echo ("<td>". date('H:i:s', $show['start']) .' - '. date('H:i:s', $show['end']) .'</td>');
	echo ("<td>". getDuration($show['duration']) .'</td>');
	echo ("<td>". $row['cnt'] .'</td>');

	echo ("</tr>\n");
	$k++;
}
?>
	</tbody>
	</table>

<?php } else if ($pgMode == 'home') { ?>
        <table class="table" width="100%" cellspacing="0">
        <thead>
                <tr>
                        <th scope="col">Channel</th>
                        <th scope="col">Total smart TVs (sessions)</th>
                        <th scope="col">No Cookie</th>
                        <th scope="col">New Smart IDs</th>
                        <th scope="col">Smart IDs given from start</th>
                        <!--<th scope="col">Smart TVs &gt; 10 seconds</th>-->
                        <th scope="col">Viewers &gt; 1 minute</th>
                </tr>
        </thead>
        <tbody>
<?php
foreach ($all as $d=>$a) {
        $ts = strtotime($d);
        echo '<tr><td><h5 style="font-size: 12px">'. dt($ts) .'</h5></td>';
        foreach ($a as $row) {
                echo '<td>'. @fm($row['cnt']) .'</td>';
                echo '<td>'. @fm($row['cookie']) .'</td>';
                //echo '<td>'. @fm($row['new']) .'</td><td>'. @fm($row['newStart']) .'</td><td>'. @fm($row['tvsgt10']) .'</td><td>'. @fm($row['vgt1']) .'&nbsp;&nbsp;'. @percent($row['vgt1'], $row['cnt']) .'%</td></tr>';
                echo '<td>'. @fm($row['new']) .'</td><td>'. @fm($row['newStart']) .'</td><td>'. @fm($row['vgt1']) .'&nbsp;&nbsp;'. @percent($row['vgt1'], $row['cnt']) .'%</td></tr>';
        }
}
echo '</tbody></table>';
echo '<table class="table" width="100%" cellspacing="0">';
        echo '<tbody>';
        echo '<tr>';
        //echo '<th>Total Smart IDs: <span style="padding-left: 4%; font-size: 20px;">'. (isset($newStart)?fm($newStart):"0") .'</span></th>';
        echo '</tr>';
echo '</tbody></table>';

}

if ($pgMode == 'home' || $pgMode == 'program')
	echo '</tbody></table>';

if ($pgMode == 'stats') {
	echo '<form class="form" id="tab-stats" method="post" action="" style="margin-bottom: 24px;">';
	echo '<fieldset class="grey-bg">';
	echo '<legend><a href="#">Options</a></legend>';
	echo '<div class="float-left gutter-right">';
	echo '<label for="stats-start">Start</label>';
	echo '<span class="input-type-text"><input name="stats-start" id="stats-start" class="datepicker" type="text" value="'. $start .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="stats-end">End</label>';
	echo '<span class="input-type-text"><input name="stats-end" id="stats-end" class="datepicker" type="text" value="'. $end .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="tvshow">TV Show</label>';
	echo '<select name="tvshow" id="tvshow">';
	foreach ($programCompare as $ts=>$show)
		echo '<option value="'. $ts .'"'. ($programStart == $ts ? ' selected="selected"':'') .'>'. date('H:i:s', $ts) .' - ' .date('H:i:s', $show['end']) .' '. htmlspecialchars($show['title']) .'</option>'."\n";
	echo '</select>';
	echo '</div>';

	echo '<input style="margin-top: 1%;" type="submit" class="button" value="Results">';
	echo '</fieldset>';
	echo '</form>';

	if (count($compares)) {
		$timeel = 60; $duration = 1800;

		$jsCompare = "[['Day',";
		foreach ($compares as $v) {
			$jsCompare .= "{label: '". dt($v['ts']) ."', type: 'number'},";
		}
		$jsCompare .= "],\n";

		$ts = $programStart; $n = 0;

		if (0 && $_GET['test']) {
			// find min time
			$minTs = $compares[0]['ts'];

			foreach ($compares as $v) {
				$minTs = min($minTs, $v['ts']);
			}

			// adjust values by time
			$m = date('His', $minTs);

			foreach ($compares as $k=>$v) {
				$t = date('His', $v['ts']);

				while ($t > $m) {
					array_unshift($compares[$k]['a'], 'null');

					$t -= 60;
				}
			}
			$ts = $minTs;
		}

		// find max count for compares
		foreach ($compares as $v) {
			if (isset($_GET['test']) && $_GET['test'])
				echo "n $n count ". count($v['a']) ."\n";
			$n = max($n, $v['n']);
		}

		//if (isset($_GET['test']) && $_GET['test'])
		//	echo "n $n\n"; print_r($compares);
		$tot = count($compares);

		for ($i = 0; $i < $n;$i++) {
			$jsCompare .= "['". date('H:i', $ts + $i * 60) ."',";

			foreach ($compares as $k=>$v) {
				//if (isset($v['a'][$i]))
				if(isset($v['a'][$i])) $num = (int)$v['a'][$i];
				if (!$num) $num = "null";
				$jsCompare .= $num. ($k+1 < $tot ? ',':'');
			}

			$jsCompare.= "],\n";
		}
		$jsCompare .= "]";
		//$jsCompare .= "\n//$n,$tot";

		/*echo('<table class="table" id="visits"  cellspacing="0">'."\n");

		echo '<thead>';
		foreach ($counts as $r) {
			echo "<th scope=\"col\">". dt($r['ts']) ."</th>\n";
		}
		echo "</thead><tbody><tr>\n";
		foreach ($counts as $v) {
			echo '<td>'. $v['total'] .'</td>';
		}
		echo "</tbody></tr>\n";

		echo("</table>\n");
		 */
		echo '<div id="chart_div" style="height:530px;"></div>';

	}

} else if ($pgMode == 'man_wlist') {
	$ip= isset( $_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:"127.0.0.2" ;
?>
	<link href="css/whitelist.css?<?php echo rand()?>" rel="stylesheet" type="text/css">
<div class="page">
    <h1>
        Whitelist Manager
        <span class="badge">IP / SmartID</span>
    </h1>
    <div class="subtitle">
        View and edit the shared <code>items</code> whitelist used by the HbbTV app.
    </div>

    <div class="form-row">
        <input type="text" id="newItem" placeholder="Enter IP or SmartID…">
        <button class="btn btn-primary" id="addBtn">Add</button>
    </div>

    <div class="status" id="status"></div>
<ul class="message no-margin">
        <li>Your IP: <b><?php echo $ip;?></b></li>
</ul>

    <div class="top-actions">
        <span class="small">
            <span id="countLabel">0 items</span>
        </span>
        <button class="btn btn-ghost" id="refreshBtn">Refresh</button>
    </div>

    <div class="list-container">
        <table>
            <thead>
            <tr>
                <th style="width:70%">Item</th>
                <th style="width:30%">Actions</th>
            </tr>
            </thead>
            <tbody id="itemsBody">
            <!-- rows injected here -->
            </tbody>
        </table>
        <div class="empty-state" id="emptyState" style="display:none;">
            No items in whitelist yet.
        </div>
    </div>

</div>

<script>
    // Adjust this if the HTML is not in the same folder as whitelist.php
    var WHITELIST_URL = "whitelist.php";

    var statusEl = document.getElementById("status");
    var itemsBody = document.getElementById("itemsBody");
    var emptyStateEl = document.getElementById("emptyState");
    var countLabel = document.getElementById("countLabel");
    var addBtn = document.getElementById("addBtn");
    var refreshBtn = document.getElementById("refreshBtn");
    var newItemInput = document.getElementById("newItem");

    function setStatus(message, type) {
        statusEl.textContent = message || "";
        statusEl.className = "status";
        if (type === "error") statusEl.classList.add("error");
        if (type === "success") statusEl.classList.add("success");
    }

    function xhrRequest(method, url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (method === "POST") {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var json = null;
                try {
                    json = JSON.parse(xhr.responseText);
                } catch (e) {
                    // ignore parse errors
                }
                callback(xhr.status, json);
            }
        };
        xhr.send(data || null);
    }

    function renderItems(list) {
        itemsBody.innerHTML = "";
        if (!list || list.length === 0) {
            emptyStateEl.style.display = "block";
        } else {
            emptyStateEl.style.display = "none";
        }

        countLabel.textContent = list.length + (list.length === 1 ? " item" : " items");

        for (var i = 0; i < list.length; i++) {
            (function (item) {
                var tr = document.createElement("tr");

                var tdItem = document.createElement("td");
                tdItem.className = "item-cell";
                tdItem.textContent = item;

                var tdActions = document.createElement("td");
                var btn = document.createElement("button");
                btn.textContent = "Remove";
                btn.className = "btn btn-danger";
                btn.onclick = function () {
                    if (confirm("Remove this item from whitelist?\n\n" + item)) {
                        removeItem(item);
                    }
                };

                tdActions.appendChild(btn);
                tr.appendChild(tdItem);
                tr.appendChild(tdActions);
                itemsBody.appendChild(tr);
            })(list[i]);
        }
    }

    function loadWhitelist() {
        setStatus("Loading whitelist…");
        xhrRequest("GET", WHITELIST_URL + "?action=get", null, function (status, json) {
            if (status !== 200 || !json || !json.success) {
                setStatus("Failed to load whitelist.", "error");
                renderItems([]);
                return;
            }
            setStatus("Whitelist loaded.", "success");
            renderItems(json.items || []);
        });
    }

    function addItem() {
        var value = newItemInput.value.replace(/\s+/g, " ").trim();
        if (!value) {
            setStatus("Please enter an IP or SmartID.", "error");
            return;
        }

        addBtn.disabled = true;
        setStatus("Adding item…");

        var body = "action=add&item=" + encodeURIComponent(value);
        xhrRequest("POST", WHITELIST_URL, body, function (status, json) {
            addBtn.disabled = false;
            if (status !== 200 || !json || !json.success) {
                setStatus("Failed to add item.", "error");
                return;
            }
            newItemInput.value = "";
            setStatus("Item added.", "success");
            renderItems(json.items || []);
        });
    }

    function removeItem(item) {
        setStatus("Removing item…");

        var body = "action=remove&item=" + encodeURIComponent(item);
        xhrRequest("POST", WHITELIST_URL, body, function (status, json) {
            if (status !== 200 || !json || !json.success) {
                setStatus("Failed to remove item.", "error");
                return;
            }
            setStatus("Item removed.", "success");
            renderItems(json.items || []);
        });
    }

    // --- event bindings ---
    addBtn.onclick = addItem;
    refreshBtn.onclick = loadWhitelist;
    newItemInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            addItem();
        }
    });

    // initial load
    loadWhitelist();
</script>
<?php
} else if ($pgMode == 'mgr') {
	if (isset($msg)) echo '<p><b>'. $msg .'</b></p>';
?>
	<form action="index.php" class="form" method="post" enctype="multipart/form-data">
		<label for="myfile">Νέο κόκκινο κουμπί</label> <input type="file" id="myfile" name="filename">
		<input type="submit" value="Upload">
		<input type="hidden" name="action" value="upload">
		<input type="hidden" name="pgMode" value="mgr">
	</form>

</section>
<section class="grid_12"><div class="block-border">
	<div class="no-margin"><ul class="grid hbbtv grey-gradient no-margin">
<?php
	if (!count($buttons))
		echo '<li>Δεν βρέθηκαν κουμπιά</li>';
	foreach ($buttons as $row) {
		echo '<li>';
		echo '<div style="padding: 4px 0px">';
		if ($row['active'])
			echo '<img src="images/active.png" width="20">';
		else {
			echo '<a style="position: absolute;right: 50px" title="Ενεργό κουμπί" href="?pgMode=mgr&action=setb&id='. $row['id'] ."\" onclick=\"return confirm('Να γίνει ενεργό το κουμπί;')\">Ενεργό</a>";
			echo '<a style="float: right" title="Διαγραφή" href="?pgMode=mgr&action=delb&id='. $row['id'] ."\" onclick=\"return confirm('Διαγραφή του κουμπιού;')\"><img width=\"20\" src=\"images/del.png\"></a>";
		}
		echo '</div>';
		echo '<img src="../home/img/'. $row['filename'] .'" width="'. $row['w'] .'" height="'. $row['h'] .'"style="padding-top:3px;">';
		echo $row['w'] .'x'. $row['h'];
		echo ' '. ceil(filesize($btn_dir. $row['filename'])/1024) .' KB';
		echo ' '. $row['filename'];
		echo '</li>';
	}
?>
	</ul>
	</div>
	</div>
</section>

<?php
} else if ($pgMode == 'medias') {
	echo('<iframe id="banner" style="display: block; width: 100%; height:3000px; top: 0;right: 0; overflow-y: hidden;" scrolling="auto" src="//reppa-analytics.de/home/banner.php";></iframe>');


} else if ($pgMode == 'search') {
	echo '<form class="form" id="tab-search" method="post" action="" style="margin-bottom: 24px;">';
	echo '<fieldset class="grey-bg">';
	echo '<legend><a href="#">Options</a></legend>';
	echo '<div class="float-left gutter-right">';
	echo '<label for="search-start">Start</label>';
	echo '<span class="input-type-text"><input name="search-start" id="search-start" autocomplete="off" class="datepicker" type="text" value="'. $start .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="search-end">End</label>';
	echo '<span class="input-type-text"><input name="search-end" id="search-end" autocomplete="off" class="datepicker" type="text" value="'. $end .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="tvshow">TV Show</label>';
	echo '<input style="margin-top: 0.8%; width: 35em;" name="tvshow" id="tvshow" value="'. htmlspecialchars($tvshow) .'">';
	echo '</div>';

	echo '<input style="margin-top: 0.8%;" type="submit" class="button" value="Search">';
	echo '</fieldset>';
	echo '</form>';

	if (isset($items) && count($items)) {
?>
	<table class="table" width="100%" cellspacing="0">
	<thead>
		<tr>
			<th scope="col">Title</th>
			<th scope="col">Duration</th>
			<th scope="col">Smart TVs</th>
			<th scope="col">Smart TVs start</th>
			<th scope="col">Smart TVs end</th>
			<th scope="col">Viewers &gt; minute</th>
		</tr>
	</thead>
	<tbody>
<?php
	$totals = [];
	$totals['tit'] = '';
	$totals['dur'] = 0;
	$totals['vis'] = 0;
	$totals['stv'] = 0;
	$totals['env'] = 0;
	$totals['vie'] = 0;
	foreach ($items as $item) {
		$totals['tit'] = $item['title'];
		$totals['dur'] += $item['end']-$item['start'];
		$totals['vis'] += $item['cnt'];
		$totals['stv'] += $item['count_start'];
		$totals['env'] += $item['count_end'];
		$totals['vie'] += $item['vgt1'];
	}
	echo '<tr><td>'. $totals['tit'] .'</td><td>'. getDuration($totals['dur']) .'</td><td>'. fm($totals['vis']) .'</td><td>'. fm($totals['stv']) .'</td><td>'. fm($totals['env']) .'</td><td>'. fm($totals['vie']) .'</td></tr>';
?>
	</tbody>
	</table>

	<table id="stats-table" class="table" width="100%" cellspacing="0">
	<thead>
		<tr>
			<th scope="black-cell"></th>
			<th scope="col">Start</th>
			<th scope="col">Title</th>
			<th scope="col">End</th>
			<th scope="col">Duration</th>
			<th scope="col">Smart TVs</th>
			<th scope="col">Smart TVs start</th>
			<th scope="col">Smart TVs end</th>
			<th scope="col">Viewers &gt;1 minute</th>
			<th scope="col">Avg duration</th>
		</tr>
	</thead>
	<tbody>
<?php
	$k=0;
	foreach ($items as $row) {
		$cnt = $row['cnt'];

		echo ("<tr id=\"ts-". $row['start'] ."\">\n");

		echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
		echo ("<td>". date('d/m/Y H:i:s', $row['start']) ."</td>\n");

		echo ("<td>". $row['title']);

		if ($row['inf'])
			echo " ". $row['inf'];

		if ($row['customer'])
			echo " ". $row['customer'];
		$ctype = 0;
		if (preg_match('#Reppa#si', $row['customer'])) {
			$ctype = 2;
		} else if (preg_match('#Genius#si', $row['customer']))
			$ctype = 1;

		echo ("</td>\n");

		echo ("<td>". date('H:i:s', $row['end']) ."</td>\n");
		echo ("<td>". getDuration($row['duration']) ."</td>\n");
		$more = '';
		if ($row['duration'] > 100)
			$more = " - <a class=\"button\" href=\"showCols.php?from=". $row['start']. '&to='. $row['end']. "\" target=\"show-cols\">Stats</a>";
		if ($row['duration'] > 5 * 60 - 1)
			$more .= " - <a class=\"button red\" href=\"?pgMode=stats&start=". $row['start']. "\">Compare</a>";

		//if ($ctype && ($visitsReppa[$row['start']] || $visitsGenius[$row['start']])) {
		if ($ctype && $row['visited']) {
			//$n = ($ctype == 1 ? count($visitsGenius[$row['start']]) : count($visitsReppa[$row['start']]));
			$n = $row['visited'];
			if ($_GET['testips']) {
				if ($row['start'] == 1571777125) {
					print_r($visitsGenius[1571777125]);
				}
			}
			$ctype == 1 ? $geniusPageVisits += $n : $reppaPageVisits += $n;
			$more .= " - <a class=\"button\" href=\"matchIps.php?from=". $row['start']. '&to='. $row['end']. "&visitsTime=". $visitsTime ."\" target=\"show-ips\" style=\"background: #bbffbb;\">". $n ."</a>";
		}

		echo ("<td>". ($cnt > 1 ? "<a id=\"a-". $row['start'] ."\" onclick=\"showTm(". $row['start'] .", ". $row['end'] .", ". $ctype .", ". $visitsTime .") \" class=\"button\" href=\"javascript:void(0)\">". fm($cnt) ." smart TVs</a>". $more : '-'). "</td>\n");
		echo ("<td>". $row['count_start'] ."</td>\n");
		echo ("<td>". $row['count_end'] ."</td>\n");
		echo ("<td>". ($row['vgt1'] ? $row['vgt1'] .'&nbsp;&nbsp;'. percent($row['vgt1'], $row['cnt']) .'%' : '') ."</td>\n");
		echo ("<td>". ($row['vgt1'] ? getDuration($row['avg_duration']) : '') ."</td>\n");
		echo ("</tr>\n");
		++$k;
	}
	echo '</table>';
}
}
?>
				</div>

			</div></div>
		</section>
	</article>
	<div class="clear"></div>
<?php
if ($pgMode == 'home') {
	echo '<article class="container_12"> <section class="grid_12"> <div class="block-border"><div class="block-content"> <h1>Live</h1>';
	echo '<div id="live-content"></div>';
	echo '<div class="moni" id="chartdiv" style="margin-top: 10px;height:200px;display:none;"></div>';
	echo '</div></div> </section> </article>';
	echo '<div class="clear"></div>';
}
?>

	<script>
var chart, chartData=[];
function load() {
	//var channel = '<?php// echo $channel;?>';
	$('form input:checkbox').each(function(j, e) {
		$(e).click(function() {
			if (this.checked)
				$(this).parent().parent().addClass('selected');
			else
				$(this).parent().parent().removeClass('selected');
		});
	});
	if (pgMode == 'home') {
		prChart();
		chChart();
		var ltimer = setInterval(live, 1000);
		live();
	} else if (pgMode == 'mgr') {
		selCat($('#cat').val());
	}
	return;
	var timer = setInterval(relo, 5000);
	relo();
}
function chChart(){
	var obj=document.getElementById('chartdiv');
	if(obj.style.display=='none'){
		chshow=true;
		obj.style.display='block';
	}else{
		chshow=false;
		obj.style.display='none';
		lastdt="";
		lastcc=0;
		chartData=[];
		channel=[];
		finger=[];
	}
}
function prChart() {
	var nr=0;

	chart = AmCharts.makeChart("chartdiv", {
	type: "serial",
		"theme": "light",
		path: "amcharts/",
		dataProvider: chartData,
		categoryField: "date",
		"dataDateFormat": "YYYY-MM-DD HH:NN:SS",
		categoryAxis: {
		"minPeriod": "ss",
			parseDates: true,
			gridAlpha: 0.15,
			minorGridEnabled: true,
			axisColor: "#DADADA"
	},

		valueAxes: [{
		axisAlpha: 0.2,
			id: "v1",
			position: "right"
	}],
		graphs: [{
		"balloonText": "[[sd]]: [[fp]]",
			"fillAlphas": 1,
			"title": "daily",
			"type": "column",
			"valueField": "dur"
	}, {
	id: "g1",
		valueAxis: "v1",
		valueField: "visits",
		lineThickness: 2,
		type: "smoothedLine",
		lineColor: "blue",
		negativeLineColor: "#0352b5",
		balloonText: "[[category]]<br/><b><span style='font-size:14px;'>RW: [[value]]</span></b>"
	}],
		chartCursor: {
		"categoryBalloonDateFormat": "JJ:NN:SS",
			fullWidth:true,
			cursorAlpha:0.1
	},


		mouseWheelZoomEnabled:true
	});
	chart.addListener("dataUpdated", zoomChart);

	function zoomChart() {
		chart.zoomToIndexes(chartData.length - 100, chartData.length - 1);
	}

}
function live() {
	const http = new XMLHttpRequest();
	const url = 'live.php';
	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText), s = '';
			var dt = res[0].replace('Trigger: monitor : ', '');
			var dmy = dt.split(" ");
			var d   = dmy[0].split(".");
			var t   = dmy[1].split(":");
			var d = new Date(d[2], d[1] - 1, d[0], t[0], t[1], t[2] );

			s = dt +'<br>';
			var t = res[1].split('Verbindung:'), dt = res[0];
			var cc = t[1]
			var hoch = Math.round(cc*21.53439153);

			//s += 'Ενεργή σύνδεση: <b>'+ cc +'</b><br>';
			t = res[2].split(/[ :]/);
			console.log(t);

			var sn = t[1];

			s += 'Ενεργή σύνδεση: <b>'+ t[2] +'</b><br>';
			//s += 'Sender: '+ t[0] +': <b>'+ t[2] +'</b> '+ (t.length > 3 ? t[3] +': <b>'+ t[5] +'</b>' : '') +'<br>';
			var mt = res[3].split('Verbindung:');
			//s += 'Max συνδέσεις: '+ mt[1]+'<br>';
			var md = res[4].split(':');
			//s += 'Τρέχουσα ημέρα: '+ md[1]+'<br>';
			$('#live-content').html(s);

			chartData.push({
			date: d,
				visits: t[2],
				hoch: hoch
			});
			chart.validateData();
		}
	};
}

		jQuery.browser = {};
		(function () {
			    jQuery.browser.msie = false;
			    jQuery.browser.version = 0;
			    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
				    jQuery.browser.msie = true;
				    jQuery.browser.version = RegExp.$1;
			    }
		})();

$(document).ready(function() {
	$('#get_visits_range').click(function() {
		var sdt = $('#visits_start_dt').val(),
		 edt = $('#visits_end_dt').val(),
		 st = $('#visits_start_time').val(),
		 du = $('#visits_duration').val(),
		 cst = $('#visits_start_time_txt').val(),
		 cet = $('#visits_end_time_txt').val(),
		 et = $('#visits_end_time').val();

		if (!sdt || !edt) {
			alert('Please select dates');
			return;
		}

		const http = new XMLHttpRequest();
		const url = 'getVisits.php?sdt='+ sdt +'&edt='+ edt +'&st='+ encodeURI(st) +'&et='+ encodeURI(et) +'&du='+ du +'&cst='+ cst +'&cet='+ cet;

		$('#get_visits_range').addClass('loading');

		http.open("GET", url);
		http.send();
		http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var res = JSON.parse(http.responseText);
				$('#get_visits_range').removeClass('loading');

				if (!res) {
					alert('json failed');
					return;
				} else if (res.error) {
					alert(res.error);
					return;
				} else {
					console.log(res);
					var t = parseInt(res.total), s = '';
					if (t > 999) {
						t = t / 1000;
						s = t.toFixed(3);
					} else
						s = t;

					$('#visits_result').html('<b>'+ s + "</b> visits found");
				}
			}
		}
	});
	/*
	 * Datepicker
	 * Thanks to sbkyle! http://themeforest.net/user/sbkyle
	 */
	$('.datepicker').datepick({
<?php
if (isset($customdt) && $customdt)
	echo "defaultDate: '". date('d-m-Y', strtotime($customdt)) ."',\n";
?>
        	dateFormat: 'dd-mm-yyyy',
		alignment: 'bottom',
		showOtherMonths: true,
		selectOtherMonths: true,
		onSelect: function () {
			if (this.name == "custom-dt") {
				this.form.submit();
			}
		},
		renderer: {
			picker: '<div class="datepick block-border clearfix form"><div class="mini-calendar clearfix">' +
					'{months}</div></div>',
			monthRow: '{months}', 
			month: '<div class="calendar-controls" style="white-space: nowrap">' +
						'{monthHeader:M yyyy}' +
					'</div>' +
					'<table cellspacing="0">' +
						'<thead>{weekHeader}</thead>' +
						'<tbody>{weeks}</tbody></table>', 
			weekHeader: '<tr>{days}</tr>', 
			dayHeader: '<th>{day}</th>', 
			week: '<tr>{days}</tr>', 
			day: '<td>{day}</td>', 
			monthSelector: '.month', 
			daySelector: 'td', 
			rtlClass: 'rtl', 
			multiClass: 'multi', 
			defaultClass: 'default', 
			selectedClass: 'selected', 
			highlightedClass: 'highlight', 
			todayClass: 'today', 
			otherMonthClass: 'other-month', 
			weekendClass: 'week-end', 
			commandClass: 'calendar', 
			commandLinkClass: 'button',
			disabledClass: 'unavailable'
		}
	});

});
function drawCharts() {
<?php
if (isset($jsCompare) && $jsCompare)
	echo "showCompare();\n";

if (isset($jsStart) && $jsStart)
	echo "showSponsorGraphs();\n";
?>
}

function showSponsorGraphs() {
	var w = $(window).width() - 200, h = $(window).height() / 2;

	var dataStart = new google.visualization.arrayToDataTable(<?php echo isset($jsStart)?$jsStart:""; ?>);
	var dataEnd = new google.visualization.arrayToDataTable(<?php echo isset($jsEnd)?:""; ?>);
	var dataIps = new google.visualization.arrayToDataTable(<?php echo isset($jsIps)?:""; ?>);

	ch1 = new google.visualization.ChartWrapper();
	ch2 = new google.visualization.ChartWrapper();
	ch3 = new google.visualization.ChartWrapper();

	ch1.setContainerId('chart_start');
	ch1.setChartType('LineChart');
	ch1.setDataTable(dataStart);
	ch1.setOptions({
		title: 'Visits start',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	ch1.draw();

	ch2.setContainerId('chart_end');
	ch2.setChartType('LineChart');
	ch2.setDataTable(dataEnd);
	ch2.setOptions({
		title: 'Visits end',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	ch2.draw();

	ch3.setContainerId('chart_ips');
	ch3.setChartType('LineChart');
	ch3.setDataTable(dataIps);
	ch3.setOptions({
		title: 'Page Visits',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	ch3.draw();
}

function showCompare() {
	var w = $(window).width() - 200, h = $(window).height() / 2;

	var data = new google.visualization.arrayToDataTable(<?php echo isset($jsCompare)?$jsCompare:"";?>);

	googleChart = new google.visualization.ChartWrapper();

	googleChart.setContainerId('chart_div');
	googleChart.setChartType('LineChart');
	googleChart.setDataTable(data);
	googleChart.setOptions({
		title: 'TV Show viewers comparisation per day',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	googleChart.draw();
}

	</script>

	<script src="js/jquery_006.js"></script>
	<!-- Template libs -->
	<script src="js/jquery_003.js"></script>
	<!--<script src="js/searchField.js"></script>-->
	<script src="js/common.js"></script>
	<script src="js/standard.js"></script>

	<script src="js/jquery_002.js"></script>
	<script src="js/jquery_004.js"></script>
	<script src="js/jquery.js"></script>
	
	<!-- Custom styles lib -->
	<script src="js/list.js"></script>
	
	<!-- Plugins -->
	<script src="js/jquery_007.js"></script>
	<script src="js/jquery_005.js"></script>
	
	<!-- Charts library -->
	<!--Load the AJAX API-->
	<script src="js/jsapi.js"></script>
<script>
// Load the Visualization API and the piechart package.
//google.load('visualization', '1', {'packages':['corechart']});
google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawCharts);
</script>

	<footer>
		<div class="float-right">
			<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>
		</div>
		
	</footer>
<?php
if (isset($_GET['log']) && $_GET['log'])
	echo $log;
?>
</body>
</html>
