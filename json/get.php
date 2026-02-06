<?php
include('/var/www/html/cretetv/json/resizeimg.php');
include('/var/www/html/cretetv/json/simple_html_dom.php');
require '/var/www/html/ionian/lib/vendor/autoload.php';
use YouTube\YouTubeDownloader;
use YouTube\Exception\YouTubeException;
$youtube = new YouTubeDownloader();
$youtube->getBrowser()->consentCookies();
$thumbs = json_decode(file_get_contents('http://cdn2.smart-tv-data.com/thum.php?sd=creta'), true);
$subs = json_decode(file_get_contents('https://speech3.anixa.tv/subtitles/cretetv.json'), true);
$loadLocal = 0;
if (count($subs)) {
	file_put_contents('/var/www/html/cretetv/json/subs.json', json_encode($subs));
	foreach ($subs as $sub) {
		$file = '/var/www/html/cretetv/json/subs/'. $sub .'.srt';
		if (!file_exists($file))
			file_put_contents($file, file_get_contents('http://speech3.anixa.tv/subtitles/'. $sub .'.srt'));
	}
} else if (file_exists('/var/www/html/cretetv/json/subs.json')) {
	$loadLocal=1;
	$subs = json_decode(file_get_contents('/var/www/html/cretetv/json/subs.json'), true);
}

$lh = json_decode(file_get_contents('http://cdn4.smart-tv-data.com:8080/statistik.php?cretatv=true'), true);

$sections = [
	'ΕΝΗΜΕΡΩΣΗ'=>'https://www.cretetv.gr/tv-shows/news-show/',
	'ΨΥΧΑΓΩΓΙΑ'=>'https://www.cretetv.gr/tv-shows/entertainment/',
	'ΠΟΛΙΤΙΣΜΟΣ'=>'https://www.cretetv.gr/tv-shows/politismos/',
	'CLASSICS'=>'https://www.cretetv.gr/tv-shows/classics/'
];
$out=[]; $all=[]; $got=0;$miss=[];
if (0 && count($miss) > 2) {
	$to = 'd.chatzidakis@realtv-media.de';
	//$to = 'hatdio@gmail.com';
	$msg = "Missing videos\n";
	foreach($miss as $k) {
		$msg .= $k."\n";
	}
	$msg .= "http://smarttv.anixa.tv/cretetv/json/all.json\n";
	$msg .= "http://195.226.218.10:8080/statistik.php?cretatv=true\n";
	echo "sending email to $to\n";
	$res = mail($to, 'CreteTV missing videos', $msg);
	print_r($res);
	exit;
}
foreach ($sections as $sec=>$url) {
	$section = [];
	$section['title'] = $sec;
	$shows = [];

	echo " $sec > $url\n";
	$html = get_html($url);
	$secId = $html->find('section[id=viewTvShows]')[0];
	foreach ($secId->find('div[class=item-content]') as $item) {
		$show = [];
		$det = $item->find('div[class=show-details]')[0];
		$sign = $det->find('span[class=show-age-sign]')[0]->plaintext;
		$show['sign'] = $sign;

		$url = $item->find('a')[0]->getAttribute('href');

		$key = md5($url);
		$show['key'] = $key;

		$title = $item->find('h2')[0]->plaintext;
		$show['title'] = $title;
		echo $title."\n";
		if ($title == 'Εθνικές Παρελάσεις | Ηράκλειο Κρήτης')
			continue;

		$descr='';
		if (count($item->find('p')))
			$descr = $item->find('p')[0]->plaintext;
		$imgs = $item->find('img[class=holdingItem wp-post-image]');
		if (count($imgs)) {
			$img = $imgs[0]->getAttribute('src');
			$im = '/var/www/html/cretetv/img/shows/'. $key .'.jpg';
			//unlink($im);
			$show['img'] = getImg($img, $key, 290, 144, '?v3');
		}
		$show['descr'] = $descr;

		$dur = $item->find('div[class=duration]')[0]->plaintext;
		$show['dur'] = $dur;

		echo " > $url\n";
		$showHtml = get_html($url);
		foreach($showHtml->find('meta') as $meta) {
			if (0 && $meta->getAttribute('property') == 'og:image') {
				$img = $meta->getAttribute('content');

				$im = '/var/www/html/cretetv/img/shows/'. $key .'.jpg';
				if (date('H') == 12)
					unlink($im);
				//$show['img'] = getImg($img, $key, 1280, 720);
				$show['img'] = getImg($img, $key, 290, 144, '?v1');
			}
		}
		$conts = $showHtml->find('section[id=episodes-content]');
		if (!count($conts))
			continue;
		if (preg_match("#istories-t#si", $url)) {
			continue;
		}

		$cont = $conts[0]; $reqs=0;
		$episodes = []; $chEps=[];
		$shows[]=$show;
		echo $show['title']."\n";
		foreach ($cont->find('div[class=item-content]') as $ind=>$item) {
			$ep=[];

			$url = $item->find('a')[0]->getAttribute('href');

			$epkey = md5($url);
			$ep['key'] = $epkey;

			$img = $item->find('img')[0]->getAttribute('src');
			$ep['img'] = getImg($img, $epkey, 300, 169);
			if (!isset($ep['img']) || !strlen($ep['img']))
				continue;

			$title = $item->find('h2')[0]->plaintext;
			$ep['title'] = $title;
			if (1 && in_array($ep['key'] .'.jpg', $thumbs)) {
				//print_r($js[$cat]['show'][$sh][$ind]);exit;
				$ep['thumb'] = 'http://cdn2.smart-tv-data.com/thum/creta/'. $ep['key'] .'.jpg';
			}

			if (0) {
				$iframe = $eph->find('iframe')[0]->getAttribute('src');
				try {
					//$res = $youtube->getDownloadLinks($iframe); print_r($res);exit;
					if (!preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $iframe, $match))
						die("preg failed\n");
					$vid = $match[1];
					$res = getYoutubeVideoMeta($vid);
					//print_r($res);exit;
					$res = getBestFormat($res);

					$ep['url'] = $res->url;
				} catch (Exception $e) {
					echo 'Caught exception: ',  $e->getMessage(), "\n";
				}
			} else {
				if (in_array($epkey.'.mp4', $lh)) {
					$ep['mp4'] = 'http://cdn5.smart-tv-data.com/cretatv/'. $epkey .'.mp4';

					if (in_array($ep['key'], $subs)) {
						$s = []; $sb=[];
						$s['f'] = $loadLocal ? 'json/subs/'. $k .'.srt' : 'http://speech3.anixa.tv/subtitles/'. $ep['key'] .'.srt';
						$s['l'] = 'el';
						$sb[] = $s;
						$ep['subs'] = $sb;
					} else if ( $show['title'] == 'Κεντρικό Δελτίο Ειδήσεων' && $ind == 0) {
						$ur = 'https://speech3.anixa.tv/whisper-gui/enqueue?channel=cretetv&video_url='. $ep['mp4'];
						echo "run auto sub for ". $ep['title'] ."\n";
						echo $ur."\n";
						$nul = file_get_contents($ur)."\n";
						$reqs++;
					}
				}
				echo "ep > $url\n";
				$eph = get_html($url);

				if (preg_match("#file: \"([^ \"]*)\"#si", $eph, $m)) {
					$ep['url'] = $m[1];
					$ps = $eph->find('div[id=episode-ekpompi-desc]')[0];
					if ($ps) {
						$r = $ps->find('p');
						if (count($r))
							$ep['descr'] = $r[0]->plaintext;
					}
					$episodes[]=$ep;
					$got++;
					if (!isset($ep['mp4']))
						$miss[] = $epkey;
					else
						$chEps[] = $ep;
				} else
					echo("ops\n");
			}
		}
		//load more
		if (preg_match("#repeater_videos_nonce = '([^']*)#si", $showHtml, $m)) {
			$nonce = $m[1];
			$cnt = count($episodes); $offset = $cnt;
			$url = 'https://www.cretetv.gr/wp-admin/admin-ajax.php';
			$opts = ['action'=> 'repeater_videos',
				'post_name'=> $show['title'],
				'total'=> 165,
				'offset'=> $offset,
				'sort'=> 'Νεότερο πρώτα',
				'season'=> 0,
				'nonce'=> $nonce
			];
			$doexit=0;
			while ($offset < 60) {
				echo " > $url $offset\n";
				$res = curlPOST($url, http_build_query($opts));
				$js = json_decode($res, true);
				if (!isset($js['content']))
					break;
				$cont = str_get_html($js['content']);
				if (!$cont)
					break;
				foreach ($cont->find('div[class=item-content]') as $item) {
					$ep=[];

					$url = $item->find('a')[1]->getAttribute('href');
					echo "$url\n";

					$epkey = md5($url);
					$ep['key'] = $epkey;

					$img = $item->find('img')[0]->getAttribute('src');
					$ep['img'] = getImg($img, $epkey, 300, 169);

					$title = $item->find('h2')[0]->plaintext;
					$ep['title'] = $title;

					echo "ep > $url\n";
					$eph = get_html($url);
					if (preg_match("#<iframe src=\"https:\/\/www\.youtub#si", $eph)) {
						$doexit=1;
						break;
					}
					if (in_array($epkey.'.mp4', $lh)) {
						$ep['mp4'] = 'http://cdn5.smart-tv-data.com/cretatv/'. $epkey .'.mp4';
					}
					if (preg_match("#file: \"([^ \"]*)\"#si", $eph, $m)) {
						$ep['url'] = $m[1];
						$got++;
						if (!isset($ep['mp4']))
							$miss[] = $epkey;
						else
							$chEps[] = $ep;
					}
					$episodes[]=$ep;
				}

				$offset = $js['offset'];
				if ($doexit || !$js['more'])
					break;
			}
		}

		if (count($episodes)) {
			$show['episodes'] = $chEps;
			file_put_contents('/var/www/html/cretetv/json/shows/'. $key .'.json', json_encode($show));
			$show['episodes'] = $episodes;
			$shows[count($shows)-1]['video'] = $episodes[0]['mp4'];
			$all[]=$show;
		} else {
			echo "skip empty show ". $show['title'] ."\n";
			array_splice($shows, count($shows)-1, 1);
		}
	}
	$section['shows'] = $shows;
	$out[] = $section;
}
echo "$got urls\n";
echo "missing mp4: ". count($miss) ."\n";
if (count($miss) > 2) {
	$to = 'd.chatzidakis@realtv-media.de';
	$msg = "Missing videos\n";
	foreach($miss as $k) {
		$msg .= $k."\n";
	}
	$msg .= "http://smarttv.anixa.tv/cretetv/json/all.json\n";
	$msg .= "http://195.226.218.10:8080/statistik.php?cretatv=true\n";
	$res = mail($to, 'CreteTV missing videos', $msg);
}

file_put_contents('/var/www/html/cretetv/json/all.json', json_encode($all));
file_put_contents('/var/www/html/cretetv/json/shows.json', json_encode($out));

function getImg($url, $key, $w, $h, $ver='') {
	global $pref;
	if (!preg_match("#http#si", $url))
		$url = $pref. $url;
	//echo "img > $url\n";

	$path = '/var/www/html/cretetv/img/shows';
	$a = pathinfo($url);
	$ext = 'jpg';

	$file = "$path/$key.".$a['extension'];
	$n = "$path/$key.".$ext;

	$exist=1;
	if (!file_exists($file) && !file_exists($n)) {
		$agent  = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0";
		$ch=curl_init();
		if (!preg_match("#\?#si", $url))
			$url = $a['dirname'] .'/' .rawurlencode($a['basename']);
		echo " > $url\n";

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_USERAGENT, $agent);
		curl_setopt($ch, CURLOPT_ENCODING , "gzip, deflate");
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch,CURLOPT_HTTPHEADER,array (
			"Accept: image/jpeg,image/avif,image/webp,*/*"
		));
		$contents = curl_exec ($ch);

		if (curl_errno($ch)) {
			echo  'Error:' . curl_error($ch);
			exit;
		}

		curl_close ($ch);
		echo "saving $path/" .$key .'.'. $a['extension'] ." ". strlen($contents) ."\n";
		if (strlen($contents) < 100) {
			echo $contents;
			return;
		}
		file_put_contents($file, $contents);

		$resize = new ResizeImage($file);
		$resize->resizeTo($w, $h, 'default');
		$resize->saveImage($file, 90);
		if ($ext != $a['extension']) {
			echo("convert $file -quality 90 $n\n");
			passthru("convert $file -quality 90 $n");
			passthru("rm $file");
		} else {
			passthru("convert $file -quality 90 $file");
		}
	}
	return '/cretetv/img/shows/'. $key .'.'. $ext.$ver;
}
function get_html($url, $usecache=0) {
	global $debug;
	$CacheMaxNews=60*10;

	if ($debug)
		$usecache=true;

	$key = md5($url); $cont='';
	$f = '/tmp/cretetv-cache/'. $key;

	if (!$usecache && file_exists($f)) {
		//echo "use cache $f\n";
		$sekold=(time()-filemtime($f));
		if($sekold >$CacheMaxNews) unlink($f);
	}
	if (file_exists($f)) {
		//echo "cache[$f]\n";
		$cont = file_get_contents($f);
	}
	if (!strlen($cont)) {
		//echo "$url > $f\n";
		$cont = curlGET($url);
		//echo "save $f\n";
		file_put_contents($f, $cont);
	}

	$html = str_get_html($cont);
	return $html;
}
function curlGET($url){
	$ua = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_USERAGENT, $ua);
	//curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST, 'DEFAULT@SECLEVEL=1');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch,CURLOPT_HTTPHEADER,array (
		"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
	));

	$result = curl_exec($ch);
	if (curl_errno($ch)) {
		echo  'Error:' . curl_error($ch);
	}
	curl_close ($ch);
	return $result;
}
function getYoutubeVideoMeta($videoId) {
	global $api_key;
	$ch = curl_init();
	$curlUrl = 'https://www.youtube.com/youtubei/v1/player?key=' . $api_key;
	echo "v2[$videoId] > $curlUrl\n";
	curl_setopt($ch, CURLOPT_URL, $curlUrl);
	curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	$curlOptions = '{"context": {"client": {"hl": "en","clientName": "WEB",
		"clientVersion": "2.20210721.00.00","clientFormFactor": "UNKNOWN_FORM_FACTOR","clientScreen": "WATCH",
		"mainAppWebInfo": {"graftUrl": "/watch?v=' . $videoId . '",}},"user": {"lockedSafetyMode": false},
		"request": {"useSsl": true,"internalExperimentFlags": [],"consistencyTokenJars": []}},
		"videoId": "' . $videoId . '",  "playbackContext": {"contentPlaybackContext":
	{"vis": 0,"splay": false,"autoCaptionsDefaultOn": false,
	"autonavState": "STATE_NONE","html5Preference": "HTML5_PREF_WANTS","lactMilliseconds": "-1"}},
	"racyCheckOk": false,  "contentCheckOk": false}';
	curl_setopt($ch, CURLOPT_POSTFIELDS, $curlOptions);
	$headers = array();
	$headers[] = 'Content-Type: application/json';
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	$curlResult = curl_exec($ch);
	if (curl_errno($ch)) {
		echo 'Error:' . curl_error($ch);
	}
	curl_close($ch);
	$res = json_decode($curlResult);
	return $res;
}
function getBestFormat($res) {
	// find 1280 width or next width
	$best = null;
	//print_r($res->streamingData);exit;
	foreach ($res->streamingData->formats as $r) {
		if (!$best)
			$best = $r;
		if ($best && $r->width <= 1280 && $best->width < $r->width)
			$best = $r;

		if ($best->width == 1280)
			break;
	}
	echo "found ". $best->width ." width\n";
	return $best;
}
function curlPOST($url, $args){
	$ua = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13';
	$ch = curl_init($url);

	curl_setopt($ch, CURLOPT_POSTFIELDS, $args);
	curl_setopt($ch, CURLOPT_USERAGENT, $ua);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	//curl_setopt($ch, CURLOPT_VERBOSE, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
	//curl_setopt($ch, CURLOPT_TIMEOUT, 10000); //timeout in seconds

	curl_setopt($ch,CURLOPT_HTTPHEADER,array (
		"Content-Type: application/x-www-form-urlencoded"
	));

	$result = curl_exec($ch);
	//deblog($result);

	// extract header
	/* $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
	$header = substr($result, 0, $headerSize);
	$header = getHeaders($header);
	$location = $header["Location"];
	 */
	if (curl_errno($ch)) {
		echo  'Error:' . curl_error($ch);
	}
	curl_close ($ch);
	return $result;
}

