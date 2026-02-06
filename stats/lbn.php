<?php
// add a lbanner request
require("config.php");

$ch = $_GET['ch'];
$cl = $_GET['cl'];
$co = $_GET['co'];
$bn = $_GET['bn'];
$yo = (int)$_GET['yo'];

if (!$ch || !$cl || !$co) {
	die('Error: missing parameter');
}

$q = "INSERT IGNORE INTO lbanner SET channel = '$ch', client = '$cl', login = '$co', button = '$bn', type = $yo, ts = UNIX_TIMESTAMP()";
$res = $mysqli->query($q);
if ($mysqli->error) {
	echo $mysqli->error;
	exit;
}
echo 'OK';
