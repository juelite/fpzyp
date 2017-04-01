<?php
namespace Index\Controller;
use Think\Controller;
class MainController extends ActionController {
    public function index(){


        $this->display();
    }
    public function logout(){
        unset($_SESSION['online']);
        kill_session();
        $this->success("退出成功！",U("index/index"));
    }
}