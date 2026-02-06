<?php
// whitelist.php

$WHITELIST_FILE = __DIR__ . '/json/whitelist.json';

// ---------- Helpers ----------

// Polyfill for http_response_code for very old PHP versions
if (!function_exists('http_response_code')) {
    function http_response_code($newcode = NULL) {
        static $code = 200;
        if ($newcode !== NULL) {
            $code = $newcode;
            header('X-PHP-Response-Code: ' . $code, true, $code);
        }
        return $code;
    }
}

function send_json($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function param($name, $default = null) {
    if (isset($_POST[$name])) return $_POST[$name];
    if (isset($_GET[$name]))  return $_GET[$name];
    return $default;
}

function load_whitelist($file) {
    if (!file_exists($file)) {
        $initial = array("items" => array());
        file_put_contents($file, json_encode($initial));
        return $initial;
    }

    $json = file_get_contents($file);
    $data = json_decode($json, true);

    if (!is_array($data) || !isset($data["items"]) || !is_array($data["items"])) {
        $data = array("items" => array());
    }

    return $data;
}

function save_whitelist($file, $data) {
    $fp = fopen($file, 'c+');
    if (!$fp) return false;

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }

    ftruncate($fp, 0);
    rewind($fp);

    $ok = fwrite($fp, json_encode($data)) !== false;

    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return $ok;
}

// ---------- Main ----------
$action = param('action', 'get');
$data   = load_whitelist($WHITELIST_FILE);

switch ($action) {

    // -----------------------------
    // GET (return all items)
    // -----------------------------
    case 'get':
        send_json(array(
            "success" => true,
            "items"   => $data["items"]
        ));
        break;

    // -----------------------------
    // ADD item
    // -----------------------------
    case 'add':
        $item = trim((string)param('item', ''));

        if ($item === '') {
            send_json(array("success" => false, "error" => "Missing item"), 400);
        }

        if (!in_array($item, $data["items"], true)) {
            $data["items"][] = $item;
        }

        if (!save_whitelist($WHITELIST_FILE, $data)) {
            send_json(array("success" => false, "error" => "Failed to save file"), 500);
        }

        send_json(array("success" => true, "items" => $data["items"]));
        break;

    // -----------------------------
    // REMOVE item
    // -----------------------------
    case 'remove':
        $item = trim((string)param('item', ''));

        if ($item === '') {
            send_json(array("success" => false, "error" => "Missing item"), 400);
        }

        $filtered = array();
        foreach ($data["items"] as $v) {
            if ($v !== $item) {
                $filtered[] = $v;
            }
        }
        $data["items"] = $filtered;

        if (!save_whitelist($WHITELIST_FILE, $data)) {
            send_json(array("success" => false, "error" => "Failed to save file"), 500);
        }

        send_json(array("success" => true, "items" => $data["items"]));
        break;

    default:
        send_json(array("success" => false, "error" => "Unknown action"), 400);
}

