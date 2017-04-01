<?php
namespace Index\Controller;
use Think\Controller;
class ActionController extends Controller {
    public function _initialize(){
        $online = get_session("online");
        if($online){
            $tm = time()-$online[5];
            if($tm > 3600){
                kill_session();
                $this->error("登录超时，请重新登录！",U("index/index"));
                exit();
            }else{
                $online[5] = time();
                set_session($online,"online");
                $this->assign("online",$online);
            }
        }else{
            unset($_SESSION['online']);
            kill_session();
            $this->error("请先登录！",U("index/index"));
            exit();
        }
        if(!$_SESSION['webconf']){
            $db = M("config");
            $webconfing = $db->select();
            foreach($webconfing as $k => $v){
                $webconf[$v["key"]] = $v["value"];
            }
            $_SESSION['webconf'] = $webconf;
        }
        $this->assign("webconf",$_SESSION['webconf']);
        /*生成管理员界面菜单*/
        $contraller_name = strtolower(CONTROLLER_NAME);
        $action_name = strtolower(ACTION_NAME);
        $power = M("sysUserGroups")->where("`id` = " . $online[4])->getField("`powers`");
        if(!in_array($contraller_name."/".$action_name,array("main/index","main/logout"))) {
            if ($online[4] != 1) {
                $url = strtolower(CONTROLLER_NAME) . "/" . strtolower(ACTION_NAME);
                $ps = M("sysAction")->where("`code` = '" . $url . "'")->find();
                $arr = explode(",", $power);
                if (!in_array($ps['id'], $arr)) {
                    $this->error("没有权限！");
                    exit();
                }
            }
        }
        $memberModules = M("sysAction");
        $baseModule = $memberModules->field("`id`,`name`,`code`")->where("`fid` = 0 and `status` = 0")->order("`sort` asc")->select();
        if($online[4] == 1){
            $where = "";
        }
        foreach($baseModule as $k => $v){
            if($online[4] == 1){
                $baseModule[$k]['sub'] = $memberModules->field("`name`,`code`")->where("`fid` = '".$v['id']."' and `status` = 0")->order("`sort` asc")->select();
            }else{
                $baseModule[$k]['sub'] = $memberModules->field("`name`,`code`")->where("`fid` = '".$v['id']."' and `id` in (".$power.") and `status` = 0")->order("`sort` asc")->select();
                if(empty($baseModule[$k]['sub'])){
                    unset($baseModule[$k]);
                }
            }
        }
        $this->assign("allowModule",$baseModule);
    }

    /**
     * 获取当前作业票的工单编号和会议记录id以及现场勘察id
     * @param $table  工单来源数据表
     * @param $id  当前工单id
     * @return array  返回工单编号和 会议勘察id
     */
    public function get_zyp_sub_order($table , $id )
    {
        $db = M($table);
        $gongdanbianhao = $db->where("id = '".$id."'")->getField("gongdanbianhao");
        $hyId = M("hy_order")->where("gongdanbianhao = '".$gongdanbianhao."'")->getField("id");
        $kcId = M("kc_order")->where("gongdanbianhao = '".$gongdanbianhao."'")->getField("id");
        $aqjyId = M("aqjy")->where("gongdanbianhao = '".$gongdanbianhao."'")->getField("id");
        $data = array(
            'gongdanbianhao' => $gongdanbianhao,
            'hyId' => $hyId,
            'kcId' => $kcId,
            'aqjyId' => $aqjyId
        );
        return $data;
    }

    /**
     *
     * +------------------------------------------------------------------
     * @function_name : fetchConfigByComment
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * @param $contents 读取的文件内容
     * @return array [ $ary['ACTION_DEFAULT_CN_NAME'] = 描述信息 $ary['ACTION_DEFAULT_ICON'] = icon ]
     * +------------------------------------------------------------------
     */
    protected function fetchConfigByComment($contents){
        $ary = array();
        $regex = '{/\*\*[\s\S]*? \*/}xm';
        preg_match($regex, $contents, $comment);
        $ma = '{
        @([\w]+)(?:\s*?):(?:\s*?)([^\n\r]*?)(?=\r?\n)}xm';
        preg_match_all($ma , isset($comment[0]) ? $comment[0] : '' , $matches);
        foreach($matches[1] as $k=>$v){
            $ary[trim($v)] = $matches[2][$k];
        }
        return $ary;
    }

    protected function getWorkGroup()
    {
        $group = M('device_list')->select();
        foreach($group as $v){
            $groups[$v['index_code']] = $v['name'];
        }
        return $groups;
    }

    protected function delZypAndSub($table,$id)
    {
        $no = $table->where('id = "'.$id.'"')->getField("gongdanbianhao");
        $table->where('id = "'.$id.'"')->delete();
        $condition['gongdanbianhao'] = $no;
        M('aqjy')->where($condition)->delete();
        M('hy_order')->where($condition)->delete();
        M('kc_order')->where($condition)->delete();
        return;
    }

}