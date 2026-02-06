<?php   
require_once('config.php');
$userLoggedName = '';
        
if (isset($_GET['action']) && $_GET['action'] == 'logout') {
        setcookie('stats-best-userid', '', time()-3600);
        header('location: /login.php');
        exit;
}

if (isset($_COOKIE['stats-best-userid'])) {
        $val = $_COOKIE['stats-best-userid'];

        $res = base64_decode($val);
        $a = explode('-', $res);

        if (count($a) == 2 && $a[1] === USERHASH)
                $userLoggedName = $a[0];
}

if (count($_POST)) {
        $res = $mysqli->query("SELECT ts FROM users WHERE username='". $mysqli->real_escape_string($_POST['username']) ."' AND pass = '". $mysqli->real_escape_string(pass_encrypt($_POST['pass'])) ."'");
        if ($res->num_rows) {
                $val = base64_encode($_POST['username']. '-'. USERHASH);
                setcookie('stats-best-userid', $val, time()+1*86400);
                header('location: /login.php');
                exit;
        } else {
                echo('<p>Username not found or pass incorrect</p>');
        }
}

if ($userLoggedName)
        echo '<p>User logged as <b>'. $userLoggedName .'</b>. <a href="?action=logout">Logout</a></p>';
else {
?>
<section class="grid_6">
<div class="block-border">
<form class="block-content form" method="post" action="">
        <fieldset>
                <legend>Login</legend>
                <div class="columns">
                        <p class="colx2-left">
                                <label for="username">Username:</label>
                                <input type="text" name="username" id="username">
                        </p>

                        <p class="colx2-right">
                                <label for="pass">Password:</label>
                                <input type="password" name="pass" id="pass">
                        </p>
                </div>
        </fieldset>
        <button type="submit">Login</button>
</form>                 
</div>                          
</section>                      
                        
<?php
}                       
?>                              
</body>                         
</html>
