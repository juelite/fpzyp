<?php
/* 
* Filename: authimg.php 
*/

if(session_status() != PHP_SESSION_ACTIVE){
    session_start();
}
header("Content-Type:text/html; charset=utf-8");
creat_code(62, 35, 15, 5, 50, 4, "code_str");


function creat_code($width, $height, $space, $size, $line_num, $length, $sname = "")
{
    $left = 3;
    $move = 2;


    $possible = "9823456789ABCDEFGHIJKLMNZPQRSTUVWXYZ";
    $authstr = "";
    while (strlen($authstr) < $length) {
        $authstr .= substr($possible, rand(0, strlen($possible)), 1);
    }


    if ($sname != "") {
        $_SESSION['code_str'] = $authstr;
    }

    $image = imagecreate($width, $height);


    $fontColor = ImageColorAllocate($image, 75, 75, 75);
    $bgColor = ImageColorAllocate($image, 255, 255, 255);


    imagefill($image, 0, 0, $bgColor);


    for ($i = 0; $i < strlen($authstr); $i++) {
        $y = ($height - imagefontheight($size)) / 2 - $move + rand(0, $move * 2);
        imagestring($image, $size, $space * $i + $left, $y, substr($authstr, $i, 1), $fontColor);
    }

    for ($i = 1; $i <= $line_num; $i++) {
        imagesetpixel($image, rand(0, $width), rand(0, $height), $bgColor);
    }

    Header("Content-type: image/PNG");
    ImagePNG($image);
    ImageDestroy($image);
}

?>
