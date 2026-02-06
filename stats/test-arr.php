<?php
function filtera($v) {
	global $prev;
	return !in_array($v, $prev);
}
$prev = [1,2,3,4,5,6];
$a = [3,8,6,1,9,11];

$a = array_filter($a, 'filtera');
print_r($a);
