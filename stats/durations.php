<?php
$pg = 1;
$perPage = 50;
$lastPg =  0;

if (isset($_GET['pg']))
	$pg = (int)$_GET['pg'];

function getDuration($durationInSeconds) {

  $duration = '';
  $days = floor($durationInSeconds / 86400);
  $durationInSeconds -= $days * 86400;
  $hours = floor($durationInSeconds / 3600);
  $durationInSeconds -= $hours * 3600;
  $minutes = floor($durationInSeconds / 60);
  $seconds = $durationInSeconds - $minutes * 60;

  if($days > 0) {
    $duration .= $days . ' days';
  }
  if($hours > 0) {
    $duration .= ' ' . $hours . ' hours';
  }
  if($minutes > 0) {
    $duration .= ' ' . $minutes . ' minutes';
  }
  if($seconds > 0) {
    $duration .= ' ' . $seconds . ' seconds';
  }
  return $duration;
}

date_default_timezone_set("Europe/Berlin");

$sm_host = "localhost";
$sm_data = "netflow";
$sm_user = "netflow";
$sm_pass = "123";
$total = 0;

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");

$res = $mysqli->query("SELECT SQL_CALC_FOUND_ROWS id, ts, duration FROM durations ORDER BY ts DESC LIMIT ". ($pg -1) * $perPage . ','. $perPage);
$r = $mysqli->query("SELECT FOUND_ROWS()");
if ($n = $r->fetch_row()) {
	$total = $n[0];
	$lastPg = ceil($total / $perPage);
	if ($lastPg > 100)
		$lastPg = 100;
}

?>
<!DOCTYPE html>
<!--[if lt IE 8 ]><html lang="en" class="no-js ie ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="no-js ie"><![endif]-->
<!--[if (gt IE 8)|!(IE)]><!-->
<html class=" js hashchange backgroundsize boxshadow cssgradients" firetv-fullscreen="false" lang="en"><!--<![endif]--><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>anixa HbbTV Ad Server</title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<!-- Global stylesheets -->
	<link href="css/reset.css" rel="stylesheet" type="text/css">
	<link href="css/common.css" rel="stylesheet" type="text/css">
	<link href="css/form.css" rel="stylesheet" type="text/css">
	<link href="css/standard.css" rel="stylesheet" type="text/css">
	
	<!-- Comment/uncomment one of these files to toggle between fixed and fluid layout -->
	<!--<link href="css/960.gs.css" rel="stylesheet" type="text/css">-->
	<link href="css/960.css" rel="stylesheet" type="text/css">
	
	<!-- Custom styles -->
	<link href="css/simple-lists.css" rel="stylesheet" type="text/css">
	<link href="css/block-lists.css" rel="stylesheet" type="text/css">
	<link href="css/planning.css" rel="stylesheet" type="text/css">
	<link href="css/table.css" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">
	
	<!-- Favicon -->
	<link rel="shortcut icon" type="image/x-icon" href="https://www.media-theia.de/images/favicon/favicon.ico">
	<link rel="icon" type="image/png" href="https://www.media-theia.de/images/favicon/favicon-large.png">
	
	<!-- Modernizr for support detection, all javascript libs are moved right above </body> for better performance -->
	<script src="js/modernizr.js"></script>
	<script src="js/amcharts4/core.js"></script>
	<script src="js/amcharts4/charts.js"></script>
	<script src="js/amcharts4/themes/animated.js"></script>
<style>
#chartdiv {
  width: 100%;
  height: 500px;
}
</style>
</head>

<body onload="load();">
	
	<!-- Header -->
	
	<!-- Server status -->
	<header><div class="container_12">
		
		<p id="skin-name"><small>anixa HbbTV Ad Server<br> Admin Menü<br> </small></p><center><small><a href="http://www.anixe.net/"><img src="images/anixa.png" style="margin-top:-20px" width="300" height="75"></a></small></center> <!---<strong>1.5</strong></p>
		<div class="server-info">Server: <strong>Apache 2.2.14</strong></div>
		<div class="server-info">Php: <strong>5.3.1</strong></div>--->
		
	</div></header>
	<!-- End server status -->
	
	<!-- Main nav -->
	<nav id="main-nav">
		
		<ul class="container_12">
			<li class="home current"><a href="#" title="Home">Home</a>
				<ul>
					<li class="current"><a href="#" title="Dashboard">Dashboard</a></li>
					<li><a href="#planning" title="My profile">My profile</a></li>
					<li class="with-menu"><a href="#" title="My settings">My settings</a>
						<div class="menu">
							<img src="images/menu-open-arrow.png" width="16" height="16">
							<ul>
								<li class="icon_address"><a href="#">Browse by</a>
									<ul>
										<li class="icon_blog"><a href="#">Blog</a>
											<ul>
												<li class="icon_alarm"><a href="#">Recents</a>
													<ul>
														<li class="icon_building"><a href="#">Corporate blog</a></li>
														<li class="icon_newspaper"><a href="#">Press blog</a></li>
													</ul>
												</li>
												<li class="icon_building"><a href="#">Corporate blog</a></li>
												<li class="icon_computer"><a href="#">Support blog</a></li>
												<li class="icon_search" id=""><a href="#">Search...</a></li>
											</ul>
										</li>
										<li class="icon_server"><a href="#">Website</a></li>
										<li class="icon_network"><a href="#">Domain</a></li>
									</ul>
								</li>
								<li class="icon_export"><a href="#">Export</a>
									<ul>
										<li class="icon_doc_excel"><a href="#">Excel</a></li>
										<li class="icon_doc_csv"><a href="#">CSV</a></li>
										<li class="icon_doc_pdf"><a href="#">PDF</a></li>
										<li class="icon_doc_image"><a href="#">Image</a></li>
										<li class="icon_doc_web"><a href="#">Html</a></li>
									</ul>
								</li>
								<li class="sep"></li>
								<li class="icon_refresh"><a href="#">Reload</a></li>
								<li class="icon_reset">Reset</li>
								<li class="icon_search"><a href="#">Search</a></li>
								<li class="sep"></li>
								<li class="icon_terminal"><a href="#">Custom request</a></li>
								<li class="icon_battery"><a href="#">Stats server load</a></li>
							</ul>
						</div>
					</li>
				</ul>
			</li>
			<li class="write"><a href="#simple_form" title="Write">Write</a>
				<ul>
					<li><a href="#simple_form" title="Articles">Articles</a></li>
					<li><a href="#simple_form" title="Add article">Add article</a></li>
					<li><a href="#simple_form" title="Posts">Posts</a></li>
					<li><a href="#simple_form" title="Add post">Add post</a></li>
				</ul>
			</li>
			<li class="comments"><a href="#tab-comments" title="Comments">Comments</a>
				<ul>
					<li><a href="#tab-comments" title="Manage">Manage</a></li>
					<li><a href="#tab-comments" title="Spams">Spams</a></li>
				</ul>
			</li>
			<li class="medias"><a href="#arbo" title="Medias">Medias</a>
				<ul>
					<li><a href="#arbo" title="Browse">Browse</a></li>
					<li><a href="#arbo" title="Add file">Add file</a></li>
					<li><a href="#arbo" title="Manage">Manage</a></li>
					<li><a href="#arbo" title="Settings">Settings</a></li>
				</ul>
			</li>
			<li class="users"><a href="#grid" title="Users">Users</a>
				<ul>
					<li><a href="#grid" title="Browse">List</a></li>
					<li><a href="#grid" title="Add user">Add user</a></li>
					<li><a href="#grid" title="Settings">Settings</a></li>
				</ul>
			</li>
			<li class="stats"><a href="#web_stats" title="Stats">Stats</a></li>
			<li class="settings"><a href="#" title="Settings">Settings</a></li>
			<li class="backup"><a href="#" title="Backup">Backup</a></li>
		</ul>
	</nav>
	<!-- End main nav -->
	
	<!-- Sub nav -->
	<div id="sub-nav"><div class="container_12">
		
		<a href="#" title="Help" class="nav-button"><b>Help</b></a>
	
		<form id="search-form" name="search-form" method="post" action="old/search.html">
			<input name="s" id="s" title="Search admin..." autocomplete="off" type="text">
		</form>
	
	</div></div>
	<!-- End sub nav -->
	
	<!-- Status bar -->
	<div id="status-bar"><div class="container_12">
	
		<ul id="status-infos">
			<li class="spaced">Logged as: <strong>Admin</strong></li>
			<li>
				<a href="#" class="button" name="5 messages"><img src="images/mail.png" width="16" height="16"> <strong>5</strong></a>
				<div id="messages-list" class="result-block">
					<span class="arrow"><span></span></span>
					
					<ul class="small-files-list icon-mail">
						<li>
							<a href="#"><strong>10:15</strong> Please update...<br>
							<small>From: System</small></a>
						</li>
						<li>
							<a href="#"><strong>Yest.</strong> Hi<br>
							<small>From: Jane</small></a>
						</li>
						<li>
							<a href="#"><strong>Yest.</strong> System update<br>
							<small>From: System</small></a>
						</li>
						<li>
							<a href="#"><strong>2 days</strong> Database backup<br>
							<small>From: System</small></a>
						</li>
						<li>
							<a href="#"><strong>2 days</strong> Re: bug report<br>
							<small>From: Max</small></a>
						</li>
					</ul>
					
					<p id="messages-info" class="result-info"><a href="#">Go to inbox »</a></p>
				</div>
			</li>
			<li>
				<a href="#" class="button" title="25 comments"><img src="images/balloon.png" width="16" height="16"> <strong>25</strong></a>
				<div id="comments-list" class="result-block">
					<span class="arrow"><span></span></span>
					
					<ul class="small-files-list icon-comment">
						<li>
							<a href="#"><strong>Jane</strong>: I don't think so<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Ken_54</strong>: What about using a different...<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Jane</strong> Sure, but no more.<br>
							<small>On <strong>Another post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Max</strong>: Have you seen that...<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Anonymous</strong>: Good luck!<br>
							<small>On <strong>My first post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Sébastien</strong>: This sure rocks!<br>
							<small>On <strong>Another post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>John</strong>: Me too!<br>
							<small>On <strong>Third post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>John</strong> This can be solved by...<br>
							<small>On <strong>Another post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Jane</strong>: No prob.<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Anonymous</strong>: I had the following...<br>
							<small>On <strong>My first post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Anonymous</strong>: Yes<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Lian</strong>: Please make sure that...<br>
							<small>On <strong>Last post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Ann</strong> Thanks!<br>
							<small>On <strong>Last post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Max</strong>: Don't tell me what...<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Gordon</strong>: Here is an article about...<br>
							<small>On <strong>My another post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Lee</strong>: Try to reset the value first<br>
							<small>On <strong>Last title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Lee</strong>: Sure!<br>
							<small>On <strong>Second post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Many</strong> Great job, keep on!<br>
							<small>On <strong>Third post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>John</strong>: I really like this<br>
							<small>On <strong>First title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Paul</strong>: Hello, I have an issue with...<br>
							<small>On <strong>My first post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>June</strong>: Yuck.<br>
							<small>On <strong>Another title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Jane</strong>: Wow, sounds amazing, do...<br>
							<small>On <strong>Another title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Esther</strong>: Man, this is the best...<br>
							<small>On <strong>Another post</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>Max</strong>: Thanks!<br>
							<small>On <strong>Post title</strong></small></a>
						</li>
						<li>
							<a href="#"><strong>John</strong>: I'd say it is not safe...<br>
							<small>On <strong>My first post</strong></small></a>
						</li>
					</ul>
					
					<p id="comments-info" class="result-info"><a href="#">Manage comments »</a></p>
				</div>
			</li>
			<li><a href="https://www.media-theia.de/old/login.html" class="button red" title="Logout"><span class="smaller">LOGOUT</span></a></li>
		</ul>
		
		<!-- v1.5: you can now add class red to the breadcrumb -->
		<ul id="breadcrumb">
			<li><a href="#" title="Home">Home</a></li>
			<li><a href="#" title="Dashboard">Dashboard</a></li>
		</ul>
	
	</div></div>
	<!-- End status bar -->
	
	<article class="container_12">

		<section class="grid_12">
			<div class="block-border"><div class="block-content">
				<h1>Durations</h1>
				<div>
					<div class="block-controls">
						<ul class="controls-buttons">
<?php
if ($pg > 1) {
	echo('<li><a href="?pg='. ($pg-1) .'" title="Previous">PREV ');
	echo('<img src="images/navigation-180.png" height="16" width="16"></a></li>');
}
$start = ($pg - 4 > 0 ? $pg - 4 : 1);
$end = ($pg + 4 < $total ? $pg + 5 : $total);

for ($i = $start ; $i < $end; ++$i) {
	echo('<li><a '. ($i == $pg ? ' class="current"':'') .' href="?pg='. $i .'" title="'. $i .'">'. $i .'</a></li>');
}

if (0 && $lastPg) {
	//echo('...');
	echo('<li><a href="?pg='. $lastPg .'" title="'. $lastPg .'">...'. $lastPg .'</a></li>');
}

if ($pg+1 < $total) {
	echo('<li><a href="?pg='. ($pg+1) .'" title="Next">Next ');
	echo('<img src="images/navigation.png" height="16" width="16"></a></li>');
}

?>
						</ul>
					</div>
					<div class="infos clearfix">
						<h2 class="bigger">Latest visits with duration</h2>
					</div>

					<table class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell"></th>
							<th scope="col">ID</th>
							<th scope="col">Date time</th>
							<th scope="col">Duration</th>
						</tr>
					</thead>
					<tbody>
<?php
$k = ($pg - 1) * $perPage;
while ($row = $res->fetch_assoc()) {
	$dur = $row['duration'];
	$time = '';
	if ($dur)
		$time = getDuration($dur);

	echo ("<tr>\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo ("<td>". $row['id'] ."</td>\n");
	echo ("<td>". date("d M H:i:s", $row['ts']) ."</td>\n");
	echo ("<td>". $time ."</td>\n");
	echo ("</tr>\n");
	++$k;
}
?>
					</tbody>
					</table>
				</div>

			</div></div>
		</section>
	</article>
	<div class="clear"></div>
</body></html>
