<?php
define('PASS', 'dio-43!');
$to = urldecode($_GET['to']);
$pass = urldecode($_GET['pass']);
$subject = urldecode($_GET['subject']);
$msg = urldecode($_GET['msg']);

if (strlen($to) > 4 && strlen($subject) > 2 && strlen($msg) > 4 && $pass == PASS) {
	$headers = "MIME-Version: 1.0\r\n"
		."From: service@anixehd.tv\r\n"
		. "X-Mailer: PHP ". phpversion()."\r\n"
		."Content-Type: text/html; format=fixed; charset=\"utf-8\"\r\nContent-Transfer-Encoding: 8bit\r\n";

	if (mail($to, $subject, $msg, $headers, "-fservice@anixehd.tv"))
		echo "Mail sent succesfully\n";
	else
		echo "Mail sent failed\n";
}
