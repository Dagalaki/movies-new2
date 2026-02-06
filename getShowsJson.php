<?php
/*if(isset($_GET['key'])){
	if($_GET['key'] == 'epg') $json = file_get_contents('http://smarttv.anixa.tv/cretetv/json/epg.json');
	else $json = file_get_contents("http://smarttv.anixa.tv/cretetv/json/shows/" . $_GET['key'] . ".json" );
}else{
	$json = file_get_contents("http://smarttv.anixa.tv/cretetv/json/shows.json");
}
*/

$json = file_get_contents("http://smarttv.anixa.tv/movies-new/json/moviesFull.json");

echo $json;

?>
