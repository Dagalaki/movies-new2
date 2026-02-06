<?php
require_once('config.php');
$a = (array)@json_decode(file_get_contents('../plugins/Intl/lang/tl.json'));
$countries = (array)$a['Intl'];

$id = $_GET['id'];
//$fromTs = (int)$_GET['ts'];
//if (!$fromTs)
	$fromTs = time() - 86400 *90;

if (!$id)
	die('Missing id');

$total = 0;

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

$program = []; $visits = []; $a = []; $info = []; $smartId = 0;

//$res = $mysqli->query("SELECT info FROM durations_n WHERE id = '". $id ."' AND ts > ". $fromTs ." LIMIT 1");
$res = $mysqli->query("SELECT info FROM infos WHERE id = '". $id ."'");
if ($mysqli->error) {
	echo "Error: ". $mysqli->error."\n";
}

if ($row = $res->fetch_assoc())
	$info = (array)@json_decode($row['info']);

$ckey = strtolower(str_replace('Country_', '', array_search($info['country'], $countries)));

//echo("SELECT intime, outtime, smartid FROM redbutton.access_archiv WHERE smartid = '". $id ."' AND intime > ". $fromTs ." ORDER BY intime DESC");
$addq = "channel = 'besttv' AND ";
$res = $mysqli->query("SELECT intime, outtime, smartid FROM redbutton.access_archiv WHERE $addq smartid = '". $id ."' AND intime > ". $fromTs ." ORDER BY intime DESC");
while ($row = $res->fetch_assoc()) {
	$dt = date('Ymd', $row['intime']);
	$a[] = $row['intime'];

	if (!$smartId)
		$smartId = $row['id'];
	if (!$visits[$dt])
		$visits[$dt] = [];
	$visits[$dt][] = $row;
}
// show also 3 motnhs visits:
/*
$vts = 0;
for ($i = 1; $i < 4; $i++) {
        $pm = new DateTime();
        $pm->sub(new DateInterval('P'. $i .'M'));
        $ts = $pm->getTimestamp();
	$vts = $ts;
        $table = "durations_". date('mY', $ts);

        $res = $mysqli->query("SELECT intime, outtime FROM ". $table ." WHERE id = '". $id ."' ORDER BY intime DESC");
        if ($mysqli->error)
                break;

        while ($row = $res->fetch_assoc()) {
                $dt = date('Ymd', $row['intime']);
                $a[] = $row['intime'];

                if (!$visits[$dt])
                        $visits[$dt] = [];
                $visits[$dt][] = $row;
        }
}
 */

$shows = []; $sinfo = []; $tss = [];
/*
$res = $mysqli->query("SELECT ts, COUNT(*) AS cnt FROM viewers WHERE id = '". $id ."' GROUP BY hash ORDER BY cnt DESC LIMIT 200");
while ($row = $res->fetch_assoc()) {
	$tss[] = $row['ts'];
	$shows[] = $row;
}
*/

if (count($tss)) {
	$res = $mysqli->query("SELECT title, start, end, duration, customer FROM program WHERE duration > 5 * 60 -1 AND start IN (". implode(",", $tss) .")");
	echo $mysqli->error;
	while ($row = $res->fetch_assoc()) {
		$sinfo[$row['start']] = $row;
	}
}

//print_r($visits);exit;
if (count($a)) {
	sort($a);

	$sts = $a[0];
	$ets = $a[count($a)-1];
}

$cond = " dt BETWEEN ". date('Ymd', $sts);
$cond .= " AND ". date('Ymd', $ets);
//echo("SELECT * FROM program WHERE ". $cond);

$res = $mysqli->query("SELECT * FROM program WHERE ". $cond);

while ($row = $res->fetch_assoc()) {
	$program[$row['start']] = $row;
}
// build visits inside program
foreach ($visits as $dt => $st) {
	foreach ($st as $k => $v) {
		$ts = $v['intime'];
		$end = $v['outtime'];

		foreach ($program as $p) {
			if (($p['start'] >= $ts && $p['start'] <= $end) ||
			    ($p['end'] >= $ts && $p['end'] <= $end) ||
			    ($ts >= $p['start'] && $ts <= $p['end']) ||
			    ($end >= $p['start'] && $end <= $p['end'])
		       	) {
				//if (!$v['program'])
					//$visits[$dt][$k]['program'] = [];
				$visits[$dt][$k]['program'][] = $p;
			}
		}
	}
}
//print_r($visits);exit;
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
	<link href="css/planning.css" rel="stylesheet" type="text/css">
	<link href="css/table.css" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">
	
	<!-- Favicon -->
	<link rel="shortcut icon" type="image/x-icon" href="https://www.media-theia.de/images/favicon/favicon.ico">
	<link rel="icon" type="image/png" href="https://www.media-theia.de/images/favicon/favicon-large.png">
	<script src="js/libs/jquery-1.11.3.min.js"></script>
<style>
	.planning ul li {
		height: 2em;
		line-height: 2em;
		vertical-align: bottom;
	}
.visitorDetails td {
padding: 8px;
font-size: 12px !important;
}
.visitorDetails img {
    box-sizing: border-box;
    margin-left: 0;
border: 1px solid lightgray;
height: 16px;
}
.visit-head {
float: left;
}
</style>
</head>
<body>

<article class="container_12">
        <ul class="controls-buttons" style="float: left;">
                <li><a href="javascript:history.back()"><img src="images/navigation-180.png" width="16" height="16"> Back</a></li>
        </ul>

<section class="grid_12" id="show-profile">
<div class="block-border">
<div class="block-content" id="profile">
	<h1>Viewer Profile</h1>

	<div class="header">
		<div class="visit-head">
			<img src="images/Profile.png" width="48" height="48" alt="profile">
			<div class="visitor-profile-id"><strong>ID: <?php echo $id?></strong></div>
			<br />
			<?php if ($smartId) echo '<div class="visitor-profile-id"><strong>Smart ID: '. $smartId .'</strong></div>';?>
		</div>

	<div class="visitorDetails">
		<table>
		<tbody>
<?php
		echo '<tr>';
		echo '<th>Operating System</th><td>'. $info['os'] .' '. $info['os_v'] .'</td>';
		echo '<th>Device Brand</th><td>'. $info['brand'] .'</td>';

		echo '</tr><tr>';
		echo '<th>Device model</th><td>'. $info['model'] .'</td>';
		echo '<th>Browser</th><td>'. $info['br'] .' '. $info['br_v'] . ($info['br_e'] ? ' (engine '. $info['br_e'] .')' : '') .'</td>';
		echo '<tr><th colspan="2">Agent</th><td style="white-space: normal;" colspan="2">'. $info['agent'] .'</td></tr>';
		echo '<tr><th colspan="2">Provider</th><td colspan="2">'. $info['provider'] .'</td></tr>';

		echo '</tr>';
?>
		</tbody>
		</table>
	</div>
	</div>
</div>
</div>
</section>

<!--
<section class="grid_12" id="show-smart-ids">
<div class="block-border">
<div class="block-content">

	<h1>Most viewed shows</h1>
	<table class="table planning" width="100%" cellspacing="0">
	<tr><th></th><th>Show</th><th>Customer</th><th>Time</th><th>Duration</th><th>Views</th></tr>
<?php
		$k = 0;
		foreach ($shows as $row) {
			$show = $sinfo[$row['ts']];
			echo '<tr>';
			echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
			echo ("<td><span title=". $row['hash'] .">". ($show ? $show['title'] : $row['ts']) .'</span></td>');
			echo ("<td>". $show['customer'] .'</td>');
			echo ("<td>". date('H:i:s', $show['start']) .' - '. date('H:i:s', $show['end']) .'</td>');
			echo ("<td>". getDuration($show['duration']) .'</td>');
			echo ("<td>". $row['cnt'] .'</td>');

			echo ("</tr>\n");
			$k++;

			if ($k == 30) {
				echo '<tbody id="shows-more" style="display: none;">';
			}
		}
		if ($k > 30) {
			echo '</tbody>';
			echo '<tr><td colspan="6"><a href="javascript:void(0)" onclick="$(\'#shows-more\').show();$(this).hide()">View '. ($k - 30) .' more shows</a></td></tr>';
		}

?>
	</table>
<ul class="message no-margin">
	<li>Shows that viewer viewed at least of <strong>90%</strong> of the show</li>
</ul>
</div>
</div>
</section>
-->

<section class="grid_12" id="show-smart-ids">
<div class="block-border">
<div class="block-content">
<?php

echo('<h1>Visits (from '. date('01/m/Y', $vts) .')</h1>'."\n");

echo('<table class="table planning" width="100%" cellspacing="0">'."\n");

$fullFormat = 'd M H:i:s';
$format = 'H:i:s';
$i = 1; $addTboody = false;
if (!count($a))
	echo '<p>No visits found</p>';
else
foreach ($visits as $dt => $a) {
	$ts = strtotime($dt);

	echo '<tr><th style="text-align: center; background: #fff;" colspan="4"><h3>'. date('d M Y', $ts) ."</h3></th></tr>\n";
	echo '<tr><th></th><th>Visit</th><th colspan="2">Program</th></tr>';
	$lastPts = 0;

	foreach ($a as $v) {
		$end = $v['outtime'];
		$duration = $v['outtime'] - $v['intime'];
		$rs = '';
		if (count($v['program']))
			$rs = ' rowspan="'. count($v['program']) .'"';

		echo '<tr><th scope="row" class="table-check-cell"'. $rs .'>'. $i .'</th>';
		$f = $format;
		if (date('d', $v['intime']) != date('d', $end))
			$f = $fullFormat;

		if (!$duration) {
			$duration = 10;
			$end += 10;
		}
		$add = ' Duration:'.  getDuration($duration);

		echo '<td'. $rs .'>'. date($f, $v['intime']) .($duration ? ' - ' . date($f, $end) : ''). $add .'</td>';
		if (count($v['program'])) {
			if ($lastPts && $lastPts == $v['program'][0]['start'] && count($v['program']) == 1)
				echo '<td colspan="2">&gg;</td>';
			else {
				foreach ($v['program'] as $k=>$p) {
					if ($k)
						echo '<tr>';
					if (!$lastPts || $lastPts != $p['start']) {
						echo '<td>'. $p['title'] .' '. $p['inf'] .' '. $p['customer'] .'</td><td>'. date('H:i:s', $p['start']). ' - ' .date('H:i:s', $p['end']) .'</td>';
					}
					$lastPts = $p['start'];
					if ($k)
						echo '</tr>';
				}
			}
		}
		$i++;
		if ($i == 40) {
			$addTboody = true;
		}
		echo "</tr>\n";
	}
	echo "</tr>\n";

	if ($addTboody) {
		echo '<tbody id="program-more" style="display: none;">';
		$addTboody = false;
	}
}
if ($i > 40) {
	echo '</tbody>';
	echo '<tr><td colspan="2"><a href="javascript:void(0)" onclick="$(\'#program-more\').show();$(this).hide()">View '. ($i - 40) .' more visits</a></td></tr>';
}

echo("</table>\n");
?>

</div>
</div>
</section>
</article>
</body>
	<footer>
		<div class="float-right">
			<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>
		</div>
		
	</footer>
</html>
