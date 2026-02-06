<?php 
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json;');
header('Content-Type: text/html; charset=utf-8');

$debug = (isset($_REQUEST['debug']) ? $_REQUEST["debug"] : '');

//header('Content-Type: text/html; charset=Windows-1252');

date_default_timezone_set('Europe/Athens');
define('SRT_STATE_SUBNUMBER', 0);
define('SRT_STATE_TIME',      1);
define('SRT_STATE_TEXT',      2);
define('SRT_STATE_BLANK',     3);

$srt_filename = $_REQUEST["srt_file"];

$lines = file($srt_filename);

if($debug == 1){
	var_dump($srt_filename);
	exit();
}

$subs    = array();
$state   = SRT_STATE_SUBNUMBER;
$subNum  = 0;
$subText = '';
$subTime = '';

$buckets = array();
$bucket = new stdClass;
$from = date("H:i:s", strtotime( "00:00:00"));
$to = date("H:i:s", strtotime("00:00:30"));


$bucket->from = $from; 
$bucket->to = $to;
$bucket->list = array();
$buckets[] = $bucket;
$bucketCnt = 0;

function subInBucket($sub, $buckets){
	//echo $sub->startTime;
	//@list($starttime, $ms) = @explode(',', $sub->startTime);
	$list = @explode(',', $sub->startTime);
	if($list[0]) $starttime = $list[0];
	else return true;
	if(isset($list[1])) $ms = $list[1];
    $start = date("H:i:s", strtotime( $starttime));
	//echo "-->".$sub->startTime."\n";
	foreach($buckets as $bucket){
		//echo $start." < ".$bucket->to."\n";
		if($start < $bucket->to){
			$bucket->list[] = $sub;
			break;
		}else continue;
	}
}

foreach($lines as $line) {
	
	//$line  = mb_convert_encoding($line, "CP1253", mb_detect_encoding($line));
  //  $line = iconv('CP1253', 'UTF-8', $line);

    switch($state) {
        case SRT_STATE_SUBNUMBER:
            $subNum = trim($line);
            $state  = SRT_STATE_TIME;
            break;

        case SRT_STATE_TIME:
            $subTime = trim($line);
            $state   = SRT_STATE_TEXT;
            break;

        case SRT_STATE_TEXT:
			
            if (trim($line) == '') {
                $sub = new stdClass;
                $sub->number = $subNum;
                list($sub->startTime, $sub->stopTime) = explode(' --> ', $subTime);
                
                list($starttime, $ms) = explode(',', $sub->startTime);
				$sub->startTime = $starttime;
				
                list($stoptime, $ms) = explode(',', $sub->stopTime);
				$sub->stopTime = $stoptime;
                $start = date("H:i:s", strtotime( $starttime));
				if($start < $to){
					//echo "BR1 : from $start to $to</br>";
					subInBucket($sub, $buckets);
				}else{
					
					while($start >= $to){
						$bucket = new stdClass;
						$from = date('H:i:s',strtotime('+30 sec',strtotime($from)));
						$to = date('H:i:s',strtotime('+30 sec',strtotime($to)));
					//	echo "BR2 (create next bucket) : from $from to $to</br>";
						$bucket->from = $from;
						$bucket->to = $to;
						$bucket->list = array();
						$bucketCnt++;
						$buckets[] = $bucket;
					}
					//$bucket[$bucketCnt]->list[] = $sub;
					subInBucket($sub, $buckets);
				}
                $sub->text   = $subText;
				//echo "StartTime: ".$sub->startTime." | StopTime: ".$sub->stopTime." | Text: ". $subText."</br>";
                $subText     = '';
                $state       = SRT_STATE_SUBNUMBER;

                $subs[]      = $sub;
            } else {
                $subText .= $line;
            }
            break;
    }
}

if ($state == SRT_STATE_TEXT) {
    // if file was missing the trailing newlines, we'll be in this
    // state here.  Append the last read text and add the last sub.
    $sub->text = $subText;
    $subs[] = $sub;
}



echo json_encode($buckets);
?>
