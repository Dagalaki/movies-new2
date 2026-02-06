<?php
$url = "http://cdn2.smart-tv-data.com/video/json.php?usr=ionian&v=" . rand();

// Fetching the JSON content
$jsonContent = file_get_contents($url);

// Checking if the request was successful
if ($jsonContent === FALSE) {
    echo "Failed to fetch JSON content.";
} else {
    // Outputting the JSON content
    header('Content-Type: application/json');
    echo $jsonContent;
}
?>
