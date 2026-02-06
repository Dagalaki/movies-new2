<?php
$date = new DateTime();
$date->sub(new DateInterval('P1M1D'));
echo $date->format('Y-m-d') . "\n";
?>
