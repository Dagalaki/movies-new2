<?php
if(isset($_GET["action"]) && $_GET["action"]=="getLive"){
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, 'https://api.wmspanel.com/v1/streams?client_id=611275ee45475e3f443f877e&api_key=cda73d5acc5e0b5f9ed9d47b74225478&data_slice=625461f9796db4170bf021e3&server_kind=nimble&realtime_data=true');

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$output = curl_exec($ch);

	curl_close($ch);
	echo $output;     
	exit();
}
if(isset($_GET["action"]) && $_GET["action"]=="getJson"){
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, "http://smarttv.anixa.tv/matomo/index.php?module=API&method=Actions.getPageTitles&idSite=5&period=day&date=today&format=JSON&token_auth=2dd00a3566232a6687bd84afa33cd049&expanded=1");

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$output = curl_exec($ch);

	curl_close($ch);
	echo $output;     
	exit();
}
if(isset($_GET["action"]) && $_GET["action"]=="getBrands"){
	$range = $_GET["range"];
	$ret = explode(",",$range);

	list ($day,$month, $year) = explode('/', $ret[0]);
	$from = $year."-".$month."-".$day;
	if (count($ret) == 2 && $ret[1]) {
		list( $day,$month, $year) = explode('/', $ret[1]);
		$to = $year."-".$month."-".$day;

		$dst = "period=range&date=".$from.",".$to."&";
	}
	else
		$dst = "period=day&date=". $from."&";

	$ch = curl_init();
	$url = "http://smarttv.anixa.tv/matomo/index.php?module=API&method=DevicesDetection.getBrand&idSite=5&".$dst."format=JSON&token_auth=2dd00a3566232a6687bd84afa33cd049&expanded=1";

	curl_setopt($ch, CURLOPT_URL, $url);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$output = curl_exec($ch);

	curl_close($ch);
	echo $output;
	exit();
}
if(isset($_GET["action"]) && $_GET["action"]=="getModels"){
	$range = $_GET["range"];
	$ret = explode(",",$range);

	list ($day,$month, $year) = explode('/', $ret[0]);
	$from = $year."-".$month."-".$day;
	if (count($ret) == 2 && $ret[1]) {
		list( $day,$month, $year) = explode('/', $ret[1]);
		$to = $year."-".$month."-".$day;

		$dst = "period=range&date=".$from.",".$to."&";
	}
	else
		$dst = "period=day&date=". $from."&";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, "http://smarttv.anixa.tv/matomo/index.php?module=API&method=DevicesDetection.getModel&idSite=5&".$dst."format=JSON&token_auth=2dd00a3566232a6687bd84afa33cd049&expanded=1");

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$output = curl_exec($ch);

	curl_close($ch);
	echo $output;
	exit();
}
if(isset($_GET["action"]) && $_GET["action"]=="getLocations"){
	$range = $_GET["range"];
	$ret = explode(",",$range);

	list ($day,$month, $year) = explode('/', $ret[0]);
	$from = $year."-".$month."-".$day;
	if (count($ret) == 2 && $ret[1]) {
		list( $day,$month, $year) = explode('/', $ret[1]);
		$to = $year."-".$month."-".$day;

		$dst = "period=range&date=".$from.",".$to."&";
	}
	else
		$dst = "period=day&date=". $from."&";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, "http://smarttv.anixa.tv/matomo/index.php?module=API&method=UserCountry.getCity&idSite=5&".$dst."format=JSON&token_auth=2dd00a3566232a6687bd84afa33cd049&expanded=1");

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$output = curl_exec($ch);

	curl_close($ch);

	echo $output;
	exit();
}
if(isset($_GET["action"]) && $_GET["action"]=="getChannel"){
	$sm_host = "5.9.43.245";
	$sm_data = "stats";
	$sm_user = "stats";
	$sm_pass = "stat-4512";

	$conn= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
	$conn->set_charset("utf8");
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
	mysqli_select_db($conn,"stats");
	$res = $conn->query("SELECT pos, cnt FROM channelpos order by pos limit 100");
	echo $conn->error;
	$out = []; $a = []; $zero =0;
	while ($row = $res->fetch_assoc()) {
		$s = [];
		$s['pos'] = $row['pos'];
		$s['hits'] = $row['cnt'];
		if ((int)$row['pos'] == 0)
			$zero = $row['cnt'];
		else
			$a[] = $s;
	}
	$out['a'] = $a;
	$out['zero'] = number_format($zero, 0, ',', '.');

	$res = $conn->query("SELECT newStart FROM extra WHERE dt = ". date('Ymd', time()-86400));
	echo $conn->error;
	if ($row = $res->fetch_assoc()) {
		$out['total'] = number_format($row['newStart'], 0, ',', '.');
	}

	echo json_encode($out);
	exit();
}
$range = $_GET["range"];
$ret = explode(",",$range);

list ($day,$month, $year) = explode('/', $ret[0]);
$from = $year."-".$month."-".$day;
if (count($ret) == 2 && $ret[1]) {
	list( $day,$month, $year) = explode('/', $ret[1]);
	$to = $year."-".$month."-".$day;

	$dst = "period=range&date=".$from.",".$to."&";
}
else
	$dst = "period=day&date=". $from."&";

$title = $_GET["title"];
//echo "http://smarttv.anixa.tv/matomo/index.php?module=API&method=Actions.getPageTitles&idSite=2&". $dst ."format=JSON&token_auth=2dd00a3566232a6687bd84afa33cd049&expanded=1";
$url = "http://smarttv.anixa.tv/matomo/index.php?module=API&method=Actions.getPageTitles&idSite=5&". $dst ."format=JSON&token_auth=2dd00a3566232a6687bd84afa33cd049&expanded=1";
/*http://look.ert.gr/pi/index.php?module=API&method=Actions.getPageTitles&idSite=6&". $dst ."&format=JSON&token_auth=1dc655e2360ca7f2ed0dac45e05e5c35&expanded=1";*/

if (strlen($title))
	$url .= '&filter_pattern_recursive='. urlencode($title);


//$json	= file_get_contents($url);
$ch = curl_init();
//echo $url;
curl_setopt($ch, CURLOPT_URL, $url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$output = curl_exec($ch);

curl_close($ch);
echo $output;
exit();

?>
