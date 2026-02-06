<?php
// 20:01 90
// 20:02 100
//
// 21:01 133
//
// 22:01 309
// 22:02 270
//
// 00:01 183
// 00:02 153
// 00:03 160
// 00:04 150
date_default_timezone_set("Europe/Berlin");

$sm_host = "localhost";
$sm_data = "netflow";
$sm_user = "netflow";
$sm_pass = "123";

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");

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
	
</head>

<body>
	
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
	
	<div id="header-shadow"></div>
	<!-- End header -->
	
	<!-- Content -->
	<article class="container_12">
		
		<section class="grid_4">
			<!--<div class="block-border"><div class="block-content">-->
				<h1>Favourites</h1>
				
				<ul class="favorites no-margin with-tip" title="Context menu available!">
					
					<li>
						<img src="images/Info.png" width="48" height="48">
						<a href="#">Settings<br>
						<small>System &gt; Settings</small></a>
						<ul class="mini-menu">
							<li><a href="#" title="Move down"><img src="images/arrow-270.png" width="16" height="16"></a></li>
							<li><a href="#" title="Delete"><img src="images/cross-circle.png" width="16" height="16"> Delete</a></li>
						</ul>
					</li>
					
					<li>
						<img src="images/Line-Chart.png" width="48" height="48">
						<a href="#web_stats">Bandwidth usage<br>
						<small>Stats &gt; Server &gt; Bandwidth usage</small></a>
						<ul class="mini-menu">
							<li><a href="#" title="Move up"><img src="images/arrow-090.png" width="16" height="16"></a></li>
							<li><a href="#" title="Move down"><img src="images/arrow-270.png" width="16" height="16"></a></li>
							<li><a href="#" title="Delete"><img src="images/cross-circle.png" width="16" height="16"> Delete</a></li>
						</ul>
					</li>
					
					<li>
						<img src="images/Modify.png" width="48" height="48">
						<a href="#simple_form">New post<br>
						<small>Write &gt; New post</small></a>
						<ul class="mini-menu">
							<li><a href="#" title="Move up"><img src="images/arrow-090.png" width="16" height="16"></a></li>
							<li><a href="#" title="Move down"><img src="images/arrow-270.png" width="16" height="16"></a></li>
							<li><a href="#" title="Delete"><img src="images/cross-circle.png" width="16" height="16"> Delete</a></li>
						</ul>
					</li>
					
					<li>
						<img src="images/Pie-Chart.png" width="48" height="48">
						<a href="#web_stats">Browsers stats<br>
						<small>Stats &gt; Sites &gt; Browsers stats</small></a>
						<ul class="mini-menu">
							<li><a href="#" title="Move up"><img src="images/arrow-090.png" width="16" height="16"></a></li>
							<li><a href="#" title="Move down"><img src="images/arrow-270.png" width="16" height="16"></a></li>
							<li><a href="#" title="Delete"><img src="images/cross-circle.png" width="16" height="16"> Delete</a></li>
						</ul>
					</li>
					
					<li>
						<img src="images/Comment_002.png" width="48" height="48">
						<a href="#tab-comments">Manage comments<br>
						<small>Comments &gt; Manage comments</small></a>
						<ul class="mini-menu">
							<li><a href="#" title="Move up"><img src="images/arrow-090.png" width="16" height="16"></a></li>
							<li><a href="#" title="Delete"><img src="images/cross-circle.png" width="16" height="16"> Delete</a></li>
						</ul>
					</li>
					
				</ul>
				
				<form class="form" name="stats_options" id="stats_options" method="post" action="">
					<fieldset class="grey-bg no-margin">
						<legend>Add favourite</legend>
						<p class="input-with-button">
							<label for="simple-action">Select page</label>
							<select name="simple-action" id="simple-action">
								<option value="" selected="selected"></option>
								<option value="1">Page 1</option>
								<option value="2">Page 2</option>
							</select>
							<button type="button">Add</button>
						</p>
					</fieldset>
				</form>
				
			<!--</div></div>-->
		</section>
		
		<section class="grid_8">
			<div class="block-border"><div class="block-content">
				<!-- We could put the menu inside a H1, but to get valid syntax we'll use a wrapper -->
				<div class="h1 with-menu" id="web_stats">
					<h1>Web stats</h1>
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
											<li class="icon_search"><a href="#">Search...</a></li>
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
				</div>
			
				<div class="block-controls">
					
					<ul class="controls-tabs js-tabs same-height with-children-tip">
						<li><a href="#tab-stats" title="Charts"><img src="images/Bar-Chart_002.png" width="24" height="24"></a></li>
						<li><a href="#tab-comments" title="Comments"><img src="images/Comment.png" width="24" height="24"></a></li>
						<li><a href="#tab-medias" title="Medias"><img src="images/Picture.png" width="24" height="24"></a></li>
						<li><a href="#tab-users" title="Users"><img src="images/Profile_002.png" width="24" height="24"></a></li>
						<li><a href="#tab-infos" title="Informations"><img src="images/Info_002.png" width="24" height="24"></a></li>
					</ul>
					
				</div>
				
				<form class="form" id="tab-stats" method="post" action="">
					
					<fieldset class="grey-bg">
						<legend><a href="#">Options</a></legend>
						
						<div class="float-left gutter-right">
							<label for="stats-period">Period</label>
							<span class="input-type-text"><input name="stats-period" id="stats-period" class="datepicker" type="text"><img src="images/calendar-month.png" width="16" height="16"></span>
						</div>
						<div class="float-left gutter-right">
							<span class="label">Display</span>
							<p class="input-height grey-bg">
								<input name="stats-display[]" id="stats-display-0" value="0" type="checkbox">&nbsp;<label for="stats-display-0">Views</label> 
								<input name="stats-display[]" id="stats-display-1" value="1" type="checkbox">&nbsp;<label for="stats-display-1">Unique visitors</label>
							</p> 
						</div>
						<div class="float-left gutter-right">
							<span class="label">Sites</span>
							<p class="input-height grey-bg">
								<input name="stats-sites" id="stats-sites-0" value="0" type="radio">&nbsp;<label for="stats-sites-0">Group</label> 
								<input name="stats-sites" id="stats-sites-1" value="1" type="radio">&nbsp;<label for="stats-sites-1">Separate</label>
							</p>
						</div>
						<div class="float-left">
							<span class="label">Mode</span>
							<select name="stats-sites" id="stats-sites-0" class="chart-type">
								<option value="0" selected="selected">Bars</option>
								<option value="1">Lines</option>
							</select>
						</div>
					</fieldset>
					<div id="chart_div" style="height:330px;"></div>
					
				</form>
				
				<div id="tab-comments" class="with-margin">
					<!-- Content is loaded dynamically at bottom in the javascript section -->
				</div>
				
				<div id="tab-medias" class="with-margin">
					<p>Medias</p>
				</div>
				
				<div id="tab-users" class="with-margin">
					<p>Users</p>
				</div>
				
				<div id="tab-infos" class="with-margin">
					<p>Infos</p>
				</div>
				
				<ul class="message no-margin">
					<li>This is an <strong>information message</strong>, inside a box</li>
				</ul>
				
			</div></div>
		</section>
		
		<div class="clear"></div>
	</article>
	
	<!-- End content -->
	
	<footer>
		
		<div class="float-left">
			<a href="#" class="button">Help</a>
			<a href="#" class="button">About</a>
		</div>
		
		<div class="float-right">
			<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>
		</div>
		
	</footer>
	
	<script src="js/libs/jquery-1.11.3.min.js"></script>
	<script>
		jQuery.browser = {};
		(function () {
			    jQuery.browser.msie = false;
			    jQuery.browser.version = 0;
			    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
				    jQuery.browser.msie = true;
				    jQuery.browser.version = RegExp.$1;
			    }
		})();
	</script>

	<!--
	
	Updated as v1.5:
	Libs are moved here to improve performance
	
	-->
	<!-- remove if you do not need older browsers detection -->
	<!-- Generic libs
	<script src="js/old-browsers.js"></script>	
	 -->
	<script src="js/jquery_006.js"></script>
	<!-- Template libs -->
	<script src="js/jquery_003.js"></script>
	<script src="js/searchField.js"></script>
	<script src="js/common.js"></script>
	<script src="js/standard.js"></script>

	<script src="js/jquery_002.js"></script>
	<script src="js/jquery_004.js"></script>
	<script src="js/jquery.js"></script>
	
	<!-- Custom styles lib -->
	<script src="js/list.js"></script>
	
	<!-- Plugins -->
	<script src="js/jquery_007.js"></script>
	<script src="js/jquery_005.js"></script>
	
	<!-- Charts library -->
	<!--Load the AJAX API-->
	<script src="js/jsapi.js"></script>
	<script>
		
		/*
		 * This script is dedicated to building and refreshing the demo chart
		 * Remove if not needed
		 */
		
		// Load the Visualization API and the piechart package.
		google.load('visualization', '1', {'packages':['corechart']});
		
		// Add listener for tab
		$('#tab-stats').onTabShow(function() { drawVisitorsChart(); }, true);
		
		// Handle viewport resizing
		var previousWidth = $(window).width();
		$(window).resize(function()
		{
			if (previousWidth != $(window).width())
			{
				drawVisitorsChart();
				previousWidth = $(window).width();
			}
		});
		
		// Demo chart
		function drawVisitorsChart() {

			// Create our data table.
			var data = new google.visualization.DataTable();
			var raw_data = [['Website', 50, 73, 104, 129, 146, 176, 139, 149, 218, 194, 96, 53],
							['Shop', 82, 77, 98, 94, 105, 81, 104, 104, 92, 83, 107, 91],
							['Forum', 50, 39, 39, 41, 47, 49, 59, 59, 52, 64, 59, 51],
							['Others', 45, 35, 35, 39, 53, 76, 56, 59, 48, 40, 48, 21]];
			//var raw_data = [['Website', 50, 73, 104, 129, 146, 176, 139, 149, 218, 194, 96, 53]];
			
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			
			data.addColumn('string', 'Month');
			for (var i = 0; i < raw_data.length; ++i)
			{
				data.addColumn('number', raw_data[i][0]);	
			}
			
			data.addRows(months.length);
			
			for (var j = 0; j < months.length; ++j)
			{	
				data.setValue(j, 0, months[j]);	
			}
			for (var i = 0; i < raw_data.length; ++i)
			{
				for (var j = 1; j < raw_data[i].length; ++j)
				{
					data.setValue(j-1, i+1, raw_data[i][j]);	
				}
			}
			
			// Create and draw the visualization.
			var div = $('#chart_div');
			//googleChart = new google.visualization.ColumnChart(div.get(0)).draw(data, {
			googleChart = new google.visualization.ChartWrapper();

			googleChart.setContainerId('chart_div');
			googleChart.setChartType('ColumnChart');
			googleChart.setDataTable(data);
			googleChart.setOptions({
				title: 'Monthly unique visitors count',
				width: div.width(),
				height: 330,
				legend: 'right',
				yAxis: {title: '(thousands)'}
			});
			googleChart.draw();
			
			// Message
			notify('Chart updated');
		};
		
	</script>
	
	<script>
		
		/*
		 * This script shows how to setup the various template plugins and functions
		 */
		
		$(document).ready(function()
		{
			/*
			 * Example context menu
			 */
			
			// Context menu for all favorites
			$('.favorites li').bind('contextMenu', function(event, list)
			{
				var li = $(this);
				
				// Add links to the menu
				if (li.prev().length > 0)
				{
					list.push({ text: 'Move up', link:'#', icon:'up' });
				}
				if (li.next().length > 0)
				{
					list.push({ text: 'Move down', link:'#', icon:'down' });
				}
				list.push(false);	// Separator
				list.push({ text: 'Delete', link:'#', icon:'delete' });
				list.push({ text: 'Edit', link:'#', icon:'edit' });
			});
			
			// Extra options for the first one
			$('.favorites li:first').bind('contextMenu', function(event, list)
			{
				list.push(false);	// Separator
				list.push({ text: 'Settings', icon:'terminal', link:'#', subs:[
					{ text: 'General settings', link: '#', icon: 'blog' },
					{ text: 'System settings', link: '#', icon: 'server' },
					{ text: 'Website settings', link: '#', icon: 'network' }
				] });
			});
			
			/*
			 * Dynamic tab content loading
			 */
			
			$('#tab-comments').onTabShow(function()
			{
				$(this).loadWithEffect('ajax-tab.html', function()
				{
					notify('Content loaded via ajax');
				});
			}, true);
			
			/*
			 * Table sorting
			 */
			
			// A small classes setup...
			$.fn.dataTableExt.oStdClasses.sWrapper = 'no-margin last-child';
			$.fn.dataTableExt.oStdClasses.sInfo = 'message no-margin';
			$.fn.dataTableExt.oStdClasses.sLength = 'float-left';
			$.fn.dataTableExt.oStdClasses.sFilter = 'float-right';
			$.fn.dataTableExt.oStdClasses.sPaging = 'sub-hover paging_';
			$.fn.dataTableExt.oStdClasses.sPagePrevEnabled = 'control-prev';
			$.fn.dataTableExt.oStdClasses.sPagePrevDisabled = 'control-prev disabled';
			$.fn.dataTableExt.oStdClasses.sPageNextEnabled = 'control-next';
			$.fn.dataTableExt.oStdClasses.sPageNextDisabled = 'control-next disabled';
			$.fn.dataTableExt.oStdClasses.sPageFirst = 'control-first';
			$.fn.dataTableExt.oStdClasses.sPagePrevious = 'control-prev';
			$.fn.dataTableExt.oStdClasses.sPageNext = 'control-next';
			$.fn.dataTableExt.oStdClasses.sPageLast = 'control-last';
			
			// Apply to table
			$('.sortable').each(function(i)
			{
				// DataTable config
				var table = $(this),
					oTable = table.dataTable({
						/*
						 * We set specific options for each columns here. Some columns contain raw data to enable correct sorting, so we convert it for display
						 * @url http://www.datatables.net/usage/columns
						 */
						aoColumns: [
							{ bSortable: false },	// No sorting for this columns, as it only contains checkboxes
							{ sType: 'string' },
							{ bSortable: false },
							{ sType: 'numeric', bUseRendered: false, fnRender: function(obj) // Append unit and add icon
								{
									return '<small><img src="images/icons/fugue/image.png" width="16" height="16" class="picto"> '+obj.aData[obj.iDataColumn]+' Ko</small>';
								}
							},
							{ sType: 'date' },
							{ sType: 'numeric', bUseRendered: false, fnRender: function(obj) // Size is given as float for sorting, convert to format 000 x 000
								{
									return obj.aData[obj.iDataColumn].split('.').join(' x ');
								}
							},
							{ bSortable: false }	// No sorting for actions column
						],
						
						/*
						 * Set DOM structure for table controls
						 * @url http://www.datatables.net/examples/basic_init/dom.html
						 */
						sDom: '<"block-controls"<"controls-buttons"p>>rti<"block-footer clearfix"lf>',
						
						/*
						 * Callback to apply template setup
						 */
						fnDrawCallback: function()
						{
							this.parent().applyTemplateSetup();
						},
						fnInitComplete: function()
						{
							this.parent().applyTemplateSetup();
						}
					});
				
				// Sorting arrows behaviour
				table.find('thead .sort-up').click(function(event)
				{
					// Stop link behaviour
					event.preventDefault();
					
					// Find column index
					var column = $(this).closest('th'),
						columnIndex = column.parent().children().index(column.get(0));
					
					// Send command
					oTable.fnSort([[columnIndex, 'asc']]);
					
					// Prevent bubbling
					return false;
				});
				table.find('thead .sort-down').click(function(event)
				{
					// Stop link behaviour
					event.preventDefault();
					
					// Find column index
					var column = $(this).closest('th'),
						columnIndex = column.parent().children().index(column.get(0));
					
					// Send command
					oTable.fnSort([[columnIndex, 'desc']]);
					
					// Prevent bubbling
					return false;
				});
			});
			
			/*
			 * Datepicker
			 * Thanks to sbkyle! http://themeforest.net/user/sbkyle
			 */
			$('.datepicker').datepick({
				alignment: 'bottom',
				showOtherMonths: true,
				selectOtherMonths: true,
				renderer: {
					picker: '<div class="datepick block-border clearfix form"><div class="mini-calendar clearfix">' +
							'{months}</div></div>',
					monthRow: '{months}', 
					month: '<div class="calendar-controls" style="white-space: nowrap">' +
								'{monthHeader:M yyyy}' +
							'</div>' +
							'<table cellspacing="0">' +
								'<thead>{weekHeader}</thead>' +
								'<tbody>{weeks}</tbody></table>', 
					weekHeader: '<tr>{days}</tr>', 
					dayHeader: '<th>{day}</th>', 
					week: '<tr>{days}</tr>', 
					day: '<td>{day}</td>', 
					monthSelector: '.month', 
					daySelector: 'td', 
					rtlClass: 'rtl', 
					multiClass: 'multi', 
					defaultClass: 'default', 
					selectedClass: 'selected', 
					highlightedClass: 'highlight', 
					todayClass: 'today', 
					otherMonthClass: 'other-month', 
					weekendClass: 'week-end', 
					commandClass: 'calendar', 
					commandLinkClass: 'button',
					disabledClass: 'unavailable'
				}
			});
			/*
				* tab stats
				* change chart type
			 */
			$('.chart-type').change(function(event) {
				if (event.target.value == '1') {
					googleChart.setChartType('LineChart');
				} else {
					googleChart.setChartType('ColumnChart');
				}
				googleChart.draw();
				notify('Chart updated');
			});
		});
		
		// Demo modal
		function openModal()
		{
			$.modal({
				content: '<p>This is an example of modal window. You can open several at the same time (click button below!), move them and resize them.</p>'+
						  '<p>The plugin provides several other functions to control them, try below:</p>'+
						  '<ul class="simple-list with-icon">'+
						  '    <li><a href="javascript:void(0)" onclick="$(this).getModalWindow().setModalTitle(\'\')">Remove title</a></li>'+
						  '    <li><a href="javascript:void(0)" onclick="$(this).getModalWindow().setModalTitle(\'New title\')">Change title</a></li>'+
						  '    <li><a href="javascript:void(0)" onclick="$(this).getModalWindow().loadModalContent(\'ajax-modal.html\')">Load Ajax content</a></li>'+
						  '</ul>',
				title: 'Example modal window',
				maxWidth: 500,
				buttons: {
					'Open new modal': function(win) { openModal(); },
					'Close': function(win) { win.closeModal(); }
				}
			});
		}
	
	</script>


</body></html>
