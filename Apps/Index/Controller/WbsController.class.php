<?php
namespace Index\Controller;
use Think\Controller;

/**
 * 此注释用于后台自动生成权限表（勿删）
 * @ACTION_DEFAULT_CN_NAME:工作视频查看
 * @ACTION_DEFAULT_ICON:menu-icon fa fa-video-camera
 */
class WbsController extends Controller {


    private $client;
    private $user;
    private $password;
    // CONST USER = 'admin';//平台登录用户
    // CONST PASSWORD = 'Ele12345+'; 平台登录密码
    //CONST USER = 'wuchangqian';
    //CONST PASSWORD = 'qianqian123!'; ## wuchangqian的密码？

    //平台IP地址
    CONST SERVICEIP = '221.12.107.194';

    public function _initialize()
    {
        $db = M("config");
        $webconfing = $db->select();
        $webconf = array();
        foreach($webconfing as $k => $v){
            $webconf[$v["key"]] = $v["value"];
        }
        $this->user = $webconf['cloudUser'];
        $this->password = $webconf['cloudPwd'];
        // var_dump($webconf);die();
        $this->client = new \SoapClient("http://221.12.107.194/vms/services/VmsSdkWebService?wsdl");
    }

    /**
     * iframe框架 预览回放总页面
     * +------------------------------------------------------------------
     * @function_name : main
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * +------------------------------------------------------------------
     */
    public function main()
    {
        $f = I('f');
        $indexCode = I('indexCode');
        $time = I('time');
        if($f == 'playback'){
            //echo $time;
            $timeArr = explode('至',$time);
            echo $btime = trim($timeArr[0]).":00";
            echo $etime = trim($timeArr[1]).":00";
            $this->redirect('wbs/playback?indexCode='.$indexCode.'&btime='.$btime.'&etime='.$etime);
        }elseif($f == 'real'){
            $this->redirect('wbs/real?indexCode='.$indexCode);
        }else{
            $this->error('参数错误');
            exit();
        }
    }

    /**
     * 视频回放页面
     * +------------------------------------------------------------------
     * @function_name : playBack
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * +------------------------------------------------------------------
     */
    public function playBack()
    {
        $indexCode = I('indexCode');
        $btime = I('btime');
        $etime = I('etime');
        if(!$indexCode || !$btime || !$etime){
            $this->error('参数错误！');
            exit();
        }
        $tgt = $this->sdkLogin();
        $this->assign('token',$this->getTokenByTgt($tgt['tgc']));
        $this->assign('tgt',$tgt['tgc']);
        $this->assign('indexCode',$indexCode);
        $this->display();
    }

    /**
     * 视频预览页面
     * +------------------------------------------------------------------
     * @function_name : streaming
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @param $indexCode监控点编号
     * +------------------------------------------------------------------
     */
    public function real()
    {
        $indexCode = I('indexCode');
        if(!$indexCode){
            $this->error('参数错误！');
            exit();
        }
        $tgt = $this->sdkLogin();
        $this->assign('token',$this->getTokenByTgt($tgt['tgc']));
        $this->assign('indexCode',$indexCode);
        $this->assign('tgt',$tgt['tgc']);

        $this->display();
    }

    /**
     * 用户登录 获取登录票据tgt 并取出tgt返回
     * +------------------------------------------------------------------
     * @function_name : sdkLogin
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @return array
     * +------------------------------------------------------------------
     */
    private function sdkLogin()
    {
        if(!$_SESSION['tgc']){
            //用户登录 获取登录票据tgt 并取出tgt
            $login = array(
                'loginAccount' => $this->user,
                'password' => hash('sha256',$this->password),
                'serviceIp' => SELF::SERVICEIP,
                'clientIp' => '',
                'clientMac' => ''
            );
            $result = $this->client->__soapCall('sdkLogin',array($login));
            $loginArr = $this->objToArray(simplexml_load_string($result->return));
            $tgc = $loginArr['rows']['row']['@attributes']['tgt'];
            $_SESSION['tgc'] = $tgc;
        }
        return array('tgc' => $_SESSION['tgc']);
    }

    /**
     * 用户登出
     * +------------------------------------------------------------------
     * @function_name : sdkLogout
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * +------------------------------------------------------------------
     */
    public function sdkLogout()
    {
        $tgc = array('tgc' => I('tgc'));
        $this->client->__soapCall('sdkLogout',array($tgc));
        echo 1;
    }

    /**
     * 格式化时间 返回 2016-11-22T00:00:00Z
     * +------------------------------------------------------------------
     * @function_name : formatDate
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @param $date
     * @return string
     * +------------------------------------------------------------------
     */
    private function formatDate($date)
    {
        $ary = explode(' ',$date);
        return $ary[0].'T'.$ary[1].'Z';
    }

    /**
     * 获取回放流的xml文件
     * +------------------------------------------------------------------
     * @function_name : getPlayBackXml
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * +------------------------------------------------------------------
     */
    public function getPlayBackXml()
    {
        $tgt = $this->sdkLogin();
        //获取回放数据xml
        $playBack = array(
            'token' => $this->getTokenByTgt($tgt),
            'cameraIndexCode' => I('indexCode'),
            'clientIp' => SELF::SERVICEIP,
            'beginTime' => urldecode(I('beginTime')),
            'endTime' => urldecode(I('endTime')),
            'storeDeviceType' => I('storeType')
        );
        //file_put_contents('d:t.php',print_r($playBack,true));DIE();
        $result = $this->client->__soapCall('getPlaybackOcxOptions',array($playBack));
        $xml = str_replace("\r","",$result->return);
        $xml = str_replace("\n","",$xml);
        ob_clean();
        echo $xml;
    }

    public function getStreamXml()
    {
        $tgt = $this->sdkLogin();
        //获取预览数据xml
        $preview = array(
            'token' => $this->getTokenByTgt($tgt),
            'cameraIndexCode' => I('indexCode'),
            'clientIp' => SELF::SERVICEIP,
        );
        $result = $this->client->__soapCall('getPreviewOcxOptions',array($preview));
        $xml = str_replace("\r","",$result->return);
        $xml = str_replace("\n","",$xml);
        ob_clean();
        echo $xml;
    }

    /**
     * 对象转数组
     * +------------------------------------------------------------------
     * @function_name : objToArray
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @param $object
     * @return mixed
     * +------------------------------------------------------------------
     */
    private function objToArray($object)
    {
        return @json_decode(@json_encode($object),1);
    }


    /**
     * 获取操作凭证token（通过登录的票据tgt 获取业务令牌）
     * +------------------------------------------------------------------
     * @function_name : getTokenByTgt
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @param $tgt
     * +------------------------------------------------------------------
     */
    private function getTokenByTgt($tgt)
    {
        $result = $this->client->__soapCall('applyToken',array($tgt));
        $tokenArr = $this->objToArray(simplexml_load_string($result->return));
        return $tokenArr['rows']['row']['@attributes']['st'];
    }

    /**
     * Ajax获取token 请求实例 index.php?m=index&c=wbs&a=ajaxGetToken
     * +------------------------------------------------------------------
     * @function_name : ajaxGetToken
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * +------------------------------------------------------------------
     */
    public function ajaxGetToken()
    {
        if(!IS_AJAX){
            echo '非法请求！';
            exit();
        }
        $tgt = array('tgc'=>$_SESSION['tgc']);
        $result = $this->client->__soapCall('applyToken',array($tgt));
        $tokenArr = $this->objToArray(simplexml_load_string($result->return));
        ob_clean();
        echo $tokenArr['rows']['row']['@attributes']['st'];
    }

    /**
     * 获取监控点资源
     * +------------------------------------------------------------------
     * @function_name : getResourceByPage
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @param resType 资源类型
     * +------------------------------------------------------------------
     */
    public function getResourceByPage()
    {
        $param = array(
            'token' => $this->getTokenByTgt($this->sdkLogin()),
            'resType' => I('resType'),
            'pageNo' => 1,
            'pageSize' => 500,
            'operCode' => null,
            'orderBy' => null,
            'sort' => 0
        );
        $result = $this->client->__soapCall('getResourceByPage',array($param));
        $ary = $this->objToArray(simplexml_load_string($result->return));
        foreach($ary['rows']['row'] as $v){
            $wantAry[] = array(
                "areaCode" => $v['@attributes']['c_area_code'],
                "classname" => $v['@attributes']['c_classname'],
                "id" => $v['@attributes']['i_id'],
                "indexCode" => "".$v['@attributes']['c_index_code']."",
                "isParent" => true,
                "order" => $v['@attributes']['i_order'],
                "orgCode" => $v['@attributes']['c_org_code'],
                "orgDesc" => $v['@attributes']['c_org_desc'],
                "orgInternalCode" => "",
                "name" => $v['@attributes']['c_org_name'],
                "parentId" => $v['@attributes']['i_parent_id'],
                "path" => $v['@attributes']['c_path']
            );
        }
        ob_clean();
        if(I('get.indexCode')){
            foreach($wantAry as $k => $v){
                if(I('get.indexCode') == $v['indexCode'] || $v['indexCode'] == '001001'){
                    $newAry[] = $v;
                }
            }
            $wantAry = $newAry;
        }
        echo json_encode($wantAry);
    }

    public function getCamera()
    {
        $param = array(
            'token' => $this->getTokenByTgt(array('tgc'=>$_SESSION['tgc'])),
            'resType' => 10000,
            'orgCode' => I('indexCode'),
            'operCode' => null
        );
        $result = $this->client->__soapCall('getResourceByOrgCode',array($param));
        $ary = $this->objToArray(simplexml_load_string($result->return));
        foreach($ary['rows']['row'] as $v){
            $wantAry[] = array(
                "cameraType" => $v['@attributes']['i_camera_type'],
                "cascadeCode" => $v['@attributes']['c_cascade_code'],
                "channelNo" => $v['@attributes']['i_channel_no'],
                "cls" => 'ico m-gun',
                "deviceIndexCode" => $v['@attributes']['c_ed_device_code'],
                "domainId" => $v['@attributes']['i_domain_id'],
                "ezvizCameraCode" => $v['@attributes']['c_ezviz_camera_code'],
                "id" => $v['@attributes']['id'],
                "indexCode" => $v['@attributes']['orgInternalCode'],
                "isBindAudio" => $v['@attributes']['i_is_bind_audio'],
                "isOnline" => $v['@attributes']['i_is_online'],
                "mainBitRate" => $v['@attributes']['i_main_bit_rate'],
                "mainRateType" => $v['@attributes']['i_main_rate_type'],
                "matrixCode" => $v['@attributes']['c_matrix_code'],
                "name" => $v['@attributes']['c_name'],
                "orgId" => $v['@attributes']['i_org_id'],
                "pixel" => $v['@attributes']['i_pixel'],
                "ptzType" => $v['@attributes']['i_ptz_type'],
                "recordLocationSet" => $v['@attributes']['i_record_location_set'],
                "sequenceIdx" => $v['@attributes']['i_sequence_idx'],
                "streamLinkType" => $v['@attributes']['i_stream_link_type'],
                "streamType" => $v['@attributes']['i_stream_type'],
                "streamUrl" => $v['@attributes']['c_stream_url'],
                "tag" => $v['@attributes']['tag']
            );
        }
        ob_clean();
        echo json_encode($wantAry);
    }
}

