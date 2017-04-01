<?php
namespace Index\Controller;
use Think\Controller;
/**
 * 此注释用于后台自动生成权限表（勿删）
 * @ACTION_DEFAULT_CN_NAME:数据统计
 * @ACTION_DEFAULT_ICON:menu-icon fa fa-pie-chart
 */
class TongjiController extends ActionController {

    public function index(){
        $userPd = array();
        $userXl = array();
        $pduser = M('admin')->field('id , username , realname')
            ->where(array('group' => array("in" , array('1002' ,  '1000'))))
            ->select();
        $xluser = M('admin')->field('id , username , realname')
            ->where(array('group' => array("in" , array('1001' , '1000'))))
            ->select();
        foreach( $pduser  as $v){
            $userPd[] = $v['realname'];
        };
        foreach( $xluser  as $v){
            $userXl[] = $v['realname'];
        };
        $mbPd =  json_encode($userPd);;
        $mbXl =  json_encode($userXl);;
        $pdYes = array();
        $pdNo = array();
        $xlYes = array();
        $xlNo = array();
        foreach($pduser as $v){
            $uid = intval($v['id']);
            $d = M()->query('select status , count(status) as cnt  from wt_pd_order where uid='.$uid.' group by status order by status DESC');
            if($d){
                $myes = 0;
                $mno = 0;
                foreach($d as $c){
                    if($c['status'] == 1){
                        $myes = $c['cnt'];
                    }else if($c['status'] == 0){
                        $mno = $c['cnt'];
                    }
                }
                $pdYes[] = $myes;
                $pdNo[]  = $mno;
            }else{
                $pdYes[] = 0;
                $pdNo[] = 0;
            }
        }
        foreach($xluser as $v){
            $uid = intval($v['id']);
            $d = M()->query('select status , count(status) as cnt  from wt_xl_order where uid='.$uid.' group by status order by status DESC');
            if($d){
                $myes = 0;
                $mno = 0;
                foreach($d as $c){
                    if($c['status'] == 1){
                        $myes = $c['cnt'];
                    }else if($c['status'] == 0){
                        $mno = $c['cnt'];
                    }
                }
                $xlYes[] = $myes;
                $xlNo[]  = $mno;
            }else{
                $xlYes[] = 0;
                $xlNo[] = 0;
            }
        }
        $statuPdYes = json_encode($pdYes);
        $statuPdNo  = json_encode($pdNo);
        $statuXlYes = json_encode($xlYes);
        $statuXlNo  = json_encode($xlNo);
        $this->assign('titlePd' , "用户-配电项目-状态统计");
        $this->assign('mbPd' ,$mbPd);
        $this->assign('statuPdYes' ,$statuPdYes);
        $this->assign('statuPdNo' ,$statuPdNo);
        $this->assign('titleXl' , "用户-线缆项目-状态统计");
        $this->assign('mbXl' ,$mbXl);
        $this->assign('statuXlYes' ,$statuXlYes);
        $this->assign('statuXlNo' ,$statuXlNo);
        $this->display();
    }
}
