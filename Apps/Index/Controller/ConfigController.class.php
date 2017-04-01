<?php
namespace Index\Controller;
use Think\Controller;
/**
 * 此注释用于后台自动生成权限表（勿删）
 * @ACTION_DEFAULT_CN_NAME:系统设置
 * @ACTION_DEFAULT_ICON:menu-icon fa fa fa-cog
 */
class ConfigController extends ActionController {

    public function index(){
        $config = M("config");
        if(IS_POST){
            $_POST['allAreaOn'] = $_POST['allAreaOn'] == 1 ? 1:0;
            foreach($_POST as $k => $v){
                $where["key"] = $k;
                $config->where($where)->setField("value",trim($v));
            }
            unset($_SESSION['webconf']);
            $this->success("修改成功！",U("config/index"));
        }else{
            $configs = $config->select();
            foreach($configs as $k => $v){
                $conf[$v["key"]] = $v["value"];
            }
            $this->assign("conf",$conf);
            $this->display();
        }
    }


    public function mailTest()
    {
        if(IS_POST){
            $yet = sendMail(I('email'),"hzecn_org发信测试","跟标题说的一样啦");
            echo json_encode(array("msg"=> $yet));
        }else{
            echo json_encode(array("msg"=> "非法操作！"));
        }

    }

    public function bindWorkGroup()
    {
        if(IS_AJAX && $_GET['act'] == 'bind'){
            $uid = I('post.uid');
            $did = I('post.did');
            if(M('device_list')->where('index_code = "'.$did.'"')->setField('bind_user_id',$uid)){
                echo 1;
            }else{
                echo 2;
            }
            exit();
        }
        $device = M('device_list')->order('index_code asc')->select();
        $this->assign('device',$device);
        $user = M('admin')->where('username not in ("admin","zhongxin")')->select();
        $this->assign('user',$user);
        $this->display();
    }

    public function syncDevice()
    {
        // $url = $_SERVER['SERVER_NAME'].U('wbs/getResourceByPage?resType=1000');
        $url = 'http://221.12.107.194:1800'.U('wbs/getResourceByPage?resType=1000');
        $ch = curl_init($url);
        #############################
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT,6);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept' => '*/*',
            'Accept-Charset' => 'UTF-8,*;q=0.5',
            'Accept-Encoding' => 'gzip,deflate,sdch',
            'Accept-Language' => 'zh-CN,zh;q=0.8',
            'Connection' => 'keep-alive',
            'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11',
            'X-Requested-With' => 'XMLHttpRequest',
        ));
        curl_setopt($ch, CURLOPT_VERBOSE , 1);
        ##############################
        $json = curl_exec($ch);
        curl_close($ch);
        $device = json_decode($json,true);

        $db = M('device_list');
        foreach($device as $v){
            if($db->where('index_code = "'.$v['indexCode'].'"')->find()){
                $db->where('index_code = "'.$v['indexCode'].'"')->setField('name',$v['name']);
            }else{
                $data = array('index_code' => $v['indexCode'],'name' => $v['name']);
                $db->add($data);
            }
        }
        $this->success("同步成功！");
    }

}
