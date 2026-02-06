<?php
//require('check-auth.php');
header('Content-Type: text/html; charset=utf-8');

$servername = "http://smarttv.anixa.tv/matomo";
$username = "admin";
$password = "matom0h#bbtV";

if(0 && $_SERVER['REMOTE_ADDR'] != "127.0.0.1"){

        // Create connection
        $conn = new mysqli($servername, $username, $password);

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
    }
    echo "Connected successfully";
    mysqli_select_db($conn,"pi");

}

// for search
// http://195.211.203.105/pi/index.php?module=API&method=Actions.getPageTitles&idSite=6&period=range&date=2020-05-01,2020-05-03&format=JSON&token_auth=1dc655e2360ca7f2ed0dac45e05e5c35&expanded=1&search_recursive=1&filter_pattern_recursive=gatos-spirounatos
// http://195.211.203.105/pi/index.php?module=API&method=Actions.getPageTitles&idSite=6&period=range&date=2020-05-03,2020-05-05&format=JSON&token_auth=1dc655e2360ca7f2ed0dac45e05e5c35&expanded=1&label=tainies&expanded=1

if (isset($_POST['submit'])) {

        list( $month,$day, $year) = explode('/', $_POST["datepicker-from"]);
        $from = $year."-".$month."-".$day;
        list( $month,$day, $year) = explode('/', $_POST["datepicker-to"]);
        $to = $year."-".$month."-".$day;

        $url = "http://smarttv.anixa.tv/matomo/index.php?module=API&method=Actions.getPageTitles&idSite=5&period=range&date=".$from.",".$to."&format=JSON&token_auth=48826b1ea11e1ad44c32f93157684069&expanded=1";

        var_dump($url);
}

?>


<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Στατιστικά</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Global stylesheets -->
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/reset.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/common.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/form.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/standard.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/jquery-ui.min.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/960.gs.fluid.css" rel="stylesheet" type="text/css">


    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <!-- Custom styles -->
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/simple-lists.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/block-lists.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/planning.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/table.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/calendars.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/wizard.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/gallery.css" rel="stylesheet" type="text/css">
    <link href="http://smarttv.anixa.tv/best-tv/stats/css/style.css" rel="stylesheet" type="text/css">
    <link href="amchart-export.css" rel="stylesheet" type="text/css">
    <!--<link href="categoryStyle.css" rel="stylesheet" type="text/css">-->


    <script type="text/javascript" src="help.js"></script>
    <script type="text/javascript" src="channelPos.js?r=<?php echo(rand()); ?>"></script>
    <script type="text/javascript" src="categoryHelper.js?r=<?php echo(rand()); ?>"></script>
	<script src="../js/libs/amchart/amcharts.js"></script>
	<script src="../js/libs/amchart/serial.js"></script>
	<script src="amchart-export-min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js"></script>

    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="https://jqueryui.com/resources/demos/style.css">
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script>
        function inIframe () {
               try {
                      return window.self !== window.top;
              } catch (e) {
                      return true;
              }
      }

      window.addEventListener('message', function (event) {
	// So Check whether event with data(which contains any object) contains our message here its "FrameHeight"

	if (event.data == "FrameHeight") {
		//Calculate the maximum height of the page
		var body = document.body, html = document.documentElement;
		var height = Math.max(body.scrollHeight, body.offsetHeight,
			html.clientHeight, html.scrollHeight, html.offsetHeight);

		// Send height back to parent page
		event.source.postMessage({ "FrameHeight": height }, "*");
	}
});

      function resizeBody() {
	//Calculate the maximum height of the page
	var body = document.body, html = document.documentElement;
	var height = Math.max(body.scrollHeight, body.offsetHeight,
		html.clientHeight, html.scrollHeight, html.offsetHeight);
	if (inIframe()) {
		window.parent.postMessage({ "FrameHeight": height }, "*");
		console.log('post h '+height);
	}
}
window.addEventListener("load", function() {
	const resizeObserver = new ResizeObserver(entries =>
		resizeBody()
               );
	resizeObserver.observe(document.body);
});

$( function() {
	$('.short-desc').richText({"name": "rich-shortdesc"});
	$('.desc').richText({"name": "rich-desc"});

	var today = new Date();
$( "#datepicker-from" ).datepicker({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true/*, minDate: today*/});
$( "#datepicker-to" ).datepicker({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true/*, minDate: today*/});

} );
</script>
<style>
      #sortable { list-style-type: none; margin: 0; padding: 0; width: 60%; }
      #sortable li { margin: 0 5px 5px 5px; padding: 5px; font-size: 1.2em; height: 1.5em; }
      html>body #sortable li { height: 1.5em; line-height: 1.2em; }
      .ui-state-highlight { height: 1.5em; line-height: 1.2em; }

      #search-results{
        height: 1280px;
        overflow: visible;
}

#analytics .outer, .subtable{
        width:1080px!important;
}

.subtable{
        position: relative;
        left:40px;
}
#analytics .outer .inner, .subtable .inner{
        position: relative;
        clear:both;
        float: left;
        border-bottom: solid 1px lightgrey;
}

#analytics .outer .inner div.column, .subtable .inner div.column{
        position: relative;
        float: left;
        padding: 10px;
        width:200px;
        text-align: center;
        color:black;
}

.btn button{
        width: 15px;
        height: 18px;
        line-height: 15px;
        padding: 0px;
        vertical-align: bottom;
}
.pageButton{
        cursor: pointer;
        filter: grayscale(1);
}
.pageButton.active, .pageButton:hover{
        filter: grayscale(0);
}
.row{
        margin-left: -15px;
        margin-right: -15px;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        border-bottom: solid lightgray;
        padding: 10px;
        text-align: center;    
}
td{
        vertical-align: middle!important;
}
td img{
    vertical-align: sub;
    height: 15px;
}

.header-buttons{
        width: 50%;
        min-width: 740px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        top: 0;
        position: absolute;
        top: -0.444em;
}
.header-buttons h1{
        position: unset;
}
tbody > tr > td, table thead th, tbody > tr > th{
        font-size: 14px!important;
}
th .button {
        width: 24px!important;
}
.block-content h1, .block-content .h1{
        font-size: 1.167em;
        font-weight:  bold;
        padding: 0.286em 1em 0.357em;
}
.block-content select, .block-content input{
        height: 3.5rem;
}
.hasDatepicker {
    width: 155px;
}
.hasDatepicker + img{
        position: relative;
        left: -20px;
}
.form .button{
        border: 1px solid;
        border-color: #50a3c8 #297cb4 #083f6f;
        background: -webkit-gradient( linear, left top, left bottom, from(white), to(#0c5fa5), color-stop(0.03, #72c6e4) );
        -moz-border-radius: 0.333em;
        -webkit-border-radius: 0.333em;
        -webkit-background-clip: padding-box;
        border-radius: 0.333em;
        color: white;
        -moz-text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        -webkit-text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        -moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        font-size: 1.167em;
        padding: 0.286em 1em 0.357em;
        line-height: 1.429em;
        cursor: pointer;
        font-weight: bold;
}
.table tbody tr:hover th, .table tbody tr:hover .th, .table tbody tr:hover td, .table tbody tr.TR3 td {
                background: unset;
        }
.table tbody tr:not([id$="sub"]):hover th, .table tbody tr:not([id$="sub"]):hover .th, .table tbody tr:not([id$="sub"]):hover td, .table tbody tr.TR3 td {
                background: #d1e5ef;
}

.table tbody tr.even td {
    background: #f2f2f2;
}
.table tbody tr.odd td {
    background: #e6e6e6;
}

</style>
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

<link href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">

<link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="rich_texteditor/richtext.min.css">
</head>

<body onload="onLoadAnalytics()">

        <section>
                <div class="block-border">
                        <div class="block-content" id="series-manager">
                                <!---->
                                <div class="header-buttons">
                                        <h1 class="pageButton active" id="statsBtn" onclick="onSearch()">Στατιστικά</h1>
                                        <!--<h1 class="pageButton" id="liveBtn" onclick="onLive()">Live Streams</h1>-->
                                        <h1 class="pageButton" id="brandsBtn" onclick="onBrands()">Κατασκευαστές</h1>
                                        <h1 class="pageButton" id="modelsBtn" onclick="onModels()">Μοντέλα</h1>
                                        <h1 class="pageButton" id="locsBtn" onclick="onLocations()">Τοποθεσία</h1>
                                        <!--<h1 class="pageButton" id="channelsBtn" onclick="onChannel()">Channel Place Analyse</h1>-->
                                </div>
                                <div id="item-form" class="form" style="display:block">

                                        <table class="table sortable 20-margin dataTable">
                                                <tbody>
                                                        <tr><td colspan="4">Επιλέξτε την υπηρεσία για την οποία ενδιαφέρεστε να δείτε τα στατιστικά δεδομένα καθώς και σε ποιο εύρος ημερομηνιών.</td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;">Υπηρεσία:</td><td colspan="3" style="width: 200px;"><select name="service_id" id="service_id"></select></select></td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Από</b>: </td><td style="width: 200px;"><input type="text" name="datepicker-from" id="datepicker-from" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td><td style="font-weight: bold; width: 200px;">Επιλογή μέρας:</td><td><select name="selectedDay" id="selectedDay"></select></select></td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Μέχρι</b>: </td><td colspan="3" style="width: 200px;"><input type="text"  name="datepicker-to" id="datepicker-to" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Τίτλος</b>: </td><td colspan="3" style="width: 200px;"><input type="text" name="title" id="title" size="40"></td></tr>
                                                </tbody>
                                        </table>
                                        <input class="button" value="Search" id="search" name="submit" type="submit" onclick="onSearch()">


                                </div>
                                <div id="brands-form" class="form" style="display:none">

                                        <table class="table sortable 20-margin dataTable">
                                                <tbody>
                                                        <tr><td colspan="4">Επιλέξτε εύρος ημερομηνιών.</td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Από</b>: </td><td style="width: 200px;"><input type="text" name="datepicker-from" id="datepicker-from2" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td><td style="font-weight: bold; width: 200px;">Επιλογή μέρας:</td><td><select name="selectedDay2" id="selectedDay2"></select></select></td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Μέχρι</b>: </td><td colspan="3" style="width: 200px;"><input type="text"  name="datepicker-to" id="datepicker-to2" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td></tr>
                                                </tbody>
                                        </table>
                                        <input class="button" value="Search" id="search" name="submit" type="submit" onclick="onBrands()">

                                </div>
                                <div id="models-form" class="form" style="display:none">

                                        <table class="table sortable 20-margin dataTable" >
                                                <tbody>
                                                        <tr><td colspan="4">Επιλέξτε εύρος ημερομηνιών.</td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Από</b>: </td><td style="width: 200px;"><input type="text" name="datepicker-from" id="datepicker-from3" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td><td style="font-weight: bold; width: 200px;">Επιλογή μέρας:</td><td><select name="selectedDay3" id="selectedDay3"></select></select></td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Μέχρι</b>: </td><td colspan="3" style="width: 200px;"><input type="text"  name="datepicker-to" id="datepicker-to3" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td></tr>
                                                </tbody>
                                        </table>
                                        <input class="button" value="Search" id="search" name="submit" type="submit" onclick="onModels()">

                                </div>
                                <div id="loc-form" class="form" style="display:none">
                                        <table class="table sortable 20-margin dataTable">
                                                <tbody>
                                                        <tr><td colspan="4">Επιλέξτε εύρος ημερομηνιών.</td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Από</b>: </td><td style="width: 200px;"><input type="text" name="datepicker-from" id="datepicker-from4" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td><td style="font-weight: bold; width: 200px;">Επιλογή μέρας:</td><td><select name="selectedDay4" id="selectedDay4"></select></select></td></tr>
                                                        <tr><td style="font-weight: bold; width: 200px;"><b>Μέχρι</b>: </td><td colspan="3" style="width: 200px;"><input type="text"  name="datepicker-to" id="datepicker-to4" size="10"><img src="http://mega.smart-tv-data.com/stats/images/calendar-month.png" width="16" height="16"></td></tr>
                                                </tbody>
                                        </table>
                                        <input class="button" value="Search" id="search" name="submit" type="submit" onclick="onLocations()">
                                </div>
                        </div>
                </div>
        
                <div class="block-border">
                        <div class="block-content" id="search-results" style="display: none">
                                <h1>Aποτελέσματα Αναζήτησης</h1>
                                <div id="total-vods"></div>
                                <div id="analytics"></div>
                        </div>
                        <div class="block-content" id="brands-results" style="display: none">
                                <h1>Κατασκευαστές</h1>
                                <div class="content">
                                </div>
                        </div>
                        <div class="block-content" id="models-results" style="display: none">
                                <h1>Μοντέλα συσκευών</h1>
                                <div class="content">
                                </div>
                        </div>
                        <div class="block-content" id="locations-results" style="display: none">
                                <h1>Τοποθεσίες</h1>
                                <div class="content">
                                </div>

                        </div>
                        <div class="block-content" id="live-results" style="display: none">
                                <h1>Live streams</h1>
                                <div class="content">
                                </div>

                        </div>
                        <div class="block-content" id="channel-results" style="display: none">
                                <h1>Channel Place Analyse</h1>
                                <div class="content">
                                </div>

                        </div>
                </div>
        </section>
<!--<div id="channel-number" class="block-content">
	<h1>Channel Place Analyse</h1>
</div>

        </section>
        <section><div class="block-border" >
                <div class="block-content" id="search-results" style="display: none">
                        <h1>Aποτελέσματα Αναζήτησης</h1>
                        <div id="analytics"></div>
                </div>
        </div></section>
-->

</body>
</html>
<script src="rich_texteditor/jquery.richtext.js"></script>
