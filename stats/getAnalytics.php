<?php
if(isset($_GET["action"]) && $_GET["action"]=="getJson"){
	$ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, "https://lookmega.smart-tv-data.com/index.php?module=API&method=Actions.getPageTitles&idSite=4&period=day&date=yesterday&format=JSON&token_auth=48826b1ea11e1ad44c32f93157684069&expanded=1");

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $output = curl_exec($ch);

    curl_close($ch);
    echo $output;     
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

	$url = "https://lookmega.smart-tv-data.com/index.php?module=API&method=Actions.getPageTitles&idSite=3&". $dst ."format=JSON&token_auth=48826b1ea11e1ad44c32f93157684069&expanded=1";
	/*http://look.ert.gr/pi/index.php?module=API&method=Actions.getPageTitles&idSite=6&". $dst ."&format=JSON&token_auth=1dc655e2360ca7f2ed0dac45e05e5c35&expanded=1";*/

	if (strlen($title))
		$url .= '&filter_pattern_recursive='. urlencode($title);

	//echo ($url);

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
