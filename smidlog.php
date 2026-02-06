<?php
// Log video and playstate change for a smart id
include('/var/www/html/cretetv/stats/config.php');
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$ip = 0;
if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR']) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
        $ip = $_SERVER['REMOTE_ADDR'];
}
$j = file_get_contents('php://input');
$o = json_decode($j, true);

$url = trim(@$o['url']);
$title = @html_entity_decode($o['title']);
$episode = @html_entity_decode($o['episode']);
$category = @html_entity_decode($o['category']);
$ua = @$o['ua'];
$smid = (int)@$o['smid'];
$state = (int)@$o['state'];
$error = (int)@$o['error'];
$lastid = (int)@$o['lastid'];

$response = [];
if (!$smid)
	$response['error'] = 'Missing smart ID';
else if ($url == 'speed') {
	$speed = (double)@$o['speed'];
	$ua = mysqli_real_escape_string($mysqli, $ua);

	$q = "INSERT INTO smids SET id = ". $smid .", ip = INET_ATON('". $ip ."'), speed = ". $speed .", ua = '". $ua ."' ON DUPLICATE KEY UPDATE speed = ". $speed;
	$res = $mysqli->query($q);
	errcheck();
} else if (!$url)
	$response['error'] = 'Missing video URL';
else {
	$vid = 0; $tid = 0; $eid = 0; $cid = 0;
	$url = mysqli_real_escape_string($mysqli, $url);
	$ua = mysqli_real_escape_string($mysqli, $ua);
	$url = preg_replace("#195\.226\.218\.\d{1,3}#si", 'cdn.smart-tv-data.com', $url);
	$url = preg_replace("#abr\.#si", 'cdn.', $url);
	$q = "SELECT id FROM videos WHERE url = '". $url ."'";
	$res = $mysqli->query($q);
	errcheck();

	if ($row = $res->fetch_row()) {
		$vid = (int)$row[0];
	}
	if (!$vid) {
		$title = mysqli_real_escape_string($mysqli, $title);
		$episode = mysqli_real_escape_string($mysqli, $episode);
		$category = mysqli_real_escape_string($mysqli, $category);

		$q = "SELECT id FROM categories WHERE title = '". $category ."'";
		$res = $mysqli->query($q);
		errcheck();

		if ($row = $res->fetch_row()) {
			$cid = (int)$row[0];
		}
		if (!$cid) {
			$q = "INSERT INTO categories SET title = '". $category ."'";
			$res = $mysqli->query($q);
			errcheck();
			$cid = (int)$mysqli->insert_id;
		}

		$q = "SELECT id FROM titles WHERE title = '". $title ."'";
		$res = $mysqli->query($q);
		errcheck();

		if ($row = $res->fetch_row()) {
			$tid = (int)$row[0];
		}
		if (!$tid) {
			$q = "INSERT INTO titles SET title = '". $title ."', category = '". $cid ."'";
			$res = $mysqli->query($q);
			errcheck();
			$tid = (int)$mysqli->insert_id;
		}
		$q = "SELECT id FROM episodes WHERE title = '". $episode ."'";
		$res = $mysqli->query($q);
		errcheck();

		if ($row = $res->fetch_row()) {
			$eid = (int)$row[0];
		}
		if (!$eid) {
			$q = "INSERT INTO episodes SET title = '". $episode ."', tid = ". $tid;
			$res = $mysqli->query($q);
			errcheck();
			$eid = (int)$mysqli->insert_id;
		}
		$q = "INSERT INTO videos SET url = '". $url ."', title = '". $tid ."', episode = '". $eid ."'";
		$res = $mysqli->query($q);
		errcheck();
		$vid = (int)$mysqli->insert_id;

		if (!$vid) {
			$response['error'] = 'Video id failure';
			goto ex;
		}

	}

	$q = "INSERT INTO vid_actions SET smid = ". $smid .", ts = UNIX_TIMESTAMP(), vid = ". $vid .", state = ". $state .", error = ". $error;
	if ($lastid)
		$q = "UPDATE vid_actions SET ts = UNIX_TIMESTAMP() WHERE id = ". $lastid;
	$res = $mysqli->query($q);
	if ($lastid)
		$id = $lastid;
	else
		@$id = (int)$mysqli->insert_id;
	errcheck();

	if (strlen($ua)) {
		$q = "INSERT IGNORE INTO smids SET id = ". $smid .", ip = INET_ATON('". $ip ."'), speed = 0, ua = '". $ua ."'";
		$res = $mysqli->query($q);
		errcheck();
	}

	$response['success'] = true;
	$response['id'] = $id;
}
ex:

echo json_encode($response);

function errcheck() {
	global $response, $mysqli;
	if ($mysqli->error) {
		$response['error'] = 'SQL error: '. $mysqli->error;
		echo json_encode($response);
		exit;
	}
}
