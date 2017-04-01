<?php
    if(C('LAYOUT_ON')) {
        echo '{__NOLAYOUT__}';
    }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>跳转提示</title>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <link rel="shortcut icon" href="/favicon.ico" >
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel=stylesheet href="__PUBLIC__/tools/styles/vendor.css">
    <link rel=stylesheet href="__PUBLIC__/tools/styles/main.min.css">
</head>
<body>

<div class="container">
    <h1 class="page-header">
      跳转提示
    </h1>
	<?php if(isset($message)) {?>
    <!-- 成功时输出的结构 -->
    <div class="panel panel-success">
      <div class="panel-heading">
        <h3 class="panel-title">成功</h3>
      </div>
      <div class="panel-body">
        <p><?php echo($message); ?></p>
        <ul>
          <li>页面自动 <a id="href" href="<?php echo($jumpUrl); ?>">跳转</a> 等待时间： <b id="wait"><?php echo($waitSecond); ?></b></li>
        </ul>
        <!-- <hr>
        <div class="text-center">
          <a href="/" class="btn btn-danger">返回首页</a>
        </div> -->
      </div>
    </div>
	<?php }else{?>
    <!-- 失败时输出的结构 -->
    <div class="panel panel-warning">
      <div class="panel-heading">
        <h3 class="panel-title">失败</h3>
      </div>
      <div class="panel-body">
        <p><?php echo($error); ?></p>
        <ul>
          页面自动 <a id="href" href="<?php echo($jumpUrl); ?>">跳转</a> 等待时间： <b id="wait"><?php echo($waitSecond); ?></b>
        </ul>
        <!-- <hr>
        <div class="text-center">
          <a href="/#apply" class="btn btn-warning">返回重新申请</a>
        </div> -->
      </div>
    </div>
    <?php }?>
  </div>
<!--<div class="system-message" style="d">
<?php if(isset($message)) {?>
<h1> </h1>
<p class="success"><?php echo($message); ?></p>
<?php }else{?>
<h1> </h1>
<p class="error"><?php echo($error); ?></p>
<?php }?>
<p class="detail"></p>
<p class="jump">
页面自动 <a id="href" href="<?php echo($jumpUrl); ?>">跳转</a> 等待时间： <b id="wait"><?php echo($waitSecond*10000); ?></b>
</p>
</div>-->
<script type="text/javascript">
(function(){
var wait = document.getElementById('wait'),href = document.getElementById('href').href;
var interval = setInterval(function(){
	var time = --wait.innerHTML;
	if(time <= 0) {
		location.href = href;
		clearInterval(interval);
	};
}, 1000);
})();
</script>
</body>
</html>
