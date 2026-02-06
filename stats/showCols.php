<?php
// shows visitors and watchers (connected TVs) inside a time frame
// (linked from program)
ini_set("max_execution_time", "-1");
ini_set("memory_limit", "-1");

require_once('config.php');
error_reporting(E_ALL);

$pm = new DateTime();
$pm->sub(new DateInterval('P1M'));
$pmTs = $pm->getTimestamp();

$from = $_GET['from'];
$to = $_GET['to'];

if (!$from || !$to) {
	$from = 1567548898;
	$to = 1567550698;
}

if (!$from || !$to) {
	die("No from or to found");
}
$addq = "channel = 'cretetv' AND ";
$table = "redbutton.access_archiv";
$jsonFname = "json/cols-$from-$to.json";

$total = 0;
define('TIMEEL', 30);
define('TIMEEL2', 10);
define('DEBUG', false);
define('PHPORDER', true);

$visits = []; $convisits = [];
$visits2 = []; $convisits2 = [];
$ts = $from;
// add keys to visits
while ($ts < $to) {
	$visits[$ts] = [];
	$visits[$ts]['cnt'] = 0;

	$convisits[$ts] = [];
	$convisits[$ts]['cnt'] = 0;

	$ts += TIMEEL;
}

$ts = $from;
while ($ts < $to) {
	$visits2[$ts] = [];
	$visits2[$ts]['cnt'] = 0;

	$convisits2[$ts] = [];
	$convisits2[$ts]['cnt'] = 0;

	$ts += TIMEEL2;
}


if (DEBUG)
	echo("SELECT intime, outtime FROM ". $table ." WHERE $addq intime BETWEEN ". $from ." AND ". $to ." OR (intime <= ". $from ." AND outtime > ". $to .") ORDER BY intime\n");

$res = $mysqli->query("SELECT title FROM program WHERE start = ". $from);
if ($mysqli->error) {
	echo "Error: ". $mysqli->error."\n";
}

$title=''; $rows = [];
if ($row = $res->fetch_assoc())
	$title = $row['title'];

$countries = []; $brands = [];
//if ($_GET['test']) {echo("(SELECT ts, end, id, info FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to .") UNION (SELECT ts, end, id, info FROM ". $table ." WHERE ts <= ". $from ." AND end > ". $from .") ORDER BY ts"); exit;}

if (0 && $_GET['test']) {
	$res = $mysqli->query("(SELECT intime, end, id, info FROM ". $table ." WHERE intime BETWEEN ". $from ." AND ". $to .") UNION (SELECT intime, end, id, info FROM ". $table ." WHERE intime <= ". $from ." AND end > ". $from .")");
} else {
	if ($_GET['test']) {
		echo("SELECT ts, end, id FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to ." OR (ts <= ". $from ." AND end > ". $from .") ORDER BY ts<br>");
		echo("(SELECT ts, end, id, info FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to .") UNION (SELECT ts, end, id, info FROM ". $table ." WHERE ts <= ". $from ." AND end > ". $from .")");
		exit;
	}
	if (0)
		$res = $mysqli->query("(SELECT ts, end, id, info FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to .") UNION (SELECT ts, end, id, info FROM ". $table ." WHERE ts <= ". $from ." AND end > ". $from .")". (PHPORDER ? '': ' ORDER BY ts'));
	else if (file_exists($jsonFname)) {
		$rows = json_decode(file_get_contents($jsonFname), true);
	} else
		$res = $mysqli->query("SELECT intime, outtime, smartid FROM ". $table ." WHERE $addq (intime BETWEEN ". $from ." AND ". $to ." OR (intime BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND outtime > ". $from ."))". (PHPORDER ? '': ' ORDER BY intime'));
}
if ($mysqli->error) {
	echo "Error: ". $mysqli->error."\n";
}
if (DEBUG)
	echo("Found ". $res->num_rows ."\n");

$ts = $from;
$ts2 = $from;
$ids = []; $ids2 = [];
if (!count($rows)) {
	while ($row = $res->fetch_assoc()) {
		$rows[] = $row;
	}
	file_put_contents($jsonFname, json_encode($rows));
}
if (PHPORDER) {
	usort($rows, 'sortbyts');
}
function sortbyts($a, $b) {
	if ($a['intime'] == $b['intime']) {
		return 0;
	}
	return ($a['intime'] < $b['intime']) ? -1 : 1;
}

foreach ($rows as $row) {
	$vstart = $row['intime'];
	$vend = $row['outtime'];
	$cou = '';
	if ($vstart - $ts > TIMEEL) {
		$ts += TIMEEL;
	}
	if ($vstart - $ts > TIMEEL2) {
		$ts2 += TIMEEL2;
	}
	//if (DEBUG || $ts == 1557266535) echo date("H:i:s", $vstart). ' - '. date("H:i:s", $vend). " ts ". $ts ." (". date("d H:i:s", $ts). ") id ". $row['id'] ."\n";

	if ($vstart >= $from && $vstart <= $to) {
		//started between start - end
		if( isset($visits[$ts]['cnt'])) $visits[$ts]['cnt']++;
		else $visits[$ts]['cnt']=1;

		if( isset($visits2[$ts2]['cnt'])) $visits2[$ts2]['cnt']++;
		else $visits2[$ts2]['cnt']=1;

		//if (DEBUG) echo "adding to visits\n";

		if ($vstart == $from) {
			$convisits[$ts]['cnt']++;
			$convisits2[$ts2]['cnt']++;
			$ids[$ts][] = $row;
			$ids2[$ts2][] = $row;
			//if (DEBUG || $ts == 1557266535) echo "adding to convisits\n";
		}
	} else if ($vstart <= $from && $vend > $from) {
		// started before start and ended after start
		$t = $ts;
		//if (DEBUG || $ts == 1557266535) echo "adding loop...\n";

		while ($t < $vend && $t < $to) {
			$visits[$t]['cnt']++;
			$convisits[$t]['cnt']++;
			$ids[$t][] = $row;
			$t += TIMEEL;
		}
		$t = $ts2;

		while ($t < $vend && $t < $to) {
			$visits2[$t]['cnt']++;
			$convisits2[$t]['cnt']++;
			$ids2[$t][] = $row;
			$t += TIMEEL2;
		}
	} else {
		continue;
		echo "not inside time frames? ts = ". $ts ." vstart ". $vstart ." vend ". $vend ."\n";
		print_r($convisits);
		print_r($visits);
		exit;
	}
}

if (0) {
// find countries for first column connected visitors
foreach ($ids[$from] as $row) {
	$info = (array)json_decode($row['info']);
	$cou = $info['country'];
	$br = $info['brand'];

	if ($cou) {
		if (!isset($countries[$cou]))
			$countries[$cou] = 0;
		$countries[$cou]++;
	}
       	if ($br) {
		if (!isset($brands[$br]))
			$brands[$br] = 0;
		$brands[$br]++;
	}
}
$total = count($ids[$from]);
function percent($x, $total) {
	$percent = ($x * 100) / $total;
	return number_format( $percent, 2 ); // change 2 to # of decimals
}
function cntSrt($a, $b) {
	if ($a == $b)
		return 0;
	return ($a > $b) ? -1 : 1;
}
uasort($countries, 'cntSrt');
uasort($brands, 'cntSrt');

$jsCountries = "[['Country', 'Viewers'],\n";
foreach ($countries as $c => $v) {
	$jsCountries .= "['". $c ."', ". $v ."],\n";
}
$jsCountries .= "]";

$jsBrands = "[['Brand', 'Viewers'],\n";
foreach ($brands as $c => $v) {
	$jsBrands .= "['". $c ."', ". $v ."],\n";
}
$jsBrands .= "]";
}

//if ($_GET['test']) { echo $from."\n";echo $total;print_r($brands); echo($jsBrands);exit; }

//if ($_GET['test']) { echo $from."\n";echo $total;print_r($countries); echo($jsCountries);exit; }

//if ($_GET['test']) { print_r($ids);exit; }
// save to cache

if ($mc) {
	foreach ($ids as $ts=>$v) {
		$key = 'convisits.v2.run.'.$ts;
		$val = json_encode($v);

		$mc->set($key, $val, 0);
		//echo "len ". strlen($val)."\n";
		//echo "key[$key] val[$val]";exit;
	}

	foreach ($ids2 as $ts=>$v) {
		$key = 'convisits.v2.run.10.'.$ts;
		$val = json_encode($v);

		$mc->set($key, $val, 0);
		//echo "len ". strlen($val)."\n";
		//echo "key[$key] val[$val]";exit;
	}
}

if (DEBUG) {
	print_r($convisits);
	print_r($visits);exit;
}
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
	<link href="css/planning.css?v6" rel="stylesheet" type="text/css">
	<link href="css/table.css" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">

	<!-- Modernizr for support detection, all javascript libs are moved right above </body> for better performance -->
	<script src="https://www.gstatic.com/charts/loader.js"></script>
	<script src="js/modernizr.js"></script>
<script>
google.charts.load('current', {'packages':['corechart']});
</script>
</head>
<body>
<article class="container_12">
<section class="grid_12">
<div class="block-border">
<div class="block-content">
<?php
function dt($ts) {
	return date('H:i:s', $ts);
}

echo('<h1>"'. $title .'"  '. date('d M H:i:s', $from) .' - '. date('H:i:s', $to) .'</h1>'."\n");
echo('<table class="table" id="visits"  cellspacing="0">'."\n");

echo '<thead>';
foreach ($visits as $ts=>$v) {
	$ets = $ts + 29;
	//$ets = ($k+ 1 == $len ? $to : $visits[$k+1]['ts']);

	echo "<th scope=\"col\">". dt($ts) .' - '. dt(($ets > $to ? $to : $ets)). "</th>\n";
}
echo "</thead><tbody><tr>\n";
$num = 0;
foreach ($visits as $v) {
	echo '<td>'. $v['cnt'] .'</td>';
	$num += $v['cnt'];
}
echo "</tbody></tr>\n";

echo("</table>\n");

?>
<h2>Chart:
	<input name="stats-sites" id="chart-0" value="0" type="radio" checked="checked" onclick="toggleChart(0)">&nbsp;<label for="chart-0">Bars</label>
	<input name="stats-sites" id="chart-1" value="1" type="radio" onclick="toggleChart(1)">&nbsp;<label for="chart-1">Lines</label>
</h2>
	<div id="chart_div" style="height:330px;"></div>
</div></div>
</section>

<section class="grid_12">
<div class="block-border">
<div class="block-content">
<!--<h1>Connected (how many watched until the end) <a href="javascript:void(0)" onclick="toggleGraph()">Show IDs per <span id="toggler-span">10</span> seconds</a></h1>-->
<h1>Connected (how many watched until the end)</h1>

<div id="chart1">
<?php
echo('<table class="table" id="convisits"  cellspacing="0">'."\n");

echo '<thead>';
foreach ($convisits as $ts=>$v) {
	$ets = $ts + 29;
	//$ets = ($k+ 1 == $len ? $to : $visits[$k+1]['ts']);

	echo "<th scope=\"col\">". dt($ts) .' - '. dt(($ets > $to ? $to : $ets)). "</th>\n";
}
echo "</thead><tbody><tr>\n";
$num = 0;
foreach ($convisits as $v) {
	echo '<td>'. $v['cnt'] .'</td>';
	$num += $v['cnt'];
}
echo "</tbody></tr>\n";

echo("</table>\n");
?>

<h2>Chart 2:
	<input name="stats-sites2" id="chart-2" value="0" type="radio" checked="checked" onclick="toggleChart2(0)">&nbsp;<label for="chart-2">Bars</label>
	<input name="stats-sites2" id="chart-3" value="1" type="radio" onclick="toggleChart2(1)">&nbsp;<label for="chart-3">Lines</label>
</h2>
	<div id="chart_div2" style="height:330px;"></div>
<?php if (0) { ?>
	<p>
		Reports: (<small>viewers at the start of the show</small>) <a class="button" href="javascript:void(0)" style="margin-left: 10px;" onclick="showCountries()">Countries</a>
		<a class="button" href="javascript:void(0)" style="margin-left: 10px;" onclick="showBrands()">TV Brands</a>
	</p>
<?php } ?>
	<ul class="message no-margin">
		<li><strong>Click on a time frame</strong> to see smart IDs</li>
	</ul>

</div>

<div id="chart2" style="display: block; margin-top: 30px;">
	<?php
	echo('<table class="table" id="convisits2"  cellspacing="0">'."\n");

	echo '<thead>';
	foreach ($convisits2 as $ts=>$v) {
		$ets = $ts + 9;

		echo "<th scope=\"col\">". dt($ts) .' - '. dt(($ets > $to ? $to : $ets)). "</th>\n";
	}
	echo "</thead><tbody><tr>\n";
	$num = 0;
	foreach ($convisits2 as $v) {
		echo '<td>'. $v['cnt'] .'</td>';
		$num += $v['cnt'];
	}
	echo "</tbody></tr>\n";

	echo("</table>\n");
	?>


	<h2>Chart 3:
		<input name="stats-sites3" id="chart-4" value="0" type="radio" checked="checked" onclick="toggleChart3(0)">&nbsp;<label for="chart-4">Bars</label>
		<input name="stats-sites3" id="chart-5" value="1" type="radio" onclick="toggleChart3(1)">&nbsp;<label for="chart-5">Lines</label>
	</h2>
		<div id="chart_div3" style="height:330px;"></div>

</div>



</div></div>
</section>

<section class="grid_12" id="show-smart-ids" style="display: none">
<div class="block-border">
<div class="block-content">
	<h1>Smart IDs</h1>
	<div class="block-controls"><p id="plan-loader" style="text-align: left" class="message loading">Loading...</p>
		<ul class="controls-buttons" id="time-nav">
		</ul>
	</div>

	<ul class="planning no-margin" id="tv-plan">
	</ul>
</div>
</div>
</section>

	<script src="js/libs/jquery-1.11.3.min.js"></script>
	<script>
		jQuery.browser = {};
		(function () {
			    jQuery.browser.msie = false;
			    jQuery.browser.version = 0;
			    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
				    jQuery.browser.msie = true;
				    jQuery.browser.version = RegExp.$1;
			    }
		})();
	</script>

	<script src="js/jquery_006.js"></script>
	<!-- Template libs -->
	<script src="js/jquery_003.js"></script>
	<script src="js/searchField.js"></script>
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
		/*
		 * This script is dedicated to building and refreshing the demo chart
		 * Remove if not needed
		 */
		
		// Load the Visualization API and the piechart package.
		google.load('visualization', '1', {'packages':['corechart']});
		
		// Handle viewport resizing
		var previousWidth = $(window).width();
		$(window).resize(function()
		{
			if (previousWidth != $(window).width())
			{
				drawVisitorsChart();
				drawConVisitorsChart();
				drawConVisitorsChart2();
				previousWidth = $(window).width();
			}
		});
		
		// Visits chart
		function drawVisitorsChart() {

			var cols = [], visits = [], i = 0;
			//visits.push(0);
			$('#visits').find('tr').each(function(i, el) {
				if (i == 0) {
					$(el).find('th').each(function(j, th) {
						cols.push($(th).text().substring(0, 8));
						times.push($(th).text().substring(0, 8));
					});
				} else {
					$(el).find('td').each(function(j, th) {
						visits.push(parseInt($(th).text()));
					});
				}
			});
			//console.log(visits);
			//console.log(cols);

			visits.unshift('Viewers');

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
			console.log(data);
			
			// Create and draw the visualization.
			var div = $('#chart_div');
			//googleChart = new google.visualization.ColumnChart(div.get(0)).draw(data, {
			googleChart = new google.visualization.ChartWrapper();

			googleChart.setContainerId('chart_div');
			//googleChart.setChartType('LineChart');
			googleChart.setChartType('ColumnChart');
			googleChart.setDataTable(data);
			googleChart.setOptions({
				title: 'Visits per 30 seconds',
				width: div.width(),
				height: 330,
				legend: 'right',
				yAxis: {title: '(thousands)'},
				vAxis: {minValue: 0}
			});
			googleChart.draw();
			
			// Message
			notify('Chart updated');
		};

		// ConVisits chart
		function drawConVisitorsChart() {

			var cols = [], visits = [], i = 0;
			$('#convisits').find('tr').each(function(i, el) {
				if (i == 0) {
					$(el).find('th').each(function(j, th) {
						cols.push($(th).text().substring(0, 8));
					});
				} else {
					$(el).find('td').each(function(j, th) {
						visits.push(parseInt($(th).text()));
					});
				}
			});
			//console.log(visits);
			//console.log(cols);

			visits.unshift('Connected');

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
			var div = $('#chart_div2');
			googleChart2 = new google.visualization.ChartWrapper();

			googleChart2.setContainerId('chart_div2');
			googleChart2.setChartType('ColumnChart');
			googleChart2.setDataTable(data);
			googleChart2.setOptions({
				title: 'Connected Visits per 30 seconds',
				width: div.width(),
				height: 330,
				legend: 'right',
				yAxis: {title: '(thousands)'},
				vAxis: {minValue: 0}
			});
			googleChart2.draw();
			
			// Message
			notify('Chart updated');
			google.visualization.events.addListener(googleChart2, 'select', selectHandler);
		};

		function drawConVisitorsChart2() {

			var cols = [], visits = [], i = 0;
			$('#convisits2').find('tr').each(function(i, el) {
				if (i == 0) {
					$(el).find('th').each(function(j, th) {
						cols.push($(th).text().substring(0, 8));
					});
				} else {
					$(el).find('td').each(function(j, th) {
						visits.push(parseInt($(th).text()));
					});
				}
			});

			visits.unshift('Connected');

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
			var div = $('#chart_div3');
			googleChart3 = new google.visualization.ChartWrapper();

			googleChart3.setContainerId('chart_div3');
			googleChart3.setChartType('ColumnChart');
			googleChart3.setDataTable(data);
			googleChart3.setOptions({
				title: 'Connected Visits per 10 seconds',
				width: div.width(),
				height: 330,
				legend: 'right',
				yAxis: {title: '(thousands)'},
				vAxis: {minValue: 0}
			});

			googleChart3.draw();
			google.visualization.events.addListener(googleChart3, 'select', selectHandler2);
		};

		google.charts.setOnLoadCallback(drawCharts);
function drawCharts() {
	drawVisitorsChart();
	drawConVisitorsChart();
	drawConVisitorsChart2();
}
		$(document).ready(function() {


			// Apply to table
			$('.sortable').each(function(i) {
				// DataTable config
				var table = $(this),
					oTable = table.dataTable({
						/*
						 * We set specific options for each columns here. Some columns contain raw data to enable correct sorting, so we convert it for display
						 * @url http://www.datatables.net/usage/columns
						 */
						aoColumns: [
							{ bSortable: false },	// No sorting for this columns, as it only contains checkboxes
							{ sType: 'string' },
							{ bSortable: false },
							{ sType: 'numeric', bUseRendered: false, fnRender: function(obj) // Append unit and add icon
								{
									return '<small><img src="images/icons/fugue/image.png" width="16" height="16" class="picto"> '+obj.aData[obj.iDataColumn]+' Ko</small>';
								}
							},
							{ sType: 'date' },
							{ sType: 'numeric', bUseRendered: false, fnRender: function(obj) // Size is given as float for sorting, convert to format 000 x 000
								{
									return obj.aData[obj.iDataColumn].split('.').join(' x ');
								}
							},
							{ bSortable: false }	// No sorting for actions column
						],
						
						/*
						 * Set DOM structure for table controls
						 * @url http://www.datatables.net/examples/basic_init/dom.html
						 */
						sDom: '<"block-controls"<"controls-buttons"p>>rti<"block-footer clearfix"lf>',
						
						/*
						 * Callback to apply template setup
						 */
						fnDrawCallback: function()
						{
							this.parent().applyTemplateSetup();
						},
						fnInitComplete: function()
						{
							this.parent().applyTemplateSetup();
						}
					});
				
				// Sorting arrows behaviour
				table.find('thead .sort-up').click(function(event)
				{
					// Stop link behaviour
					event.preventDefault();
					
					// Find column index
					var column = $(this).closest('th'),
						columnIndex = column.parent().children().index(column.get(0));
					
					// Send command
					oTable.fnSort([[columnIndex, 'asc']]);
					
					// Prevent bubbling
					return false;
				});
				table.find('thead .sort-down').click(function(event)
				{
					// Stop link behaviour
					event.preventDefault();
					
					// Find column index
					var column = $(this).closest('th'),
						columnIndex = column.parent().children().index(column.get(0));
					
					// Send command
					oTable.fnSort([[columnIndex, 'desc']]);
					
					// Prevent bubbling
					return false;
				});
			});
			
			/*
			 * Datepicker
			 * Thanks to sbkyle! http://themeforest.net/user/sbkyle
			 */
			$('.datepicker').datepick({
				alignment: 'bottom',
				showOtherMonths: true,
				selectOtherMonths: true,
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
		
		var fromDt = '<?php echo date('Y-m-d', $from);?>';
		var toDt = '<?php echo date('Y-m-d', $to);?>';
		var stHour = <?php echo date('H', $from);?>;
		var stMin = <?php echo date('i', $from);?>;
		var enHour = <?php echo date('H', $to);?>;
		var enMin = <?php echo date('i', $to);?>;
		var fromTs = '<?php echo $from;?>';
		var toTs = '<?php echo $to;?>';
		var times = [], idsHidden = true;
		function toggleChart(v) {
			if (v == 1) {
				googleChart.setChartType('LineChart');
			} else {
				googleChart.setChartType('ColumnChart');
			}
			googleChart.draw();
			notify('Chart updated');
		}
		function toggleChart2(v) {
			if (v == 1) {
				googleChart2.setChartType('LineChart');
			} else {
				googleChart2.setChartType('ColumnChart');
			}
			googleChart2.draw();
			notify('Chart updated');
		}
		function toggleChart3(v) {
			if (v == 1) {
				googleChart3.setChartType('LineChart');
			} else {
				googleChart3.setChartType('ColumnChart');
			}
			googleChart3.draw();
			notify('Chart updated');
		}
		function toggleGraph() {
			var disp = $('#chart2').css('display');

			if (disp == 'none') {
				$('#chart1').css('display', 'none');
				$('#chart2').css('display', 'block');
				$('#toggler-span').html('30');
			} else {
				$('#chart2').css('display', 'none');
				$('#chart1').css('display', 'block');
				$('#toggler-span').html('10');
			}
		}
		function getRandomInt(max) {
			return Math.floor(Math.random() * Math.floor(max));
		}
		function utc(ts) {
			var dt = new Date(ts);
			return Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
		}

		function selectHandler() {
			var sel = googleChart2.getChart().getSelection();
			var data = googleChart2.getDataTable();
			var time = data.getValue(sel[0].row, 0);
			var startHour = parseInt(data.getValue(0, 0).split(':')[0]);
			var hour = parseInt(time.split(':')[0]);

			renderSmartIds((startHour > hour ? toDt : fromDt) + ' ' +time, time);
		}

		function selectHandler2() {
			var sel = googleChart3.getChart().getSelection();
			var data = googleChart3.getDataTable();
			var time = data.getValue(sel[0].row, 0);
			var startHour = parseInt(data.getValue(0, 0).split(':')[0]);
			var hour = parseInt(time.split(':')[0]);

			renderSmartIds((startHour > hour ? toDt : fromDt) + ' ' +time, time, true);
		}

		function minFloor(m) {
			var r = 0;
			if (m >= 0 && m < 8)
				r = 0;
			else if (m >= 8 && m < 23)
				r = 15;
			else if (m >= 23 && m < 38)
				r = 30;
			else if (m >= 38 && m < 53)
				r = 45;
			else if (m >= 53 && m < 60)
				r = 60;
			return r;
		}
		function visitStyle(minTs, maxTs, ts, end, width) {
			ts = ts < minTs ? minTs : ts;
			end = end > maxTs ? maxTs : end;

			var left = (((ts - minTs) / 60) * 2.08);
			var right = (((end - minTs) / 60) * 2.08);
			var r = (100-((right/width)*100));
			if (r < 0)
				r = 0;

			//console.log(width, right, maxTs, end);
			return ' style="left: '+ (left/width)*100 +'%; right: '+ r +'%;"';
			//return ' style="left: '+ left +'px; right: '+ right +'px;"';
		}

		function leftStyle(minTs, ts, width) {
			var px = (((ts - minTs) / 60) * 2.08);
			return ' style="left: '+ (px/width)*100 +'%;"';
		}

		function renderSmartIds(dt, time, per10 = false) {
			var h = '', ind = times.indexOf(time);

			if (ind > 0)
				h += '<li><a href="javascript:void(0)" onclick="renderSmartIds(\''+ dt +'\', \''+ times[ind-1] +', '+ per10 +'\');" title="'+ times[ind-1] +'"><img src="images/navigation-180.png" width="16" height="16"></a></li>';
			h += '<li class="sep"></li>';
			h += '<li class="controls-block"><strong>'+ time +'</strong></li>';
			h += '<li class="sep"></li>';
			if (ind+1 < times.length)
				h += '<li><a href="javascript:void(0)" onclick="renderSmartIds(\''+ dt +'\', \''+ times[ind+1] +', '+ per10 +'\');" title="'+ times[ind+1] +'"><img src="images/navigation.png" width="16" height="16"></a></li>';
			h += '<li><a href="javascript:void(0)" onclick="$(\'#show-smart-ids\').hide()"><img src="images/cross-circle.png" width="16" height="16"></a></li>';

			$('#time-nav').html(h);

			$('#show-smart-ids').show();
			$('#plan-loader').show();
			$('#tv-plan').html('<li class="planning-header" id="plan-header"> <span><b>IDs <span id="total-ids"></span></b></span> <ul id="plan-hours"> </ul> </li>');

			if (idsHidden) {
				$([document.documentElement, document.body]).animate( {
					scrollTop: $('#show-smart-ids').offset().top
				}, 1400);
			}

			const http = new XMLHttpRequest();
			const url = 'loadConVisits.php?from='+ fromTs +'&dt='+ dt + (per10 ? '&per10=1' : '');
			var curDt = dt;

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
						var program = res['program'], visits = res['visits'], from = parseInt(res['from']), to = parseInt(res['to']);
						var imgs = ['images/user-black.png', 'images/user-business-boss.png', 'images/user-business-gray.png', 'images/user-business.png', 'images/user-female.png', 'images/user-gray-female.png', 'images/user-gray.png', 'images/user-green.png', 'images/user-red.png', 'images/user-thief.png'];
						var colors = ['blue','green','orange','purple','none'];
						var s = '', i = 0, minTs = parseInt(res['minTs']), maxTs = parseInt(res['maxTs'])-1800, cts = parseInt(res['from']);
						var plWidth = $('#plan-hours').width();

						$('#total-ids').html('('+ visits.length +')');

						$(res['hours']).each(function(i, h) {
							var ts = res['tss'][i];
							s += '<li '+ leftStyle(minTs, ts, plWidth) +'>'+ h +'</li>';
						});
						$('#plan-hours').append(s);

						s = '';
						$(visits).each(function(i, v) {
							var img = imgs[getRandomInt(imgs.length)], id = parseInt(v['id']);
							var color = colors[getRandomInt(colors.length)], style= '';
							var ts = parseInt(v['intime']), end = parseInt(v['outtime']);
							var stm = v['stm'];
							var etm = v['etm'];
							/*
							var em = v['em'];
							var eh = v['eh'];

							if (em == 60) {
								eh++;
								em = 0;
							}
							if (end > maxTs) {
								eh = 20;
								em = 0;
							}

							var cl = eh;
							if (parseInt(em) > 0)
								cl += '-'+ em;

							//if (msh == meh)
								//style = 'style="color: #666"';
							 */
							//s += '<li><span><a href="show-id.php?id='+ v['id'] +'&ts='+ (ts - 1) +'" target="_blank"><img src="'+ img +'" width="16" height="16"> '+ v['id'] +' ('+ v['ip'] +')</a></span>';
							s += '<li><span'+ (v['visited'] ? ' style="background: #bbffbb;"':'') +'><a href="show-id.php?id='+ v['smartid'] +'&ts='+ (ts - 1) +'" target="_blank"><img src="'+ img +'" width="16" height="16"> '+ v['smartid'] +'</a></span>';
							s += '<ul>';
							s += '<li class="current-time" '+ leftStyle(minTs, cts, plWidth) +'></li>';
							s += '<li class="program-time" '+ leftStyle(minTs, fromTs, plWidth) +'></li>';
							s += '<li class="program-time" '+ leftStyle(minTs, toTs, plWidth) +'></li>';
							s += '<li class="event-'+ color +'" '+ visitStyle(minTs, maxTs, ts, end, plWidth) +'><a '+ style +' href="javascript:void(0)">'+ stm +' - '+ etm +' ('+ getDuration(end - ts) +')</a></li>';
							//s += '<li class="event-'+ color +' to-'+ cl +'" '+ visitStyle(minTs, maxTs, ts, end, plWidth) +'><a '+ style +' href="javascript:void(0)">'+ stm +' - '+ etm +'</a></li>';
							s += '</ul>';
							s += '</li>';
						});
						$('#tv-plan').append(s);

						$('#plan-loader').hide();

						if (idsHidden) {
							$([document.documentElement, document.body]).animate( {
								scrollTop: $('#show-smart-ids').offset().top
							}, 1400);
						}
						idsHidden = false;
					}
				}
			};
		}

		// Demo modal
		function openModal()
		{
			$.modal({
				content: '<p>This is an example of modal window. You can open several at the same time (click button below!), move them and resize them.</p>'+
						  '<p>The plugin provides several other functions to control them, try below:</p>'+
						  '<ul class="simple-list with-icon">'+
						  '    <li><a href="javascript:void(0)" onclick="$(this).getModalWindow().setModalTitle(\'\')">Remove title</a></li>'+
						  '    <li><a href="javascript:void(0)" onclick="$(this).getModalWindow().setModalTitle(\'New title\')">Change title</a></li>'+
						  '    <li><a href="javascript:void(0)" onclick="$(this).getModalWindow().loadModalContent(\'ajax-modal.html\')">Load Ajax content</a></li>'+
						  '</ul>',
				title: 'Example modal window',
				maxWidth: 500,
				buttons: {
					'Open new modal': function(win) { openModal(); },
					'Close': function(win) { win.closeModal(); }
				}
			});
		}

	function showBrands() {
		var w = window.screen.width / 2, h = window.screen.height / 2;

		$.modal({
			content: '<div id="chart_div_c" style="height: 330px;"></div>',
			title: 'Countries',
			width: w,
			height: h,
			buttons: {
				'Close': function(win) { win.closeModal(); }
			}
		});

		var data = new google.visualization.arrayToDataTable(<?php echo $jsBrands?>);

		googleChart = new google.visualization.ChartWrapper();

		googleChart.setContainerId('chart_div_c');
		googleChart.setChartType('PieChart');
		googleChart.setDataTable(data);
		googleChart.setOptions({
			title: 'Viewers by brands',
			width: w,
			height: h,
			is3D: true,
			legend: 'right',
			yAxis: {title: '(percent)'}
		});
		googleChart.draw();
		console.log(h);
	}

	function showCountries() {
		var w = window.screen.width / 2, h = window.screen.height / 2;

		$.modal({
			content: '<div id="chart_div_c" style="height: 330px;"></div>',
			title: 'Countries',
			width: w,
			height: h,
			buttons: {
				'Close': function(win) { win.closeModal(); }
			}
		});

		var data = new google.visualization.arrayToDataTable(<?php echo $jsCountries?>);

		googleChart = new google.visualization.ChartWrapper();

		googleChart.setContainerId('chart_div_c');
		googleChart.setChartType('PieChart');
		googleChart.setDataTable(data);
		googleChart.setOptions({
			title: 'Viewers by country',
			width: w,
			height: h,
			is3D: true,
			legend: 'right',
			yAxis: {title: '(percent)'}
		});
		googleChart.draw();
	}

	</script>
</article>

	<footer>
		<div class="float-right">
			<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>
		</div>
		
	</footer>
</body>
</html>
