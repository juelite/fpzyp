<?php

/**
 * Function:xcurl
 * Author:wangyu
 * @return mixed
 */
function xcurl($url, $ref = null, $post = array(), $ua = "Mozilla/5.0 (X11; Linux x86_64; rv:2.2a1pre) Gecko/20110324 Firefox/4.2a1pre", $print = false)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);
    if (!empty($ref)) {
        curl_setopt($ch, CURLOPT_REFERER, $ref);
    }
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    if (!empty($ua)) {
        curl_setopt($ch, CURLOPT_USERAGENT, $ua);
    }
    if (count($post) > 0) {
        $o = "";
        foreach ($post as $k => $v) {
            $o .= "$k=" . urlencode($v) . "&";
        }
        $post = substr($o, 0, -1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    }
    $output = curl_exec($ch);
    curl_close($ch);
    if ($print) {
        print($output);
    } else {
        return $output;
    }
}

/*
 * 字符串截取
 * $text 需要截取的字符串
 * $length 截取长度
 * */
function subtext($text, $length)
{
    if (mb_strlen($text, 'utf8') > $length)
        return mb_substr($text, 0, $length, 'utf8') . '...';
    return $text;
}

/**
 * Function:authcode
 * Author:wangyu
 * 加密解密（可逆）
 * @param  string $string 加密的字符串
 * @param  string $operation DECODE表示解密,其它表示加密
 * @param  string $key 密钥
 * @param  int $expiry 密文有效期
 * @return string
 */
function authcode($string, $operation = 'DECODE', $key = '', $expiry = 0)
{
    $ckey_length = 4;
    $key = md5($key ? $key : "da7b4db15be94a4c597a34f9cf902b01");
    $keya = md5(substr($key, 0, 16));
    $keyb = md5(substr($key, 16, 16));
    $keyc = $ckey_length ? ($operation == 'DECODE' ? substr($string, 0, $ckey_length) : substr(md5(microtime()), -$ckey_length)) : '';

    $cryptkey = $keya . md5($keya . $keyc);
    $key_length = strlen($cryptkey);

    $string = $operation == 'DECODE' ? base64_decode(substr($string, $ckey_length)) : sprintf('%010d', $expiry ? $expiry + time() : 0) . substr(md5($string . $keyb), 0, 16) . $string;
    $string_length = strlen($string);

    $result = '';
    $box = range(0, 255);

    $rndkey = array();
    for ($i = 0; $i <= 255; $i++) {
        $rndkey[$i] = ord($cryptkey[$i % $key_length]);
    }

    for ($j = $i = 0; $i < 256; $i++) {
        $j = ($j + $box[$i] + $rndkey[$i]) % 256;
        $tmp = $box[$i];
        $box[$i] = $box[$j];
        $box[$j] = $tmp;
    }

    for ($a = $j = $i = 0; $i < $string_length; $i++) {
        $a = ($a + 1) % 256;
        $j = ($j + $box[$a]) % 256;
        $tmp = $box[$a];
        $box[$a] = $box[$j];
        $box[$j] = $tmp;
        $result .= chr(ord($string[$i]) ^ ($box[($box[$a] + $box[$j]) % 256]));
    }

    if ($operation == 'DECODE') {
        if ((substr($result, 0, 10) == 0 || substr($result, 0, 10) - time() > 0) && substr($result, 10, 16) == substr(md5(substr($result, 26) . $keyb), 0, 16)) {
            return substr($result, 26);
        } else {
            return '';
        }
    } else {
        return $keyc . str_replace('=', '', base64_encode($result));
    }

}

/**
 * Function:random
 * Author:wangyu
 * 获取随机码
 * @param  int $length 随机码的长度
 * @param  int $numeric 0是字母和数字混合码，不为0是数字码
 * @return string
 */
function random($length, $numeric = 0)
{
    PHP_VERSION < '4.2.0' ? mt_srand((double)microtime() * 1000000) : mt_srand();
    $seed = base_convert(md5(print_r($_SERVER, 1) . microtime()), 16, $numeric ? 10 : 35);
    $seed = $numeric ? (str_replace('0', '', $seed) . '012340567890') : ($seed . 'zZ' . strtoupper($seed));
    $hash = '';
    $max = strlen($seed) - 1;
    for ($i = 0; $i < $length; $i++) {
        $hash .= $seed[mt_rand(0, $max)];
    }
    return $hash;
}

/**
 * Function:send_by_phone
 * Author:wangyu
 * 手机发送验证码
 * @param  string $phone 手机号码
 * @param  string $message 模板id为0是发送信息，模板id不为0是者模板值
 * @param  int $tpl_id 模板id
 * @return bool
 */
function send_by_phone($phone, $message, $tpl_id = 0)
{

    if (!$phone || !$message) {
        return false;
        exit;
    }

    $apikey = 'b66e3c9ac9e3a877d690560892c43d5f';
    $mobile = $phone;

    $sendSms = new \Org\sendSms();
    if ($tpl_id) {
        $tpl_value = $message;
        $output = $sendSms->tpl_send_sms($apikey, $tpl_id, $tpl_value, $mobile);
    } else {
        $text = $message;
        $output = $sendSms->send_sms($apikey, $text, $mobile);
    }
    $output = json_decode($output, true);
    if ($output['code'] != 0) {
        return false;
    } else {
        return true;
    }
}

/**
 * 发送验证码存储到数据库中
 * @param   $phone 手机号码
 * @param   $code 验证码
 */
function send_message_save($phone, $code)
{

    $msgCode = M("msgCode");
    $data['phone'] = $phone;
    $data['code'] = $code;
    $data['send_date'] = time();
    $msgCode->add($data);

}

/**
 * Function:set_session
 * Author:wangyu
 * 创建session
 * @param  array $session session的数组
 * @param  string $name session存储的名称
 * @return bool
 */
function set_session($session, $name)
{
    if (!is_array($session)) {
        return false;
    }
    $key = C('secret_key');
    $session = implode('\t', $session);
    $session = authcode($session, 'ENCODE', $key);
    session($name, $session);
}

/**
 * Function:get_session
 * Author:wangyu
 * 获得session
 * @param  string $name session存储的名称
 * @return array|bool
 */
function get_session($name)
{
    $key = C('secret_key');
    $auth = session($name);

    if ($auth) {
        $auth = authcode($auth, 'DECODE', $key);
        $session = explode('\t', $auth);
        return $session;
    } else {
        return false;
    }
}

/**
 * 前台登录时间 IP入库
 *
 */
function set_online($uid)
{
    $members = M("members");
    $where['uid'] = $uid;
    $data['lastlogin'] = time();
    $data['login_ip'] = $_SERVER['REMOTE_ADDR'];
    $members->where($where)->save($data);
}

/**
 * 后台登录时间 IP入库
 *
 */
function set_online_admin($uid)
{
    $admin = M("admin");
    $where['id'] = $uid;
    $data['login_date'] = time();
    $data['login_ip'] = $_SERVER['REMOTE_ADDR'];
    $admin->where($where)->save($data);
}

/**
 * Function:get_password
 * Author:wangyu
 * 生成密码
 * @param  string $pwd 原始密码
 * @param  string $salt 密钥
 * @return string
 */

function get_password($pwd, $salt)
{
    $slt = $pwd . '{' . $salt . "}";
    $h = 'sha256';
    $digest = hash($h, $slt, true);
    for ($i = 1; $i < 5000; $i++) {
        $digest = hash($h, $digest . $slt, true);
    }
    return base64_encode($digest);
}

/**
 * Function:checkCodeMsg
 * Author:wangyu
 * 验证短信验证码是否有效
 * @param  string $phone 电话
 * @param  string $code 验证码
 * @return bool
 */

function checkCodeMsg($phone, $code)
{
    $msgCode = M("msgCode");
    $where['phone'] = $phone;
    $where['code'] = $code;
    $date = $msgCode->where($where)->getField("`send_date`");
    if (!$date) {
        return false;
        exit();
    }
    $now = time() - $date;
    if ($now > 60000) {
        return false;
        exit();
    } else {
        return true;
        exit();
    }

}


/**
 * Function:check_password
 * Author:wangyu
 * 验证密码
 * @param  string $password 原始密码
 * @param  string $salt 密钥
 * @param  string $pwd 加密后密码
 * @return bool
 */
function check_password($password, $salt, $pwd)
{
    if (get_password($password, $salt) == $pwd) {
        return true;
    } else {
        return false;
    }
}

/**
 * 清楚所有session
 * Function:kill_session
 * Author:wangyu
 */
function kill_session()
{
    session_destroy();
}

/**
 * 获取当前在线用户的UID
 * Function:getOnlineUid
 * Author:wangyu
 * @return bool
 */
function getOnlineUid()
{
    $wtcky = get_session("wtcky");
    if (!$wtcky) {
        return false;
        exit();
    }
    list($uid) = $wtcky;
    if (!$uid) {
        $this->error("没有检测到登录或登录已超时！");
        exit();
    }
    return $uid;
}

/**
 * 获取在线用户信息
 * Function:getOnlineInfo
 * Author:wangyu
 * @return array|mixed
 */
function getOnlineInfo()
{
    $uid = getOnlineUid();
    $members = M("members");
    $uBase = $members->where("`uid` = " . $uid)->find();
    $membersInfo = M("membersInfo");
    $uCompare = $membersInfo->where("`uid` = " . $uid)->find();
    if ($uCompare) {
        return array_merge($uBase, $uCompare);
    } else {
        return $uBase;
    }
}

/**
 * 获取用户角色
 * Function:getOnlineRole
 * Author:wangyu
 * @return mixed
 */
function getOnlineRole($uid)
{
    return M("memberRoles")->where("`role_id` = " . $uid)->getField("`name`");
}

/**
 * Function:getOnlineAuth 获取在线用户认证状态
 * Author:wangyu
 * @return mixed
 */
function getOnlineAuth()
{
    $uBase = getOnlineInfo();
    return $uBase['auth'];
}

/**
 * Function:QiNiuUpload
 * Author:wangyu
 * 七牛上传图片加裁切缩放
 * $file 为要上传的文件
 * $data 裁切参数 $data['x'] 起点x轴  $data['y'] 起点y轴 $data['w'] $data['h'] 图片预裁切宽高 $data['targetW'] $data['targetH']图片尺寸
 * @return mixed
 */
function QiNiuUpload($file, $data)
{
    $setting = C('UPLOAD_SITEIMG_QINIU');
    $Upload = new \Think\Upload($setting);
    $domain = $setting["driverConfig"]["domain"];
    $info = $Upload->upload(array($file));

    /*裁切*/
    $img = $info[0]['url'];
    $data['copy'] = basename($img);
    $crop = $Upload->uploader->imgCrop($img, $data);


    foreach ($crop as $k => $v) {
        $imgArr = json_decode($v);
        $imgR[$k] = "http://" . $domain . "/" . $imgArr->key;
    }
    return $imgR;
}

/**
 * Function:QiNiuUploadFile
 * Author:wangyu
 * 七牛上传附件
 * $file 为要上传的文件
 * @return array|bool
 */
function QiNiuUploadFile($file)
{
    $setting = C('UPLOAD_SITEIMG_QINIU');
    $Upload = new \Think\Upload($setting);
    $info = $Upload->upload(array($file));
    return $info;
}

/**
 * Function:getTabName
 * Author:wangyu
 * 根据模块ID 获取数据表名
 * @return mixed
 */
function getTabName($mid)
{
    $modules = M("modules");
    $tabName = $modules->where("`id` = '" . $mid . "'")->getField("`tabName`");
    return $tabName;
}

/**
 * Function:setRank
 * Author:wangyu
 * 计算权重 增加
 * $id 内容id
 * $mid 模块id 根据模块id操作对应的数据表
 * $act 动作 view：阅读+1    common：评论 +3    buy：购买 +5    collection：收藏 +3    share：分享 +4
 */
function setRank($id, $mid, $act = 'view')
{
    $db = M(getTabName($mid));
    switch ($act) {
        case 'view':
            if ($_SESSION['rank'][$id] != $id) {
                $db->where("`id` = " . $id)->setInc('rank', 1);
                $_SESSION['rank'][$id] = $id;
            }
            break;
        case "comment":
            $db->where("`id` = " . $id)->setInc('rank', 3);
            break;
        case 'buy':
            $db->where("`id` = " . $id)->setInc('rank', 5);
            break;
        case 'collection':
            $db->where("`id` = " . $id)->setInc('rank', 3);
            break;
        case 'share':
            $db->where("`id` = " . $id)->setInc('rank', 4);
            break;
        default:
            break;
    }
}

/**
 * Function:setDecRank
 * Author:wangyu
 * 计算权重 降权
 * $id 内容id
 * $mid 模块id 根据模块id操作对应的数据表
 * $act 动作  collection：取消收藏-3
 */
function setDecRank($mid, $id, $act = 'collection')
{
    $db = M(getTabName($mid));
    $db->where("`id` = " . $id)->setDec('rank', 3);
}

/**
 * Function:send_comment
 * Author:wangyu
 * 写入评论
 * $uid 用户id
 * $mid 内容所属模块id
 * $pid 评论内容id
 * $content 评论内容
 * $status 评论状态，默认0，需要审核
 * 评论成功调用计算权重方法
 * @return bool|mixed
 */
function send_comment($uid, $mid, $pid, $content, $msgID = 0, $status = 0)
{
    $comment = M("comment");
    $data['uid'] = $uid;
    $data['mid'] = $mid;
    $data['pid'] = $pid;
    $data['toId'] = $msgID;
    $data['content'] = $content;
    $data['status'] = $status;
    $data['add_date'] = time();
    $id = $comment->add($data);
    if ($id) {
        setRank($pid, $mid, 'comment');
        $comm = $comment->where("`id` = '" . $id . "'")->find();
        return $comm;
    } else {
        return false;
    }
}

/**
 * Function:getAttrPath
 * Author:wangyu
 * 获取附件中的图片
 * $uid 用户id
 * $type 图片类型
 * $size 图片尺寸
 * @return mixed
 */
function getAttrPath($id, $size = "small")
{
    $attr = M("attr");
    $where['aid'] = $id;
    switch ($size) {
        case "large":
            $field = "path";
            $img = $attr->where($where)->getField($field);
            break;
        case "small":
            $field = "path_small";
            $img = $attr->where($where)->getField($field);
            break;
        case "dx":
            $field = "`path`,`path_small`";
            $img = $attr->field($field)->where($where)->find();
            break;
        case "zx":
            $field = "`path_middle`,`path_small`";
            $img = $attr->field($field)->where($where)->find();
            break;
        default:
            $field = "path_middle";
            $img = $attr->where($where)->getField($field);
            break;
    }


    return $img;
}

/**
 * Function:getUserPhoto
 * Author:wangyu
 * 获取用户头像
 * $uid 用户id
 * 存在则返回头像地址 不存在返回默认图片
 * @return mixed|string
 */
function getUserPhoto($uid)
{
    $membersInfo = M("membersInfo");
    $photo = $membersInfo->where("`uid` = '" . $uid . "'")->getField("`photo`");
    if ($photo) {
        return getAttrPath($photo);
    } else {
        return __APP__ . "/Public/home/images/ui/poster-1000x1000-200@0.5x.png";
    }
}

/**
 * Function:getUserName
 * Author:wangyu
 * 获取用户名称
 * $uid 用户id
 * @return bool|mixed
 */
function getUserName($uid)
{
    $membersInfo = M("membersInfo");
    $name = $membersInfo->where("`uid` = '" . $uid . "'")->getField("`name`");
    if ($name) {
        return $name;
    } else {
        return false;
    }
}

/**
 * Function:getFavourite
 * Author:wangyu
 * 获取用户和服务/项目/场地/导师/投资人的收藏/关注信息
 * $uid 当前登录用户
 * $mid 当前服务/项目/场地/导师/投资人的模块id
 * $pid 当前服务/项目/场地/导师/投资人的id
 * 返回值为true 已收藏/关注 false为未收藏/关注
 * @return bool
 */
function getFavourite($uid, $mid, $pid)
{
    $follow = M("follow");
    $where['uid'] = $uid;
    $where['mid'] = $mid;
    $where['pid'] = $pid;
    $rs = $follow->where($where)->find();
    if ($rs) {
        return true;
    } else {
        return false;
    }
}

/**
 * Function:getInvite
 * Author:wangyu
 * @return bool
 */
function getInvite($uid, $mid, $pid, $touid)
{
    $invite = M("interactive");
    $where['uid'] = $uid;
    $where['mid'] = $mid;
    $where['pid'] = $pid;
    $where['touid'] = $touid;
    $rs = $invite->where($where)->find();
    if ($rs) {
        return true;
    } else {
        return false;
    }
}

/**
 * Function:createOrder
 * Author:wangyu
 * 创建订单
 * $mid 模块id
 * $pid 商品id
 * $sprice 单价
 * $num 数量
 * $unit 单位
 */
function createOrder($mid, $pid, $sprice, $num, $unit)
{
    $data['uid'] = getOnlineUid();
    $data['mid'] = $mid;
    $data['pid'] = $pid;
    $data['sprice'] = $sprice;
    $data['num'] = $num;
    $data['total'] = $sprice * $num;
    $data['unit'] = $unit;
    $data['creat_date'] = time();
    $data['status'] = 0;
    M("orders")->add($data);
}

/**
 * Function:isAllow
 * Author:wangyu
 * 判断是否有权限进行下部操作
 * $uid 需要验证权限的用户id
 * $act 验证用户的那种权限 默认预览（preview） 约谈（interactive）
 * $mid 约谈需要判断内容来自板块
 * @return bool
 */
function isAllow($uid, $act = "preview", $mid = null)
{
    $members = M("members");
    switch ($act) {
        case "preview":
            $allow = array(4, 5);
            break;
        case "interactive":
            if ($mid == 4) {
                $allow = array(4, 5);
            } else {
                $allow = array(1);
            }
            break;
    }
    $role = $members->where("`uid` = " . $uid)->getField("`role`");
    if (in_array($role, $allow)) {
        switch ($role) {
            case 1:
                $db = M("membersInfo");
                $fields = "`auth`";
                break;
            case 4:
                $db = M("investors");
                $fields = "`status`";
                break;
            case 5:
                $db = M("tutors");
                $fields = "`status`";
                break;
        }
        $status = $db->where("`uid` = " . $uid)->getField($fields);
        if ($status == 1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Function:getArea
 * Author:wangyu
 * 获取地区
 * @return mixed
 */
function getArea($fid = null, $type = "province")
{
    $china = M("china");
    switch ($type) {
        case "city":
            $res = $china->where("`type` = 2 and `fid` = " . $fid)->select();
            break;
        case "area":
            $res = $china->where("`type` = 3 and `fid` = " . $fid)->select();
            break;
        default:
            $res = $china->where("`type` = 1 and `fid` = 1")->select();
            break;
    }
    return $res;
}

/**
 * Function:getAreaName
 * Author:wangyu
 * 获取地址名称
 * @return mixed
 */
function getAreaName($pid, $cid, $aid)
{
    $china = M("china");
    $where = "`id` in (" . $pid . "," . $cid . "," . $aid . ")";
    return $china->field("`name`")->where($where)->select();
}

/**
 * Function:getBankName
 * Author:wangyu
 * 获取银行名称
 * @return mixed
 */
function getBankName($id)
{
    $bankName = M("bankName");
    return $bankName->where("`id` = " . $id)->getField("`name`");
}

/**
 * Function:getAllowArea
 * Author:wangyu
 * 获取允许地区
 * @return mixed
 */
function getAllowArea($type)
{
    $areas = M("areas");
    switch ($type) {
        case "province":
            $field = "`pid`";
            break;
        case "city":
            $field = "`cid`";
            break;
        case "area":
            $field = "`aid`";
            break;
    }
    return $areas->getField($field);
}

/**
 * Function:sendMail
 * Author:wangyu
 * @FunctionName 邮件发送
 * @param $to 收件人
 * @param $title 信件标题
 * @param $content 信件内容
 * @return string 返回值 出错返回错误代码 成功返回success
 * @return string
 */
function sendMail($to, $title, $content)
{
    Vendor('PHPMailer.PHPMailerAutoload');
    $db = M("config");
    $mailParam = $db->where("`key` in ('mail_host','mail_user','mail_pwd','sitename')")->select();
    foreach ($mailParam as $v) {
        $param[$v['key']] = $v['value'];
    }
    $mail = new PHPMailer(); //实例化
    $mail->IsSMTP(); // 启用SMTP
    $mail->Host = $param['mail_host']; //smtp服务器的名称（这里以126邮箱为例）
    $mail->SMTPAuth = C('MAIL_SMTPAUTH'); //启用smtp认证
    $mail->Username = $param['mail_user']; //你的邮箱名
    $mail->Password = $param['mail_pwd']; //邮箱密码
    $mail->From = $param['mail_user']; //发件人地址（也就是你的邮箱地址）
    $mail->FromName = $param['sitename']; //发件人姓名
    $mail->AddAddress($to);
    $mail->WordWrap = 50; //设置每行字符长度
    $mail->IsHTML(C('MAIL_ISHTML')); // 是否HTML格式邮件
    $mail->CharSet = C('MAIL_CHARSET'); //设置邮件编码
    $mail->Subject = $title; //邮件主题
    $mail->Body = $content; //邮件内容
    $mail->AltBody = "This is the body in plain text for non-HTML mail clients"; //邮件正文不支持HTML的备用显示
    if (!$mail->Send()) {
        return "邮件发送失败: " . $mail->ErrorInfo;
    } else {
        return "success";
    }
}

/**
 * Function:mailTpl
 * Author:wangyu
 * @function 邮件发送模板
 * @param null $siteName 网站名称
 * @param $actMsg 操作信息
 * @param $content 操作结果
 * @return string 返回模板
 * @return string
 */
function mailTpl($siteName = null, $actMsg, $content)
{
    if ($siteName == null) {
        $siteName = M('config')->where("`key` = 'sitename'")->getField("`value`");
    }
    $tpl = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>' . $siteName . '</title><style>body{background-color: #f0f0f0;color: #666;}.logo{padding-top: 30px;}.container{ width: 800px;margin: 0 auto;}h1{border-bottom: 1px solid #333;text-align: center;padding-bottom: 20px;margin-bottom: 20px;}.main{background-color: #fff;border: 1px solid #dedede;margin-top: 40px;padding: 50px;}p{font-size: 14px;}</style></head><body><div class="container"><p><img class="logo" src="http://cloud.busionline.com/Public/home/images/ui/logo.png" alt=""></p><div class="main"><h1>' . $siteName . '-' . $actMsg . '</h1><p style="line-height: 24px;">' . $content . '</p><p style="margin-top:40px;">系统邮件，请勿回复。</p><p style="margin-top: 20px;">' . $siteName . '团队</p></div></div></body></html>';
    return $tpl;
}

/**
 * Function:getIpArea
 * Author:wangyu
 * Function:getIpArea
 * Author:wangyu
 * 获取IP
 * @return array
 * @return array
 */
function getIpArea()
{
    $Ip = new \Org\Net\IpLocation('UTFWry.dat');
    $area = $Ip->getlocation();
    $area['net'] = iconv("GBK", "UTF-8", $area['net']);
    $area['area'] = iconv("GBK", "UTF-8", $area['area']);
    return $area;
}

/**
 * Function:deviceToWorkTeam
 * Author:wangyu
 * 根据indexCode返回工作组名称
 * Author:wangyu
 * @return string
 * @return string
 */
function deviceToWorkTeam($indexCode){
    $device = S('deviceTable');
    if(!$device){
        $device = M('device_list')->select();
        S('deviceTable',$device);
    }
    foreach($device as $v){
        if($v['index_code'] == $indexCode){
            return $v['name'];
        }
    }
    return $indexCode ? : "未选择班组";
}