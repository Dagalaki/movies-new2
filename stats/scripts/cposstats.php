<?php
require("/var/www/html/stats/config.php");

$res = $mysqli->query("SELECT smartid, channelpos FROM redbutton.access_archiv WHERE intime > UNIX_TIMESTAMP('2021-10-12 00:00:00') AND cookie > 0 AND smartid > 0 GROUP BY smartid ");
echo $mysqli->error;
echo "Got ". $res->num_rows ." rows for channelpos\n";
$t = 0; $cpos = []; $brands; $models = []; $model2brand = [];
$cposBrands = []; $cposModels = [];

while ($row = $res->fetch_assoc()) {
	$pos = (int)$row['channelpos'];
	$id = (int)$row['smartid'];

	if (!isset($cpos[$pos]))
		$cpos[$pos] = 1;
	else
		$cpos[$pos]++;

	$ires = $mysqli->query("SELECT info FROM infos WHERE id = $id");
	if ($row = $ires->fetch_assoc()) {
		$js = json_decode($row['info']);

		if ($js->brand) {
			if (!isset($cposBrands[$pos])) {
				$cposBrands[$pos] = [];

				if (!isset($cposBrands[$pos][$js->brand]))
					$cposBrands[$pos][$js->brand] = 1;
				else
					$cposBrands[$pos][$js->brand]++;
			} else {
				if (!isset($cposBrands[$pos][$js->brand]))
					$cposBrands[$pos][$js->brand] = 1;
				else
					$cposBrands[$pos][$js->brand]++;
			}

			if (!isset($brands[$js->brand]))
				$brands[$js->brand] = 1;
			else
				$brands[$js->brand]++;
		}

		if ($js->model) {
			$model2brand[$js->model] = $js->brand;
			if (!isset($models[$js->model]))
				$models[$js->model] = 1;
			else
				$models[$js->model]++;

			if (!isset($cposModels[$pos])) {
				$cposModels[$pos] = [];
				if (!isset($cposModels[$pos][$js->model]))
					$cposModels[$pos][$js->model] = 1;
				else
					$cposModels[$pos][$js->model]++;
			} else {
				if (!isset($cposModels[$pos][$js->model]))
					$cposModels[$pos][$js->model] = 1;
				else
					$cposModels[$pos][$js->model]++;
			}
		}
		//echo "brand ". $js->brand ." model ". $js->model ."\n";
	}

	if ($t % 2000 == 0)
		echo "$t...\n";
	$t++;
}
//print_r($cposBrands); print_r($cposModels); exit;
$tot = 0;
foreach ($cposBrands as $pos=>$br) {
	foreach ($br as $brand=>$cnt) {
		$tot+=$cnt;

		$mysqli->query("REPLACE INTO cpos_brands SET channelpos = $pos, brand = '$brand', cnt = $cnt");
		if ($mysqli->error) {
			echo("REPLACE INTO cpos_brands SET channelpos = $pos, brand = '$brand', cnt = $cnt\n");
			echo $mysqli->error;
			exit;
		}
	}
}
echo "tot = $tot\n";
$tot = 0;
foreach ($cposModels as $pos=>$mods) {
	foreach ($mods as $model=>$cnt) {
		$tot+=$cnt;

		$mysqli->query("REPLACE INTO cpos_models SET channelpos = $pos, model = '". $mysqli->real_escape_string($model) ."', cnt = $cnt");
		if ($mysqli->error) {
			echo("REPLACE INTO cpos_models SET channelpos = $pos, model = '$model', cnt = $cnt\n");
			echo $mysqli->error;
			exit;
		}
	}
}
echo "tot = $tot\n";
$tot = 0;
foreach ($brands as $brand=>$cnt) {
	$tot+=$cnt;
	$mysqli->query("REPLACE INTO brands SET brand = '". $mysqli->real_escape_string($brand) ."', cnt = $cnt");
	if ($mysqli->error) {
		echo("REPLACE INTO brands SET brand = '$brand', cnt = $cnt");
		echo $mysqli->error;
		exit;
	}
}
echo "tot = $tot\n";
$tot = 0;
foreach ($models as $model=>$cnt) {
	$tot+=$cnt;
	$mysqli->query("REPLACE INTO models SET brand = '". $mysqli->real_escape_string($model2brand[$model]) ."', model = '". $mysqli->real_escape_string($model) ."', cnt = $cnt");
	if ($mysqli->error) {
		echo("REPLACE INTO models SET brand = '". $model2brand[$model] ."', model = '$model', cnt = $cnt");
		echo $mysqli->error;
		exit;
	}
}
echo "tot = $tot\n";
$mysqli->query("DELETE FROM channelpos");
$tot = 0;
foreach ($cpos as $pos=>$cnt) {
	$tot+=$cnt;
	$mysqli->query("REPLACE INTO channelpos SET pos = $pos, cnt = $cnt");
	if ($mysqli->error) {
		echo("REPLACE INTO channelpos SET pos = $pos, cnt = $cnt");
		echo $mysqli->error;
		exit;
	}
}
echo "tot = $tot\n";
