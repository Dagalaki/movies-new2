<?php
$headers = 'From: d.chatzidakis@realtv-media.de' . "\r\n";

$r = mail("d.chatzidakis@anixa.gr", "Alert ---", "Its just a test", $headers);

if (!$r)
	echo "Failed to send email\n";
?>
