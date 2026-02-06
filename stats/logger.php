<?php
// load nginx's log the last N lines and find latest visits
$deb = 0;

function tail($filename, $lines = 10, $buffer = 4096) {
    // Open the file
    $f = fopen($filename, "rb");

    // Jump to last character
    fseek($f, -1, SEEK_END);

    // Read it and adjust line number if necessary
    // (Otherwise the result would be wrong if file doesn't end with a blank line)
    if(fread($f, 1) != "\n") $lines -= 1;

    // Start reading
    $output = '';
    $chunk = '';

    // While we would like more
    while(ftell($f) > 0 && $lines >= 0) {
        // Figure out how far back we should jump
        $seek = min(ftell($f), $buffer);

        // Do the jump (backwards, relative to where we are)
        fseek($f, -$seek, SEEK_CUR);

        // Read a chunk and prepend it to our output
        $output = ($chunk = fread($f, $seek)).$output;

        // Jump back to where we started reading
        fseek($f, -mb_strlen($chunk, '8bit'), SEEK_CUR);

        // Decrease our line counter
        $lines -= substr_count($chunk, "\n");
    }

    // While we have too many lines
    // (Because of buffer size we might have read too many)
    while($lines++ < 0) {
        // Find first newline and remove all text before that
        $output = substr($output, strpos($output, "\n") + 1);
    }

    // Close file and return
    fclose($f);
    return $output;
}
$lines = array_reverse(explode("\n", tail('/var/log/nginx/access.log', 6000)));
$from = time() - 100;
$to = time();

if ($deb) {
	echo "got ", count($lines). " lines\n";
	echo "from ". date('r', $from). " to ". date('r'). "\n";
}

$ips = []; $ids = [];
foreach ($lines as $s) {
	$m = explode('@', $s);
	if (count($m)) {
		if (strpos($m[2], 'GET /save.php') === false)
			continue;

		$ip = $m[0];
		$ts = strtotime($m[1]);
		$vars = explode('&', $m[2]);
		$id = '';

		if ($ts < $from)
			continue;

		// from vars get piwik id and resolution
		foreach ($vars as $v) {
			$e = explode('=', $v);

			if ($e[0] == '_id') {
				$id = $e[1];
				break;
			}
		}

		if (!$id) {
			//echo "id not found:\n". $m[2];
			//print_r($vars);
			continue;
		}

		$diff = $to - $ts;
		$key = round($diff / 10);

		if (0 && $ip == '217.149.165.59') echo date('r', $ts). " diff ". $diff ." mod ". $key ."\n";

		if (!isset($ips[$key]))
			$ips[$key] = [];
		$ips[$key][] = $ip;

		if (!isset($ids[$key]))
			$ids[$key] = [];
		$ids[$key][] = $id;
	}
}
if ($deb) {
	//print_r($ips);
	//exit;
}
$searchId = '';
if (isset($_COOKIE['searchId']))
	$searchId = $_COOKIE['searchId'];

?>
<html>
<head>
<title>IP-Logger</title>
<style>

table {
  border-collapse: collapse;
  border: 1px solid #ddd;
  width: 100%;
}

table, th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

.found {
	background-color: #92de82;
}

tr:hover {background-color: #e2eff5;}
tr:nth-child(even) {background-color: #f2f2f2;} 

</style>
	<script src="js/libs/jquery-1.11.3.min.js"></script>
<script>

function search_id() {
	var id = $('#searchId').val(), found = 0;

	$($('table')[0]).find('tr').each(function(i, el) {
		$(el).find('td').each(function(j, td) {
			var a = $(td).text().split(' ');

			if (a[1] === id) {
				found++;
				$(td).addClass('found');
			} else
				$(td).removeClass('found');
		});
	});
	$('#found-results').text(found +' IDs found');
	document.cookie = 'searchId='+ id;
}

var timer, state = 1;

function toggle() {
	if (state == 1) {
		timer = setInterval(relo, 10000);
		document.getElementById("toggleButton").innerHTML = "Stop";
		state = 0;
	} else {
		clearInterval(timer);
		document.getElementById("toggleButton").innerHTML = "Continue";
		state = 1;
	}
<?php
if ($searchId) {
	echo "$('#searchId').val('". $searchId ."');\n";
	echo "search_id();\n";
}
?>
}

function relo() {
    location.reload();
}
</script>
</head>
<body onload="toggle();">


<h2>Number of latest unique IP addresses in 10 secs Interval: <button class="button" id="toggleButton" onclick="toggle()">Button</button>
<span style="margin-left: 15%;"><input style="width: 18em;" type="text" name="searchId" id="searchId"> <button class="button" onclick="search_id()">Search ID</button></span>
<span style="margin-left: 5%;" id="found-results"></span>
<h2>
<table>
<tr>
<?php 
for ($i = 0; $i < 10; $i++)
	echo '<th>'. date('H:i:s', $to - $i*10) .'<br>('. count($ips[$i]) .')</th>';

echo "</tr>";

// find maxrow
$mrow = 0;
foreach ($ips as $v)
	$mrow = max($mrow, count($v));

for ($j = 0; $j < $mrow; $j++) {
	echo '<tr>';

	for ($i = 0; $i < 10; $i++)
		echo '<td>'. $ips[$i][$j] .' '. $ids[$i][$j] .'</td>';
	echo '</tr>';
}

echo ("</table>");



?>
</body></html>
