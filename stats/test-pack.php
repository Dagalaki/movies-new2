<?php
$ina = array('393653924616151d', '70e95d668adbc97a', '1eeb367bb02ff1f4', '1sasadsdsdsfsdfdffds', '32342sdsdfdfsfdf', '4444666677777', 'alalallalalaa', 'bzbzbzbzbzbzbzb');
echo 'before ', strlen(implode(',', $ina))."\n";
$data = bzcompress(implode(',', $ina));

echo strlen($data)."\n";
$a = bzdecompress($data);
print_r($a);
exit;

$ina = array(12345678, 1212121212, 919021901);
$data = pack('I*', ...$ina);
echo strlen($data)."\n";
$a = unpack('I*', $data);
print_r($a);
