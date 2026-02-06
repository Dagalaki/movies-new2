<?php
date_default_timezone_set("Europe/Berlin");
$mc = new Memcached(); 
$mc->addServer("localhost", 11211); 

//var_dump($mc->getOption(Memcached::OPT_COMPRESSION));
//print_r($mc->getStats());

$key  = 'test123';
$mc->set($key, 'hello cache world');
$res = $mc->get($key);
print_r($res);
?>
