<?php

ini_set('memory_limit','512M');


//http://smarttv.anixa.tv/cretetv/stats/tools/chart.php?ch=cretetv

/*
if (!(isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')){
	$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
	header('HTTP/1.1 301 Moved Permanently');
	header('Location: ' . $redirect);
	exit();
}
*/

/*
if (!isset($_COOKIE['stats-userid'])) {
	header('location: ../../stats/?pgMode=program');
	exit;
}
*/

$dt=isset($_REQUEST['dt'])? $_REQUEST['dt']: date("Y-m-d", strtotime('-1 day'));
$fmt=isset($_REQUEST['fmt'])? $_REQUEST['fmt']: "m";
$channel=isset($_REQUEST['ch'])? $_REQUEST['ch']: "cretetv";
$morgen= date("Y-m-d", strtotime($dt.'+1 day'));


$format='Y-m-d H:i:s';
if($fmt=="m") $format='Y-m-d H:i:00';
if($fmt=="h") $format='Y-m-d H:00:00';


$werbung=[];

//print_r($werbung);

function print_recursive($arr){
  GLOBAL $easy;
  foreach ($arr as $key => $val) {
    if (is_array($val)) {
	if($key==="shows"){
	 foreach ($val as $key => $row) $easy[]=$row;
	}
	print_recursive($val);
    }
  }
return;
}

$easy=[];


$sm_host = "127.0.0.1";
$sm_data = "stats_cretetv";
$sm_user = "stats";
$sm_pass = "stat-4512";
$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
if($mysqli->connect_error) die('Connect Error');

$mysqli->set_charset("utf8");
$sql="select start,end,title from program WHERE dt = ". str_replace('-','',$dt) ." ORDER BY start ASC";
//echo $sql;
$result=$mysqli->query($sql);
if($result) while($row = $result->fetch_assoc()) $easy[]=$row;

$lastcolor="";
$lasttitle="";

function iswerbung($time){
 global $werbung;
  foreach($werbung as $row){
    if( $time>=$row['szeit'] && $time < $row['ezeit'] ) return true;
 }
 return false;
}

function getcolor($time){
 global $easy,$lastcolor,$lasttitle;

	$time=strtotime($time);
  //if( iswerbung($time) ) return "red;Werbung";

  foreach($easy as $row){
    if( $time>=$row['start']  && $time < $row['end'] ){
	$color="yellow";
	$prog=trim($row['title']);
	if($lasttitle=="") $lasttitle=$prog;
	
	if($lasttitle!==$prog){
	$color= $lastcolor=="yellow" ? "orange":"yellow";
	$lasttitle=$prog;
	//echo "<br>1 ".$color.' '.$lasttitle;
	}else{
	 if($lastcolor!=="") $color= $lastcolor;
	}

	$lasttitle=$prog;
	$test=strtolower($prog);
	if( strpos($test,'infomercial')!==false ) $color="red";
	if( strpos($test,'shopping')!==false ) $color="red";
	if( strpos($test,'werbung')!==false ) $color="red";
	if( strpos($test,'trailer')!==false ) $color="green";
	if( strpos($test,'wetter')!==false ) $color="blue";
	if( strpos($test,'sponsoring')!==false ) $color="peru";
	if( strpos($test,'livee')!==false ) $color="peru";

	$lastcolor=$color;
	//echo "<br>2 ".$color.' '.$prog;

	return $color.";".$prog;
    }
  }
 return false;
}



$dtfile=$dt."_live81.json";
$rows=json_decode(file_get_contents("/var/node/logs/$dtfile"));

if(0){
 echo '<pre>'.print_r($rows,true);
 exit;
}


$newrows=[];
$lastdate="";
$lastprog="";
$cc=0;
$gesamt=0;
$fakt=49.23;
$color="";
$prog="";

foreach($rows as $row){

	$cc=$row->$channel;

	if($lastdate==""){
	 $lastdate=date($format, strtotime($row->date));
	 $lastprog=date('Y-m-d H:i:00', strtotime($row->date));
	 $ar=getcolor($row->date);
	 if($ar!==false){
		$ar=explode(";", $ar);
		$color=$ar[0];
		$prog=$ar[1];
	 }

	 $a=[];
	 $a['date']=$lastdate;
	 $a['cretetv']=$cc;
	 $a['hoch']=ceil($fakt*$cc);
	 $a['lineColor']=$color;
	 $a['lineProg']=$prog;
	 $newrows[]=$a;

	}

	if($gesamt>0 && $lastdate!==date($format, strtotime($row->date))){
		$lastdate=date($format, strtotime($row->date));

		if($lastprog!==date('Y-m-d H:i:00', strtotime($row->date))) $ar=getcolor($row->date);
		else $ar=false;

		$lastprog=date('Y-m-d H:i:00', strtotime($row->date));
		if($ar!==false){
		 $ar=explode(";", $ar);
		 $color=$ar[0];
		 $prog=$ar[1];
		}

		$a=[];
		$a['date']=$lastdate;
		$a['cretetv']=$gesamt;
		$a['hoch']=ceil($fakt*$gesamt);

		$a['lineColor']=$color;
		$a['lineProg']=$prog;
		$newrows[]=$a;
		$gesamt=$cc;
		$cc=0;

	}else{
		if($cc >$gesamt) $gesamt=$cc;
	}


}

/*
$a=[];
$a['date']=$lastdate;
$a['cretetv']=$gesamt;
$a['hoch']=ceil($fakt*$gesamt);
*/

?>
<!DOCTYPE html>
<!--[if lt IE 8 ]><html lang="en" class="no-js ie ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="no-js ie"><![endif]-->
<!--[if (gt IE 8)|!(IE)]><!-->
<html class=" js hashchange backgroundsize boxshadow cssgradients" firetv-fullscreen="false" lang="en"><!--<![endif]--><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>HbbTV Server Chart</title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<!-- Global stylesheets -->
	<link href="../css/reset.css" rel="stylesheet" type="text/css">
	<link href="../css/common.css" rel="stylesheet" type="text/css">
	<link href="../css/form.css" rel="stylesheet" type="text/css">
	<link href="../css/standard.css?v4" rel="stylesheet" type="text/css">
	
	<link href="../css/960.css" rel="stylesheet" type="text/css">
	
	<!-- Custom styles -->
	<link href="../css/simple-lists.css" rel="stylesheet" type="text/css">
	<link href="../css/block-lists.css" rel="stylesheet" type="text/css">
	<link href="../css/planning.css" rel="stylesheet" type="text/css">
	<link href="../css/table.css?v=3" rel="stylesheet" type="text/css">
	<link href="../css/calendars.css" rel="stylesheet" type="text/css">
	<link href="../css/wizard.css" rel="stylesheet" type="text/css">
	<link href="../css/gallery.css" rel="stylesheet" type="text/css">
	
	<!-- Favicon -->
	<link rel="shortcut icon" type="image/x-icon" href="https://www.media-theia.de/images/favicon/favicon.ico">
	<link rel="icon" type="image/png" href="https://www.media-theia.de/images/favicon/favicon-large.png">
	
	<!-- Modernizr for support detection, all javascript libs are moved right above </body> for better performance -->
	<script src="../js/modernizr.js"></script>
	<script src="../js/libs/amchart/amcharts.js"></script>
	<script src="../js/libs/amchart/serial.js"></script>
	<script src="../js/libs/jquery-1.11.3.min.js"></script>
<style>
#chartdiv{width: 100%;height: 500px;}
#breadcrumb li:last-child {padding-right: 4px;}
</style>
</head>
<body>
	<article class="container_12">

		<section class="grid_12">
			<div class="block-border"><div class="block-content">
				<h1>TV-Program Chart</h1>

<div class="block-controls">
<form method="get" class="form">
	<select name="ch" onchange="this.form.submit()">
		<option value="cretetv" <?php echo($channel=="cretetv" ? 'selected':''); ?>>cretetv</option>
	</select>
Format:
<input onchange="this.form.submit()" type="radio" name="fmt" <?php echo($fmt=="s" ? "checked ":"");?>value="s"> Sec.
<input onchange="this.form.submit()" type="radio" name="fmt" <?php echo($fmt=="m" ? "checked ":"");?>value="m"> Min.
<input onchange="this.form.submit()" type="radio" name="fmt" <?php echo($fmt=="h" ? "checked ":"");?>value="h"> Hor.
Day: <select name="dt" onchange="this.form.submit()"><?php

 for($i=0; $i<30; $i++){

	$tm=strtotime("-$i days");
	$day=date("Y-m-d", $tm );

	echo('<option value="'.$day.'"'.($dt==$day ? " selected":"").'>'.date("D. d.m.", $tm ).'</option>');

	if($day=="2021-12-08") break;

 }


?>
</select>
</form></div>
<div id="chartdiv"></div>


</div></div>
		</section>
	</article>

<script id="rendered-js" >
<?php

echo('var chartData='.json_encode($newrows).';');

?>

var chart = AmCharts.makeChart("chartdiv", {
	type: "serial",
		"theme": "light",
		path: "../js/libs/amchart/",
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

		"chartScrollbar": {
			"enabled": true
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
		valueField: "cretetv",
		lineThickness: 3,
		type: "smoothedLine",
		lineColor: "blue",
		negativeLineColor: "#0352b5",
		balloonText: "[[category]]<br/><b><span style='font-size:14px;'>RW: [[value]]<br/>[[lineProg]]</span></b>",
		   "fillAlphas": 0.3,
		   "fillColorsField": "lineColor",
		   "lineColorField": "lineColor",
		   "legendValueText": "[[lineProg]]"
	}],
		chartCursor: {
		"categoryBalloonDateFormat": "JJ:NN:SS",
			fullWidth:true,
			cursorAlpha:0.1
	},


		mouseWheelZoomEnabled:true
});

//chart.addListener("dataUpdated", zoomChart);


function zoomChart() {
	chart.zoomToIndexes(chartData.length - 100, chartData.length - 1);
}

</script>
</body>
</html><?php

/*

var chartdata=[{"cc":"2215","date":"15:08:00","time":"15:08:17","channel":"TNT Film","clip":"TRXDAGD1766752C73C","sek":"15:08:00"}];

<script>
am4core.useTheme(am4themes_animated);
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.legend = new am4charts.Legend();
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "date";
var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
var columnSeries = chart.series.push(new am4charts.ColumnSeries());
columnSeries.name = "Spot";
columnSeries.dataFields.valueY = "cc";
columnSeries.dataFields.categoryX = "sek";
columnSeries.columns.template.tooltipText = "[#fff font-size: 15px]{name} Sender: {channel}\n{time}[/]"
columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
columnSeries.columns.template.propertyFields.stroke = "stroke";
columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";
columnSeries.columns.template.column.cornerRadiusTopRight = 10;
columnSeries.columns.template.column.cornerRadiusTopLeft = 10;
columnSeries.tooltip.label.textAlign = "middle";
var lineSeries = chart.series.push(new am4charts.LineSeries());
lineSeries.name = "Zuschauer";
lineSeries.dataFields.valueY = "cc";
lineSeries.dataFields.categoryX = "date";
lineSeries.stroke = am4core.color("#fdd400");
lineSeries.strokeWidth = 2;
lineSeries.tensionX = 0.6;
lineSeries.propertyFields.strokeDasharray = "lineDash";
lineSeries.tooltip.label.textAlign = "middle";
lineSeries.tooltipText = "[#fff font-size: 15px]{name} um {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/]"
chart.data = chartdata;
console.log(chartdata);
chart.cursor = new am4charts.XYCursor();
</script>


*/

?>
