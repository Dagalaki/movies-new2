<?php
define('PSSALT', 'G-%ff_Hx715.oR@');
define('USERHASH', 'd@c309#xc');
if (1 || $_SERVER['REMOTE_ADDR'] == '139.91.252.65')
	define('ENABLE_LOGIN', true);
else
	define('ENABLE_LOGIN', false);

date_default_timezone_set("Europe/Athens");

$sm_host = "127.0.0.1";
$sm_data = "stats_cretetv";
$sm_user = "stats";
$sm_pass = "stat-4512";

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");
function pass_encrypt($pass) {
        return crypt($pass, '$5$'. PSSALT .'$');
}
function insert_user($username, $pass) {
        global $mysqli;

        $mysqli->query("INSERT INTO users SET ts = UNIX_TIMESTAMP(), username ='". $username ."', pass = '". pass_encrypt($pass) ."' ON DUPLICATE KEY UPDATE pass = '". pass_encrypt($pass) ."'");
        $mysqli->error;
}
function login($user, $action) {
	global $mysqli;
	$ip= isset( $_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:"127.0.0.2" ;

        $mysqli->query("INSERT INTO logins SET ts = UNIX_TIMESTAMP(), username ='". $user ."', ip = INET_ATON('". $ip ."'), action = '". $action ."'");
        echo $mysqli->error;
}
?>
