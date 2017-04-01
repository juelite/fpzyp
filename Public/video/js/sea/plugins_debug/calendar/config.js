var skinList = ['default', 'whyGreen'];
var $d, $dp, $pdp = parent.$dp, $dt, $tdt, $sdt, $IE = $pdp.ie, $FF = $pdp.ff, $OPERA = $pdp.opera, $ny, $cMark = false;
if ($pdp.eCont) {
	$pdp.status=2;//by nihf
	$dp = {};
	for (var p in $pdp) {
		$dp[p] = $pdp[p];
	}
} else
	$dp = $pdp;

var getSkin = function(name) {
	var arr = skinList;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == name) {
			return name;
		}
	}
	return arr[0];
}
document.write("<script src='lang/" + $dp.lang + ".js' charset='UTF-8'><\/script>");
var skin = getSkin($dp.skin);
document.write('<link rel="stylesheet" type="text/css" href="skin/' + skin + '/datepicker.css" title="' + skin
		+ '" charset="UTF-8" disabled="true"/>');
