<?php
require_once '/var/www/html/stats-nginx/config.php';
require_once '/var/www/html/stats-nginx/device-detector/autoload.php';
require_once '/var/www/html/stats-nginx/spyc/Spyc.php';
require '/var/www/html/stats-nginx/GeoIP2-php/geoip2.phar';
use DeviceDetector\DeviceDetector;
use DeviceDetector\Parser\Device\DeviceParserAbstract;
use GeoIp2\Database\Reader;

$reader = new Reader('/var/www/html/stats-nginx/GeoIP2-php/maxmind-db/GeoLite2-City.mmdb');
$ip = '139.91.252.65';
$ipr = $reader->city($ip);
print_r($ipr);

echo "city for ". $ipr->city->name ."\n";
