<?php
if (!isset($_COOKIE['stats-best-userid'])) {
	header('location: /best-tv/stats/');
	exit;
}
require_once('config.php');
?>

<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>HbbTV Admin logins</title>

	<link href="css/reset.css" rel="stylesheet" type="text/css">
	<link href="css/common.css" rel="stylesheet" type="text/css">
	<link href="css/form.css" rel="stylesheet" type="text/css">
	<link href="css/standard.css?v4" rel="stylesheet" type="text/css">
	
	<link href="css/960.css" rel="stylesheet" type="text/css">
	
	<!-- Custom styles -->
	<link href="css/simple-lists.css" rel="stylesheet" type="text/css">
	<link href="css/block-lists.css" rel="stylesheet" type="text/css">
	<link href="css/planning.css" rel="stylesheet" type="text/css">
	<link href="css/table.css?v=3" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">
	
	<!-- Favicon -->
	<link rel="shortcut icon" type="image/x-icon" href="https://www.media-theia.de/images/favicon/favicon.ico">
	<link rel="icon" type="image/png" href="https://www.media-theia.de/images/favicon/favicon-large.png">
</style>
</head>
<body>
	<article class="container_12">
		<section class="grid_12">
			<div class="block-border"><div class="block-content">
				<h1>Admin logins</h1>
	<table class="table" width="100%" cellspacing="0">
	<thead>
		<tr>
			<th scope="col"></th>
			<th scope="col">Username</th>
			<th scope="col">Date</th>
			<th scope="col">IP</th>
			<th scope="col">Action</th>
		</tr>
	</thead>
	<tbody>
<?php

$res = $mysqli->query("SELECT username, ts, INET_NTOA(ip), action FROM logins");
$i = 1;
while ($row = $res->fetch_row()) {
	echo '<tr>';
	echo '<th scope="row" class="table-check-cell">'. $i .'</th>';
	echo '<td>'. $row[0] .'</td>';
	echo '<td>'. date('d M H:i', $row[1]) .'</td>';
	echo '<td>'. $row[2] .'</td>';
	echo '<td>'. $row[3] .'</td>';
	echo '</tr>';
}
?>
	</tbody>
	</table>
	</div>
	</section>
	</article>
	<div class="clear"></div>
</body>
</html>
