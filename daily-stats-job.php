<?php
// get daily videos and calc duration and save to db (vid_stats)
include('/var/www/html/cretetv/stats/config.php');
define('STATE_PLAYING', 1);
define('STATE_STOP', 0);
define('STATE_PAUSE', 2);
define('STATE_CONNECTING', 3);
define('STATE_BUFFERING', 4);
define('STATE_FINISHED', 5);
define('STATE_ERROR', 6);
$states = ['stop','play','pause','connect','buffer','finish','error'];

$test=0;
$ts = time()-86400* 1;
//$ts = time();
$dt = date('Ymd', $ts);
//$dt = 20220823; $ts = strtotime($dt);
echo "--- date $dt ---\n";

$mysqli->query("DELETE FROM vid_stats WHERE dt = ". $dt);
$mysqli->query("DELETE FROM vid_stats_hour WHERE dt = ". $dt);

$cond = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 23:59:59')";
//$cond .= ' AND smid = 2255359';

$q = "SELECT smid, vid, ts, state FROM vid_actions WHERE $cond ORDER BY id";
echo $q;
$res = $mysqli->query($q);
if ($mysqli->error) {
	echo 'SQL error: '. $mysqli->error ."\n";
}
$lastid = 0;$lastvid = 0;$lastts = 0;$duration = 0;$tid = 0;
$started = false;
$smids = [];
while ($row = $res->fetch_assoc()) {
	$smid = $row['smid'];
	$vid = $row['vid'];
	$ts = $row['ts'];
	$state = $row['state'];
	echo "vid $vid smid $smid state ". $states[$state] ."\n";

	if (!isset($smids[$smid]))
		$smids[$smid] = [];

	if ($state == STATE_STOP || $state == STATE_FINISHED) {
		if (@$smids[$smid]['started']) {
			$smids[$smid]['duration'] += ($ts - $smids[$smid]['lastts']);
			//echo "smid $smid d2 $duration\n";
			$smids[$smid]['lastts'] = $ts;
			$smids[$smid]['started'] = false;
			//print_r($smids[$smid]);
			if ($smids[$smid]['duration'] > 0) {
				addVideo();

				initSmid($smid, $vid);
			}
		}
	} else if ($state == STATE_CONNECTING) {
		// case smid viewed another video but no state stop/finished exist
		if (isset($smids[$smid]) && isset($smids[$smid]['lastvid']) && $vid != $smids[$smid]['lastvid'] && $smids[$smid]['duration'] > 0)
			addVideo();

		initSmid($smid, $vid);
		echo "new video $vid smid $smid\n";
	} else if ($state == STATE_PLAYING) {
		if (@$smids[$smid]['started']) {
			$smids[$smid]['duration'] += ($ts - $smids[$smid]['lastts']);
			echo "smid $smid d " .$smids[$smid]['duration'] ."\n";
		} else
			$smids[$smid]['duration'] = 0;
		$smids[$smid]['lastts'] = $ts;
		$smids[$smid]['started'] = true;
	} else if ($state == STATE_PAUSE || $state == STATE_BUFFERING || $state == STATE_STOP || $state == STATE_FINISHED) {
		echo "vid $vid smid $smid state ". $states[$state] ."\n";
		if (@$smids[$smid]['started'] && !isset($smids[$smid]['lastts'])) {
			$smids[$smid]['duration'] += ($ts - $smids[$smid]['lastts']);
			//echo "smid $smid d2 $duration\n";
			$smids[$smid]['lastts'] = $ts;
			$smids[$smid]['started'] = false;
		}
	}
}
//print_r($smids);
foreach ($smids as $smid=>$v) {
	if (!isset($v['duration'])) {
		continue;
	}
	if ($v['duration'] && !@$v['done'] && isset($v['lastvid']))
		addVideo();
}
// add last one
function addVideo() {
	global $mysqli, $row, $smids, $test, $dt, $ts, $lastvid, $lastid, $smid, $vid;
	$lastvid = $vid;
	if (isset($smids[$smid]['lastvid']))
		$lastvid = $smids[$smid]['lastvid'];
	$duration = $smids[$smid]['duration'];
	$smids[$smid]['done'] = 1;

	echo "add video $lastvid smid $smid duration $duration\n";
	$tid = 0; $eid = 0; $cid = 0; $tit = ''; $epi = '';
	$nres = $mysqli->query("SELECT title, episode FROM videos WHERE id = ". $lastvid);
	echo $mysqli->error;
	if ($row = $nres->fetch_assoc()) {
		$tid = $row['title'];
		$eid = (int)$row['episode'];
	}
	$nres = $mysqli->query("SELECT title, category FROM titles WHERE id = ". $tid);
	if ($row = $nres->fetch_assoc()) {
		$tit = mysqli_escape_string($mysqli, $row['title']);
		$cid = $row['category'];
	}
	if ($eid) {
		$nres = $mysqli->query("SELECT title FROM episodes WHERE id = ". $eid);
		if ($row = $nres->fetch_assoc())
			$epi = mysqli_escape_string($mysqli, $row['title']);
	}

	if ($duration < 0)
		$duration =0;
	$q = "INSERT INTO vid_stats SET smid = $smid, title = '". $tit ."', episode = '". $epi ."', vid = '$lastvid', dt = $dt, duration = $duration, tid = $tid, eid = $eid, cid = $cid, movie=0";
	if (!$test)
		$rs = $mysqli->query($q);
	//else echo "$q\n";

	if ($mysqli->error) {
		echo "$q\n";
		echo $mysqli->error;
		exit;
	}

	$hour = date('H', $ts);
	echo date('r', $ts)."\n";
	$q = "INSERT INTO vid_stats_hour SET hour = $hour, dt = $dt, vid = $lastvid, cnt = 1 ON DUPLICATE KEY UPDATE cnt=cnt+1";
	echo "$q\n";
	if (!$test)
		$rs = $mysqli->query($q);
	echo $mysqli->error;
}
function initSmid($smid, $vid) {
	global $smids;
	$smids[$smid]['lastvid'] = $vid;
	$smids[$smid]['lastts'] = 0;
	$smids[$smid]['done'] = 0;
	$smids[$smid]['duration'] = 0;
	$smids[$smid]['started'] = false;
}
