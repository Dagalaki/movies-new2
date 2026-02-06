<?php
// get daily videos and calc duration and save to db (vid_stats)
include('/var/www/html/cretetv/stats/config.php');
include('/var/www/html/cretetv/stats/pi.inc');
$conn = $mysqli;
$actions = ['home'];

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$start = (isset($_GET['start']) ? $_GET['start'] : date('Ymd', time()-86400*14));
//$end = (isset($_GET['end']) ? $_GET['end'] : date('Ymd', time()-86400));
$end = (isset($_GET['end']) ? $_GET['end'] : date('Ymd', time()));
$action = (isset($_GET['action']) ? $_GET['action'] : $actions[0]);
$page = (isset($_GET['page']) ? $_GET['page'] : 1); $perPage = 10;
//$action = 'viewsperdaytime';
$cond = " dt BETWEEN $start AND $end";
$out = [];
//$action = 'episodeanalysis';

if ($action == 'home') {
	$out['totals'] = getTotals($cond);
	$days = [];

	$q = "SELECT dt, COUNT(DISTINCT smid) AS devices FROM vid_stats WHERE $cond GROUP BY dt";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$days[] = $row;
	}
	$out['days'] = $days;
	$gr = []; $ts = ymdToTimestamp($start); $ets = ymdToTimestamp($end);
	$ets+=1800;
	while ($ts < $ets) {
		$a=[];
		$a['dt'] = date('Ymd', $ts);
		$a['cnt'] = getGreen(date('Y-m-d', $ts));
		$gr[]=$a;
		$ts+=86400;
	}
	$out['green'] = $gr;
} else if ($action == 'generalvod') {
	$out['totals'] = getTotals($cond);
	$duration = []; $views = []; $avgdur = []; $devices = [];

	$q = "SELECT dt, SUM(duration) AS duration FROM vid_stats WHERE $cond GROUP BY dt";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$duration[] = $row;
	}
	$out['duration'] = $duration;

	$q = "SELECT dt, COUNT(id) AS views FROM vid_stats WHERE $cond GROUP BY dt";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$views[] = $row;
	}
	$out['views'] = $views;

	$q = "SELECT dt, SUM(duration) AS duration, COUNT(id) AS views FROM vid_stats WHERE $cond GROUP BY dt";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$r = [];
		$dur = $row['duration'];
		$cnt = $row['views'];

		$r['dt'] = $row['dt'];
		$r['avg'] = $dur/$cnt;
		$avgdur[] = $r;
	}
	$out['avgdur'] = $avgdur;

	$q = "SELECT dt, COUNT(DISTINCT smid) AS devices FROM vid_stats WHERE $cond GROUP BY dt";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$devices[] = $row;
	}
	$out['devices'] = $devices;
} else if ($action == 'viewsperdaytime') {
	$duration = []; $views = []; $avgdur = []; $devices = []; $vids = [];
	$titleIds = @$_GET['titleIds'];
	$episodeIds = @$_GET['episodeIds'];

	if ($titleIds || $episodeIds) {
		$cond = '';
		if ($titleIds)
			$cond = " title IN(". implode(',', explode(',', $titleIds)) .")";
		if ($episodeIds)
			$cond .= ($cond ? ' AND ':''). " episode IN(". implode(',', explode(',', $episodeIds)) .")";

		$q = "SELECT id FROM videos WHERE ". $cond;
		$res = $conn->query($q);
		if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

		while ($row = $res->fetch_assoc()) {
			$vids[] = $row['id'];
		}
	}

	$cond = '1';
	if (($title || $episode) && !count($vids))
		$views = [];
	else {
		if (count($vids))
			$cond = " vid IN (". implode(',', $vids) .')';
		$q = "SELECT dt, hour, SUM(cnt) AS cnt FROM vid_stats_hour WHERE dt BETWEEN ". $start ." AND ". $end ." AND ". $cond ." GROUP BY dt,hour";
		//echo $q;exit;
		$res = $conn->query($q);
		if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

		$lastdt = 0; $days = []; $hours = [];
		while ($row = $res->fetch_assoc()) {
			$dt = $row['dt'];
			$hour = $row['hour'];
			$cnt = $row['cnt'];

			if ($lastdt && $lastdt != $dt) {
				$r = [];
				$r['day'] = date('D', strtotime($lastdt));
				$r['hours'] = $hours;
				$days[] = $r;
				$hours = [];
			}
			$r = [];
			$r['hour'] = $hour;
			$r['views'] = $cnt;
			$hours[] = $r;

			$lastdt = $dt;
		}
		if ($lastdt) {
			$r = [];
			$r['day'] = date('D', strtotime($lastdt));
			$r['hours'] = $hours;
			$days[] = $r;
		}
		$ar = [];
		foreach ($days as $k=>$day) {
			foreach($day['hours'] as $hour) {
				$h = $hour['hour'];
				if (!isset($ar[$h]))
					$ar[$h] = [];
				$ar[$h][$day['day']] = $hour['views'];
			}
		}
		//print_r($days);print_r($ar);exit;
		$out[] = $ar;
	}
} else if ($action == 'episodestats') {
	$titles = []; $vids = [];
	$titleIds = @$_GET['titleIds'];
	$order = @$_GET['order'];
	if (!strlen($order))
		$order = 'views DESC';
	if ($page == 'all')
		$limit = 1000;
	else
		$limit = ($page-1) * $perPage .", ". $perPage;
	if (!strlen($order))
		$order = ' title';

	if ($titleIds) {
		$cond = '';
		if ($titleIds)
			$cond .= " title IN(". implode(',', explode(',', $titleIds)) .")";

		$q = "SELECT id FROM videos WHERE ". $cond;
		$res = $conn->query($q);
		if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

		while ($row = $res->fetch_assoc()) {
			$vids[] = $row['id'];
		}
	}

	$cond = '1';
	if ($titleIds && !count($vids))
		$titles = [];
	else {
		if (count($vids))
			$cond = " vid IN (". implode(',', $vids) .')';

		$i = 0;
		if ((int)$page)
			$i = ($page-1)*$perPage + 1;
		$q = "SELECT SQL_CALC_FOUND_ROWS title, episode, vid, COUNT(DISTINCT smid) as devices, COUNT(id) AS views, SUM(duration) AS duration, SUM(duration)/COUNT(id) AS avg_duration, COUNT(id)/COUNT(DISTINCT smid) AS viewsperdev, cid FROM vid_stats$rokuadd WHERE title != '' AND dt BETWEEN ". $start ." AND ". $end ." AND ". $cond ." GROUP BY vid ORDER BY ". $order ." LIMIT ". $limit;
		$res = $conn->query($q);
		if ($conn->error) echo 'SQL error: '. $conn->error ."\n";
		while ($row = $res->fetch_assoc()) {
			$row['i'] = $i;
			$titles[] = $row;
			$i++;
		}
		$res = $conn->query('SELECT FOUND_ROWS()');
		if ($row = $res->fetch_row())
			$out['total'] = $row[0];
	}
	$out['page'] = $page;
	$out['titles'] = $titles;
	//print_r($out);exit;
} else if ($action == 'programstats') {
	$vods = [];
	$titleIds = @$_GET['titleIds'];
	$cond = '1';

	if ($titleIds) {
		$cond = '';
		if ($titleIds)
			$cond = " tid IN(". implode(',', explode(',', $titleIds)) .")";
	}

	$tids = [];
	$q = "SELECT title, tid, COUNT(DISTINCT smid) AS devices, COUNT(id) AS views, SUM(duration) AS duration, cid FROM vid_stats$rokuadd WHERE dt BETWEEN ". $start ." AND ". $end ." AND ". $cond ." GROUP BY tid ORDER BY views DESC";
	if (isset($_GET['test'])) {
		echo $q;exit;
	}
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	$lastdt = 0; $days = []; $hours = [];
	while ($row = $res->fetch_assoc()) {
		$devices = $row['devices'];
		$duration = $row['duration'];
		$views = $row['views'];

		$row['avg_duration'] = $duration/$views;
		$row['views_per_device'] = $views/$devices;

		$vods[] = $row;
	}
	$out['vods'] = $vods;
} else if ($action == 'red') {
	$red = [];

	$q = "SELECT dt, cnt FROM red WHERE $cond";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$red[] = $row;
	}
	$out['red'] = $red;
} else if ($action == 'episodeanalysis') {
	$vods = []; $dates = [];
	$titleIds = @$_GET['titleIds'];
	$cond = '1';

	if ($titleIds) {
		$cond = '';
		if ($titleIds)
			$cond = " tid IN(". implode(',', explode(',', $titleIds)) .")";
	}

	$tids = [];
	$q = "SELECT title, episode, eid, COUNT(DISTINCT smid) AS devices, COUNT(id) AS views, SUM(duration)/COUNT(id) AS avg_duration, COUNT(id)/COUNT(DISTINCT smid) AS viewsperdev FROM vid_stats WHERE episode != '' AND dt BETWEEN ". $start ." AND ". $end ." AND ". $cond ." GROUP BY eid ORDER BY views DESC";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	$lastdt = 0; $days = []; $hours = [];
	while ($row = $res->fetch_assoc()) {
		$vods[] = $row;
	}

	$q = "SELECT dt, COUNT(DISTINCT smid) AS devices, SUM(duration)/COUNT(id) AS avg_duration FROM vid_stats WHERE episode != '' AND dt BETWEEN ". $start ." AND ". $end ." AND ". $cond ." GROUP BY dt";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	$lastdt = 0; $days = []; $hours = [];
	while ($row = $res->fetch_assoc()) {
		$dates[] = $row;
	}
	$out['vods'] = $vods;
	$out['dates'] = $dates;
	//print_r($dates);exit;
} else if ($action == '5secDuration') {
	$views = [];

	$q = "SELECT dt, COUNT(id) AS views FROM vid_stats WHERE $cond AND duration < 5 GROUP BY dt";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$views[] = $row;
	}
	$out['views'] = $views;
} else if ($action == 'perDuration') {
	$views = [];
	for ($i = 0;$i < 50; $i++) {
		$r = [];
		$r['duration'] = $i;
		$r['views'] = 0;
		$views[] = $r;
	}

	$q = "SELECT duration, COUNT(id) AS views FROM vid_stats WHERE $cond AND duration <= 3000 GROUP BY duration";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$duration = $row['duration'];

		foreach ($views as $k=>$r) {
			if ($duration >= $r['duration'] * 60 && $duration < ($r['duration']+1) * 60) {
				$views[$k]['views'] += $row['views'];
				break;
			}
		}
	}
	$q = "SELECT COUNT(id) AS views FROM vid_stats WHERE $cond AND duration > 3000";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	if ($row = $res->fetch_assoc()) {
		$r=[];
		$r['duration'] = 50;
		$r['views'] = (int)$row['views'];
		$views[] = $r;
	}
	$out['views'] = $views;
} else if ($action == 'gettitles') {
	$titles = [];

	$q = "SELECT id, title FROM titles";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$titles[] = $row;
	}
	$out['titles'] = $titles;
} else if ($action == 'top10programs') {
	$viewsperdev = []; $views = []; $avgdur = []; $devices = [];

	// -- devices
	$q = "SELECT title, tid, COUNT(DISTINCT smid) AS devices FROM vid_stats WHERE $cond GROUP BY tid ORDER BY devices DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$devices[] = $row;
	}
	// -- avg duration
	$q = "SELECT title, tid, COUNT(id) AS views, SUM(duration) AS duration, SUM(duration)/COUNT(id) AS avg_duration FROM vid_stats WHERE $cond GROUP BY tid ORDER BY avg_duration DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$avgdur[] = $row;
	}

	// -- views
	$q = "SELECT title, tid, COUNT(id) AS views FROM vid_stats WHERE $cond GROUP BY tid ORDER BY views DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$views[] = $row;
	}

	// -- viewsperdev
	$q = "SELECT title, tid, COUNT(id)/COUNT(DISTINCT smid) AS viewsperdev FROM vid_stats WHERE $cond GROUP BY tid ORDER BY viewsperdev DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$viewsperdev[] = $row;
	}

	$out['views'] = $views;
	$out['viewsperdev'] = $viewsperdev;
	//print_r($out);exit;
	$out['avgdur'] = $avgdur;
	$out['devices'] = $devices;
} else if ($action == 'top10episodes') {
	$viewsperdev = []; $views = []; $avgdur = []; $devices = [];

	// -- devices
	$q = "SELECT episode, title, eid, COUNT(DISTINCT smid) AS devices FROM vid_stats WHERE $cond GROUP BY eid ORDER BY devices DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$devices[] = $row;
	}
	// -- avg duration
	$q = "SELECT episode, title, eid, COUNT(id) AS views, SUM(duration) AS duration, SUM(duration)/COUNT(id) AS avg_duration FROM vid_stats WHERE $cond GROUP BY eid ORDER BY avg_duration DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$avgdur[] = $row;
	}

	// -- views
	$q = "SELECT episode, title, eid, COUNT(id) AS views FROM vid_stats WHERE $cond GROUP BY eid ORDER BY views DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$views[] = $row;
	}

	// -- viewsperdev
	$q = "SELECT episode, title, eid, COUNT(id)/COUNT(DISTINCT smid) AS viewsperdev FROM vid_stats WHERE $cond GROUP BY eid ORDER BY viewsperdev DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$viewsperdev[] = $row;
	}

	$out['views'] = $views;
	$out['viewsperdev'] = $viewsperdev;
	$out['avgdur'] = $avgdur;
	$out['devices'] = $devices;
	//print_r($out);exit;
} else if ($action == 'top10category') {
	$viewsperdev = []; $views = []; $avgdur = []; $devices = [];
	$cids = @$_GET['cids'];
	if ($cids) {
		$cids = explode(',', $cids);
		$cond .= ' AND cid IN ('. implode(',', $cids) .")";
	}

	// -- devices
	$q = "SELECT title, COUNT(DISTINCT smid) AS devices FROM vid_stats WHERE $cond GROUP BY tid ORDER BY devices DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$devices[] = $row;
	}
	// -- avg duration
	$q = "SELECT title, COUNT(id) AS views, SUM(duration) AS duration, SUM(duration)/COUNT(id) AS avg_duration FROM vid_stats WHERE $cond GROUP BY tid ORDER BY avg_duration DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$avgdur[] = $row;
	}

	// -- views
	$q = "SELECT title, COUNT(id) AS views FROM vid_stats WHERE $cond GROUP BY tid ORDER BY views DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$views[] = $row;
	}

	// -- viewsperdev
	$q = "SELECT title, COUNT(id)/COUNT(DISTINCT smid) AS viewsperdev FROM vid_stats WHERE $cond GROUP BY tid ORDER BY viewsperdev DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$viewsperdev[] = $row;
	}

	$out['views'] = $views;
	$out['viewsperdev'] = $viewsperdev;
	$out['avgdur'] = $avgdur;
	$out['devices'] = $devices;
	//print_r($out);exit;
} else if ($action == 'top10catepisodes') {
	$viewsperdev = []; $views = []; $avgdur = []; $devices = [];
	$cids = @$_GET['cids'];
	if ($cids) {
		$cids = explode(',', $cids);
		$cond .= ' AND cid IN ('. implode(',', $cids) .")";
	}

	// -- devices
	$q = "SELECT title, episode, COUNT(DISTINCT smid) AS devices FROM vid_stats WHERE $cond GROUP BY eid ORDER BY devices DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$devices[] = $row;
	}
	// -- avg duration
	$q = "SELECT title, episode, COUNT(id) AS views, SUM(duration) AS duration, SUM(duration)/COUNT(id) AS avg_duration FROM vid_stats WHERE $cond GROUP BY eid ORDER BY avg_duration DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$avgdur[] = $row;
	}

	// -- views
	$q = "SELECT title, episode, COUNT(id) AS views FROM vid_stats WHERE $cond GROUP BY eid ORDER BY views DESC LIMIT 10";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$views[] = $row;
	}

	// -- viewsperdev
	$q = "SELECT title, episode, COUNT(id)/COUNT(DISTINCT smid) AS viewsperdev FROM vid_stats WHERE $cond GROUP BY eid ORDER BY viewsperdev DESC LIMIT 10";
	//echo $q;exit;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$viewsperdev[] = $row;
	}

	$out['views'] = $views;
	$out['viewsperdev'] = $viewsperdev;
	$out['avgdur'] = $avgdur;
	$out['devices'] = $devices;
	//print_r($out);exit;
} else if ($action == 'getcategories') {
	$categories = [];

	$q = "SELECT id, title FROM categories";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$categories[] = $row;
	}
	$out['categories'] = $categories;
} else if ($action == 'getepisodes') {
	$episodes = [];
	$ids = @$_GET['ids'];
	if (!$ids) die('Title IDs required');
	$cond = " tid IN(". implode(',', explode(',', $ids)) .")";

	$q = "SELECT id, title FROM episodes WHERE ". $cond;
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	while ($row = $res->fetch_assoc()) {
		$episodes[] = $row;
	}
	$out['episodes'] = $episodes;
}
echo json_encode($out);
function getTotals($cond) {
	global $conn;
	$totals = [];
	$q = "SELECT COUNT(DISTINCT smid) AS devices, COUNT(id) AS views, SUM(duration) AS duration FROM vid_stats WHERE $cond";
	$res = $conn->query($q);
	if ($conn->error) echo 'SQL error: '. $conn->error ."\n";

	if ($row = $res->fetch_assoc()) {
		$totals = $row;
	}
	return $totals;
}
function getGreen($dt) {
	$method='Actions.getPageTitles';
	$period = 'day'; $page=''; $offset=0; $limit = 10;
	$field = 'nb_uniq_visitors';
	$js = getPi($method, $period, $dt, $offset, $field, $limit);
	$ret = json_decode($js, true);
	if (isset($ret['error'])) {
		die($ret);
	}
	$views=0;
	foreach ($ret as $r) {
		$r['label'] = trim($r['label']);
		if (preg_match("#Πατήθηκε το Πράσινο Κουμπί#si", $r['label']) || preg_match("#press_green#si", $r['label']))
		{
			$views += $r['nb_hits'];
		}
	}
	return $views;
}
function getPi($method, $period, $date, $offset, $field, $limit, $sites=null) {
        global $auth, $domain;
        $idsites='6';

        $url = $domain. '/index.php?module=API&method='. $method .'&idSite='. $idsites .'&period='. $period .'&date='. $date .'&format=JSON&token_auth='. $auth;
        //echo " > $url\n";
        //die($url);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        $output = curl_exec($ch);

        curl_close($ch);
        return $output;
}
function ymdToTimestamp($ymd) {
    if (!preg_match('/^\d{8}$/', $ymd)) {
        return false;
    }
    $date = DateTime::createFromFormat('Ymd', $ymd);
    if (!$date) {
        return false;
    }
    return $date->getTimestamp();
}
