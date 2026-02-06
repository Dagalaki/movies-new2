<?php
header('Content-Type: text/javascript; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Pragma: no-cache");

$agent= isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'No_USER_AGENT';
if(strpos($agent,' VID/')!==false) $agent=trim( strstr($agent, ' VID/',true) );
if(strpos($agent,' RVID/')!==false) $agent=trim( strstr($agent, ' RVID/',true) );
if(strpos($agent,' FXM-')!==false) $agent=trim( strstr($agent, ' FXM-',true) );
if(strpos($agent,' Firmware/')!==false) $agent=trim( strstr($agent, ' Firmware/',true) );

$agent    = utf8_to_ascii($agent);
$aghash   = md5($agent);
$dnt = isset($_SERVER['HTTP_DNT']) ? $_SERVER['HTTP_DNT']:0;
$dntSet = isset($_SERVER['HTTP_DNT']) ? 1:0;
$clientIpAddress = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:'127.0.0.1';
$ip=explode(",",$clientIpAddress);
$ip=trim($ip[0]);

$sm_host = "127.0.0.1";
$sm_data = "stats_cretetv";
$sm_user = "stats";
$sm_pass = "stat-4512";

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");
$connerr = $mysqli->connect_error;
if ($connerr)
	die($connerr);

$j = file_get_contents('php://input');
$data = json_decode($j, true);
if(isset($_GET["action"]) && $_GET["action"] == "log_access"){
	$unique = (isset($_GET["unique"])) ? $_GET["unique"] : 0;

	$now = time();
	$dt = date('Ymd');
	$agentsql=$mysqli->real_escape_string($agent);

	$addhash = false; $fromhash = 0;
	if (!$unique) {
		// check if in hash
		// - if found get unique from check_hash and add in error_hash

		$fingerprint = $ip.$aghash;
		$hash = md5($fingerprint);
		$sql = "select id from check_hash where hash LIKE '$hash'";
		$result = $mysqli->query($sql);

		if ($row = $result->fetch_assoc()) {
			$unique = $row["id"];
			$fromhash = 1;
			$mysqli->query("REPLACE INTO check_ips SET dt = ". $dt .", ip = ". ip2long($clientIpAddress));
		} else
			$addhash = true;
	}

	$sql= "INSERT INTO agent (hits,agent,hash) VALUES (1,'$agentsql','$aghash') ON DUPLICATE KEY UPDATE hits=hits+1 ";
	$mysqli->query($sql);
	$agentid= $mysqli->insert_id;
	$agerr = $mysqli->error;

	$sql= "INSERT INTO smart_tvs (id, hits,agent, ts, last_ts) VALUES ('$unique',1,'$agentid', '$now', $now) ON DUPLICATE KEY UPDATE hits=hits+1, last_ts = $now";
	$mysqli->query($sql);
	$smerr = $mysqli->error;
	$isnew = 0;
	if($unique == 0){
		$unique= $mysqli->insert_id;
		$isnew =1;
	}
	setcookie("tv_agent", $agentid,  time()+60*60*24*360 , "/");
	setcookie("unique_smart_id", $unique,  time()+60*60*24*360 , "/");

	if($addhash) {
		$fingerprint = $ip.$aghash;
		$hash = md5($fingerprint);
		$sql = "insert into check_hash (hash, id, dt) values ('$hash', '$unique', $dt)";
		$mysqli->query($sql);
		if ($mysqli->error) die($mysqli->error);
	}
	if ($fromhash) {
		$mysqli->query("INSERT INTO error_hash SET smid = $unique, agent = $agentid, ts = UNIX_TIMESTAMP()");
		echo $mysqli->error;
	}
	$response = array();
	$response["unique"] = $unique;
	$response["agent"] = $agentid;
	$response["aghash"] = $aghash;
	$response["isnew"] = $isnew;
	$response["ip"] = $ip;
	$response["request_uri"] = $_SERVER["REQUEST_URI"];
	echo json_encode($response);
}
function utf8_to_ascii($text) {
	if (is_string($text)) {
		$text = preg_replace_callback('/\X/u', __FUNCTION__, $text);
	}
	elseif (is_array($text) && count($text) == 1 && is_string($text[0])) {
		$text = iconv("UTF-8", "ASCII//IGNORE//TRANSLIT", $text[0]);
		if ($text === '' || !is_string($text)) {
			$text = '?';
		}
		elseif (preg_match('/\w/', $text)) {
			$text = preg_replace('/\W+/', '', $text);
		}
	}
	else {
		$text = '';
	}
	return $text;
}

