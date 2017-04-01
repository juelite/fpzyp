<?php
namespace Index\Controller;
use Think\Controller;
/**
 * 此注释用于后台自动生成权限表（勿删）
 * @ACTION_DEFAULT_CN_NAME:权限设置
 * @ACTION_DEFAULT_ICON:menu-icon fa fa-flash
 */
class SysController extends ActionController
{
    public function groups()
    {
        $group = M("sysUserGroups");
        $key = I('keyword');
        if($key && $key != ""){
            $this->assign("keyword",$key);
            $where = "`name` like '%".$key."%'";
        }else{
            $where = "";
        }
        $count = $group->where($where)->count();
        $page = new \Think\Page($count,C("page_limits"));
        $show = $page->show();
        $groups = $group->where($where)->order('`id` asc')->limit($page->firstRow .','. $page->listRows)->select();
        $this->assign("groups",$groups);
        $this->assign("show",$show);
        $this->display();
    }

    public function group_add()
    {
        if(IS_POST){
            $group = M("sysUserGroups");
            $data['name'] = $name = I("name");
            if($name == ""){
                $this->error("请输入分组名称！");
                exit();
            }
            if($group->add($data)){
                $this->success("分组添加成功！",U('sys/groups'));
                exit();
            }else{
                $this->error("系统错误！");
                exit();
            }
        }else{
            $this->display();
        }
    }
    public function group_del()
    {
        $groups = M("sysUserGroups");
        $where['id'] = $id = I("id");
        $group = $groups->where($where)->find();
        if($group){
            $groups->where($where)->delete();
            M("admin")->where("`group` = ".$id)->delete();
            $this->success("删除分组以及分组下的用户成功");
        }else{
            $this->error("非法操作！");
        }
    }

    public function actions()
    {
        $modules = M("sysAction");
        $key = I('keyword');
        if($key && $key != ""){
            $where = "(`name` like '%".$key."%' or `code` like '%".$key."%') and `fid` = 0";
        }else{
            $where = "`fid` = 0";
        }
        $module = $modules->where($where)->order('`sort` asc')->select();
        foreach($module as $k => $v){
            $module[$k]['sub'] = $modules->where("`fid` = ".$v['id'])->order("`sort` asc")->select();
        }
        $this->assign("module",$module);
        $this->display();
    }

    public function action_add()
    {
        $modules = M("sysAction");
        if(IS_POST){
            $fid = $data['fid'] = I("fid");
            if($fid == 0){
                if(!I("name") || !I("sort")){
                    $this->error("信息不完整！");
                    exit();
                }
            }else{
                if(!I("name") || !I("code") || !I("sort")){
                    $this->error("信息不完整！");
                    exit();
                }
            }
            $data['name'] = I("name");
            $data['code'] = I("code");
            $data['sort'] = I("sort");
            if(I("status") == "on"){
                $data['status'] = 0;
            }else{
                $data['status'] = 1;
            }
            if($modules->add($data)){
                $this->success("添加成功！",U("sys/actions"));
            }else{
                $this->error("添加失败！");
            }
        }else{
            $fm = $modules->where("`fid` = 0")->order("`sort` asc")->select();
            $this->assign("fm",$fm);
            $this->display();
        }
    }
    public function action_edit(){
        if(IS_POST){
            $where['id'] = I('id');
            $modules = M("sysAction");
            if($modules->where($where)->find()){
                $data['fid'] = I("fid");
                $data['name'] = I("name");
                $data['code'] = I("code");
                if(I("status") == "on"){
                    $data['status'] = 0;
                }else{
                    $data['status'] = 1;
                }
                $data['sort'] = I("sort");
                if($modules->where($where)->save($data)){
                    $this->success("编辑成功！",U("sys/actions"));
                }else{
                    $this->error("修改失败！");
                }
            }else{
                $this->error("非法操作！");
                exit();
            }
        }else{
            $where['id'] = I('id');
            $modules = M("sysAction");
            $module = $modules->where($where)->find();
            if($module){
                $this->assign("module",$module);
                $fm = $modules->where("`fid` = 0")->order("`sort` asc")->select();
                $this->assign("fm",$fm);
                $this->display();
            }else{
                $this->error("非法操作！");
                exit();
            }
        }
    }
    public function set_status(){
        $where['id'] = I("id");
        $modules = M("sysAction");
        $module = $modules->where($where)->find();
        if(!$module){
            $this->error("非法操作！");
            exit();
        }
        if($module['status'] == 0){
            $data['status'] = 1;
        }else{
            $data['status'] = 0;
        }
        $rs = $modules->where($where)->save($data);
        if($rs){
            $this->redirect("sys/actions");
        }
    }
    public function power(){
        if(IS_POST){
            $where['id'] = I("id");
            $roles = M("sysUserGroups");
            $role = $roles->where($where)->find();
            if(!$role){
                $this->error("非法操作！");
                exit();
            }
            $modules = M("sysAction");
            $mid = $modules->field("`id`")->where("`fid` = 0")->select();
            foreach($mid as $v){
                if($_POST[$v['id']]){
                    foreach($_POST[$v['id']] as $a){
                        $allow[] = $a;
                    }
                }
            }
            $data['powers'] = implode(",",$allow);
            if($roles->where($where)->save($data)){
                $this->success("权限设置成功！",U('sys/power',array('id'=>$where['id'])));
            }else{
                $this->success("权限设置成功！",U('sys/power',array('id'=>$where['id'])));
            }
        }else{
            $where['id'] = I("id");
            $roles = M("sysUserGroups");
            $role = $roles->where($where)->find();
            if(!$role){
                $this->error("非法操作！");
                exit();
            }
            $allows = explode(",",$role['powers']);
            foreach($allows as $v){
                $aw[$v] = $v;
            }
            $role['power'] = $aw;
            $this->assign("role",$role);
            $modules = M("sysAction");
            $module = $modules->where("`fid` = 0")->order("`sort` asc")->select();
            foreach($module as $k => $v){
                $module[$k]['sub'] = $modules->where("`fid` = ".$v['id'])->order("`sort` asc")->select();
            }
            $groups = array();
            $this->assign("module",$module);
            #################### 设置groups
            ### 这里把用户组列出来，方便同时设置多个组权限的情况（不用每次都返回列表页）
            $group = M("sysUserGroups");
            $groups = $group->where(array('id'=>array('gt' , 1)) )->select();
            $this->assign("groups",$groups);
            $this->assign("currentGroupId" , I("id"));
            #################### end 设置groups
            $this->assign("groups" , $groups);
            $this->display();
        }
    }

    public function action_del()
    {
        $where['id'] = I("id");
        $db = M("sysAction");
        $del_id = $db->where($where)->delete();
        if(!$del_id){
            $this->error("非法操作！");
            exit();
        }
        $db->where($where)->delete();
        $db->where("`fid` = ".I("id"))->delete();
        $this->redirect("sys/actions");
        //$this->success("删除成功！");
    }

    public function users()
    {
        $members = M("admin");
        $key = I('keyword');
        if($key && $key != ""){
            $this->assign("keyword",$key);
            if($key == "正常"){
                $where = "`status` = 0";
            }elseif($key == "禁用"){
                $where = "`status` = 1";
            }else{
                $where = "`username` like '%".$key."%' or `realname` like '%".$key."%'";
            }
        }else{
            $where = "";
        }
        $count = $members->where($where)->count();
        $page = new \Think\Page($count,C("page_limits"));
        $show = $page->show();
        $member = $members->where($where)->order('`id` asc')->limit($page->firstRow .','. $page->listRows)->select();
        $roles = M("sysUserGroups");
        $roles = $roles->field("`id`,`name`")->select();
        foreach($roles as $v){
            $role[$v['id']] = $v['name'];
        }
        foreach($member as $k => $v){
            $member[$k]['groupText'] = $role[$v['group']];
        }
        $this->assign("member",$member);
        $this->assign("show",$show);
        $this->display();
    }

    public function user_add()
    {
        $db = M("admin");
        if(IS_POST){
            $uid = I("uid");
            $data['group'] = I("group");
            $data['realname'] = I("realname");
            $data['username'] = I("username");
            $data['cno'] = I("cno");
            $data['add_date'] = time();
            if($uid){
                if(I("password")){
                    $data['salt'] = random(8);
                    $data['password'] = get_password(I('password'),$data['salt']);
                }
                $db->where("`id` = ".$uid)->save($data);
            }else{
                $data['salt'] = random(8);
                $data['password'] = get_password(I('password'),$data['salt']);
                $db->add($data);
            }
            $this->success("操作成功！");
        }else{
            $uid = I("id");
            if($uid){
                $edit = $db->where("`id` = ".$uid)->find();
                $this->assign("edit",$edit);
            }
            $ug = M("sysUserGroups");
            $groups = $ug->field("`id`,`name`")->where("`id` != 1")->select();
            $this->assign("groups",$groups);
            $this->display();
        }
    }
    public function user_status()
    {
        $id = I("id");
        if($id == 1){
            $this->redirect('sys/users');
            exit();
        }
        $admin = M("admin");
        $status = $admin->where("`id` = ".$id)->getField("`status`");
        if($status == 0){
            $data['status'] = 1;
        }else{
            $data['status'] = 0;
        }
        $admin->where("`id` = ".$id)->save($data);
        $this->redirect('sys/users');
    }

    public function user_del()
    {
        $id = I("id");
        if($id == 1){
            $this->redirect('sys/users');
            exit();
        }
        $admin = M("admin");
        $uid = $admin->where("`id` = ".$id)->getField("`id`");
        if($uid > 0){
            $admin->where("`id` = ".$id)->delete();
        }
        $this->redirect('sys/users');
    }

    public function reSetPwd()
    {
        if(IS_POST){
            $online = get_session("online");
            if(!$online){
                $this->error("没有检测到登录或登录已超时！");
                exit();
            }
            $oldpwd = I("oldpwd");
            $newpwd = I("newpwd");
            $newpwd1 = I("newpwd1");
            if($newpwd != $newpwd1){
                $this->error("新密码两次输入不一致！");
                exit();
            }
            if($newpwd == ""){
                $this->error("请输入新密码！");
                exit();
            }
            $uid = $online[0];
            $user = M("admin")->where("`id` = ".$uid)->find();
            if(!check_password($oldpwd,$user['salt'],$user["password"])){
                $this->error("旧密码不正确！");
                exit();
            }
            if(check_password($newpwd,$user['salt'],$user["password"])){
                $this->error("新密码不能和旧密码一样！");
                exit();
            }
            $data['salt'] = random(8);
            $data['password'] = get_password($newpwd,$data['salt']);
            M("admin")->where("`id` = ".$uid)->save($data);
            $this->success("密码修改成功");
        }else{
            $this->display();
        }
    }

    /**
     *
     * +------------------------------------------------------------------
     * @function_name : syncPowers
     * +------------------------------------------------------------------
     * @author : wangyu
     * +------------------------------------------------------------------
     * 同步更新权限表
     * +------------------------------------------------------------------
     */
    public function syncPowers()
    {
        $Not_Import_List = array(
            '.',
            '..',
            'index.html',
            'ActionController.class.php',
            'MainController.class.php',
            'IndexController.class.php',
            'WbsController.class.php',
        );
        $adminDir = dirname(__FILE__);
        if (is_dir($adminDir)) {
            if ($dh = opendir($adminDir)) {
                while (($file = readdir($dh)) !== false) {
                    if(!in_array($file,$Not_Import_List)){
                        $tmp = explode('.',$file);
                        $name = str_replace('Controller','',$tmp[0]);
                        $ControllerList[$name]['name'] = $file;
                        $ControllerList[$name]['nameSpace'] = 'Index\Controller\\'.$tmp[0];
                    }

                }
                closedir($dh);
            }
        }
        foreach($ControllerList as $k => $v){
            $classNameSpace = $v['nameSpace'];
            $class = new \ReflectionClass($classNameSpace);
            $methods = $class->getMethods(\ReflectionProperty::IS_PUBLIC);
            foreach($methods as $a => $b){
                if($b->class != $classNameSpace){
                    unset($methods[$a]);
                }else{
                    $controllerContent = $this->fetchConfigByComment(file_get_contents($adminDir.'\\'.$v['name']));
                    $actionLists[$k]['name'] = $controllerContent['ACTION_DEFAULT_CN_NAME'];
                    $actionLists[$k]['icon'] = $controllerContent['ACTION_DEFAULT_ICON'];
                    $actionLists[$k]['sub'][] = strtolower($k)."/".strtolower($b->name);
                }
            }
        }
        $db = M('sys_action');
        foreach($actionLists as $a => $v){
            $data['fid'] = 0;
            $data['name'] = $v['name'];
            $data['code'] = $v['icon'];
            switch(strtolower($a)){
                case 'config':
                    $data['sort'] = 1;
                    break;
                case 'sys':
                    $data['sort'] = 2;
                    break;
                case 'tongji':
                    $data['sort'] = 999;
                    break;
                case 'work':
                    $data['sort'] = 100;
                    break;
                default:
                    $data['sort'] = 99;
                    break;
            }
            $id[$a] = $db->add($data);
            foreach($v['sub'] as $k){
                if($db->where('code = "'.$k.'"')->find()){
                    $db->where('code = "'.$k.'"')->setField('fid',$id[$a]);
                }else{
                    $sub['fid'] = $id[$a];
                    $sub['name'] = 'coming soon';
                    $sub['code'] = $k;
                    $sub['sort'] = 99;
                    $sub['status'] = 1;
                    $db->add($sub);
                }
            }
        }
        $where['fid'] = array('not in',$id);
        $where['id'] = array('not in',$id);
        $db->where($where)->delete();
        $this->success('同步成功！正在跳转');
    }

}

