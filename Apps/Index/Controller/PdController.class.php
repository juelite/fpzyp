<?php
namespace Index\Controller;
use Think\Controller;

/**
 * 此注释用于后台自动生成权限表（勿删）
 * @ACTION_DEFAULT_CN_NAME:配电工作票
 * @ACTION_DEFAULT_ICON:menu-icon fa fa-flash
 */
class PdController extends ActionController {

    public function  lockzyp(){
        $id = intval(I('id'));
        $curUser = session('curUser');
        $condition['id'] = $id;
        $obj = M('pd_order')->find($id);
        if($obj){
            if($obj['uid'] != $curUser['id']){
                $this->error('当前记录不属于你 !');
            }else{
                $flag = M('pd_order')->where($condition)->setField(array('status'=>1,'lock_time'=>time()));
                if($flag){
                    $this->success('结项成功!');
                }
            }
        }else{
            $this->error(" ， 或者记录不存在");
        }
    }

    public function hy(){

        $field = 'wt_hy_order.id as id ,
        wt_admin.username as username ,
        wt_hy_order.gongdanbianhao as gongdanbianhao ,
        wt_hy_order.shigongfuzeren as shigongfuzeren ,
        wt_hy_order.hy_time as hy_time';
        $curUser = session('curUser');
        $curUserId = $curUser['id'];


        $condition = array('type' => 'PD');

        if($curUserId != 1 && $curUser['group'] != C('ZXYHZ')){
            $condition['uid'] = $curUser['id'];
        }
        $keyword = trim(I('keyword'));
        if($keyword){
            $condition['gongdanbianhao']  = array('like', "%$keyword%");
            // $kw['gongchengmingcheng']  = array('like', "%$keyword%");
            // $kw['_logic'] = 'or';
            // $condition['_complex'] = $kw;
        }
        ###################
        $count = M('hy_order')
        ->field($field)
        ->where($condition)
        ->join('left join wt_admin on wt_admin.id = wt_hy_order.uid')
        ->count();

        $page = new \Think\Page($count, C("PAGE_LIMITS"));
        $show = $page->show();
        ####################
        #
        $list = M('hy_order')
        ->field($field)
        ->where($condition)
        ->join('left join wt_admin on wt_admin.id = wt_hy_order.uid')
        ->order("`add_time` desc ,   `id` desc")
        ->limit($page->firstRow . ',' . $page->listRows)
        ->select();
        foreach($list as $k=>$v){
            $list[$k]['pro_status'] = M('pd_order')->where('gongdanbianhao = "'.$v['gongdanbianhao'].'"')->getField('status');
        }
        $mbbb = "%s/%s/%s %s时%s分";
        foreach($list as $k =>$v){
            if(isset($v['hy_time'])){
                $tm = explode('-', $v['hy_time']);
                $list[$k]['hy_time'] =  sprintf($mbbb ,
                 empty($tm[0]) ? '' : $tm[0],
                 empty($tm[1]) ? '' : $tm[1],
                 empty($tm[2]) ? '' : $tm[2],
                 empty($tm[3]) ? '' : $tm[3],
                 empty($tm[4]) ? '' : $tm[4]
                 );
            }
        }
        $this->assign('list' , $list);
        $this->assign('keyword' , $keyword);
        $this->assign("num",$count); #######
        $this->assign("show",$show); #######
        $this->display('hylist');
    }

    public function edithy(){
        if(IS_POST){
            // dump($_POST);
            $db = D('hyorder');
            $res = $db->create();
            // dump($res);die();
            if($res){
                if($db->save()){
                    $this->success('添加成功');
                }else{
                    $this->error('数据库写入失败');
                }
            }else{
                $this->error($db->getError());
            }

        }else{
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition['uid'] = $curUserId;
            $record = M('hy_order')->where($condition)->find($id);
            if(!$record){
                $this->error('找不到你要的数据，或数据不属于你');
            }
            // dump($record['jiaoyuneirong']);
            // echo $record['jiaoyuneirong'];
            // dump(unserialize($record['jiaoyuneirong']));die();
            $this->assign('record' , $record);
            $this->assign('jiaoyuneirong' , unserialize($record['jiaoyuneirong']));
            $this->assign('fenxiangzuoye1' , $record['fenxiangzuoye1']);
            $this->assign('fenxiangzuoye2' , $record['fenxiangzuoye2']);
            $this->assign('fenxiangzuoye3' , $record['fenxiangzuoye3']);
            $this->assign('fenxiangzuoye4' , $record['fenxiangzuoye4']);

            $this->assign('zuoyerenyuan1' , $record['zuoyerenyuan1']);
            $this->assign('zuoyerenyuan2' , $record['zuoyerenyuan2']);
            $this->assign('zuoyerenyuan3' , $record['zuoyerenyuan3']);
            $this->assign('zuoyerenyuan4' , $record['zuoyerenyuan4']);
            $this->assign('zongjie' , $record['zongjie']);
            $this->assign('hy_time' , explode('-' , $record['hy_time']));
            $this->display();
        }
    }

    public function delhy(){
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        if(M('hy_order')->where($condition)->delete($id)){
            $this->success('删除成功！');

        }else{
            $this->error('删除失败！没有找到数据，或数据不属于你');
        }
    }

    public function kc(){
        $field = 'wt_kc_order.id ,
        wt_admin.username as username ,
        wt_kc_order.jihuagongzuoshijian as jihuagongzuoshijian ,
        wt_kc_order.jihuagongzuoshijian_kaishi as jihuagongzuoshijian_kaishi ,
        wt_kc_order.jihuagongzuoshijian_jieshu as jihuagongzuoshijian_jieshu ,
        wt_kc_order.shigongbanzu as shigongbanzu ,
        wt_kc_order.xianchangkaichafuzeren as xianchangkaichafuzeren,
        wt_kc_order.canjiakancarenyuan as canjiakancarenyuan,
        wt_kc_order.kanchariqi as kanchariqi,
        wt_kc_order.shijishigongriqi as shijishigongriqi,
        wt_kc_order.gongdanbianhao as gongdanbianhao,
        wt_kc_order.shigongfuzeren as shigongfuzeren';
        $curUser = session('curUser');
        $curUserId = $curUser['id'];

        $condition = array('type' => 'PD');
        $keyword = trim(I('keyword'));
        if($keyword){
            $kw['gongdanbianhao']  = array('like', "%$keyword%");
            $kw['shigongbanzu']  = array('like', "%$keyword%");
            $kw['_logic'] = 'or';
            $condition['_complex'] = $kw;
        }

        if($curUserId != 1 && $curUser['group'] != C('ZXYHZ')){
            $condition['uid'] = $curUser['id'];
        }
        #########################
        $count = M('kc_order')
        ->field($field)
        ->where($condition)
        ->join('left join wt_admin on wt_admin.id = wt_kc_order.uid')
        ->count();
        $page = new \Think\Page($count, C("PAGE_LIMITS"));
        $show = $page->show();
        #########################
        $list = M('kc_order')
        ->field($field)
        ->where($condition)
        ->join('left join wt_admin on wt_admin.id = wt_kc_order.uid')
        ->order(" `jihuagongzuoshijian_kaishi` desc , `jihuagongzuoshijian_jieshu` desc , `add_time` desc ,   `id` desc")
        ->limit($page->firstRow . ',' . $page->listRows)
        ->select();
        foreach($list as $k=>$v){
            $list[$k]['pro_status'] = M('pd_order')->where('gongdanbianhao = "'.$v['gongdanbianhao'].'"')->getField('status');
            $list[$k]['jihuagongzuoshijian'] = $v['jihuagongzuoshijian_kaishi'] . ' - ' . $v['jihuagongzuoshijian_jieshu'];
        }
        // $mbbb = "%s/%s/%s %s时%s分 至 %s/%s/%s %s时%s分";
        // foreach($list as $k =>$v){
        //     if(isset($v['jihuagongzuoshijian'])){
        //         $tm = explode('-', $v['jihuagongzuoshijian']);
        //         $list[$k]['jihuagongzuoshijian'] =  sprintf($mbbb ,
        //          empty($tm[0]) ? '' : $tm[0],
        //          empty($tm[1]) ? '' : $tm[1],
        //          empty($tm[2]) ? '' : $tm[2],
        //          empty($tm[3]) ? '' : $tm[3],
        //          empty($tm[4]) ? '' : $tm[4],
        //          empty($tm[5]) ? '' : $tm[5],
        //          empty($tm[6]) ? '' : $tm[6],
        //          empty($tm[7]) ? '' : $tm[7],
        //          empty($tm[8]) ? '' : $tm[8],
        //          empty($tm[9]) ? '' : $tm[9]
        //          );
        //     }
        // }
        $this->assign('keyword' , $keyword);
        $this->assign('list' , $list);
        $this->assign("num",$count); #######
        $this->assign("show",$show); #######
        $this->display('kclist');
    }

    public function editkc(){
        if(IS_POST){
            $db = D('kcorder');
            $res = $db->create();
            if($res){
                if($db->save()){
                    $this->success('添加成功');
                }else{
                    $this->error('数据库写入失败');
                }
            }else{
                $this->error($db->getError());
            }

        }else{
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition['uid'] = $curUserId;
            $record = M('kc_order')->where($condition)->find($id);
            if(!$record){
                $this->error("找不到你要的数据，或数据不属于你");
            }
            // dump($record);die();
            // dump($record['jiaoyuneirong']);
            // echo $record['jiaoyuneirong'];
            // dump(unserialize($record['jiaoyuneirong']));die();

            $jihuagongzuoshijian = explode(C('DATETIME_CONNECT_CHAR') , $record['jihuagongzuoshijian']);
            $record['jihuagongzuoshijian_1'] = $jihuagongzuoshijian[0];
            $record['jihuagongzuoshijian_2'] = $jihuagongzuoshijian[1];
            $this->assign('record' , $record);
            $this->display();
        }
    }


    public function delkc(){
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        if(M('kc_order')->where($condition)->delete($id)){
            $this->success('删除成功！');

        }else{
            $this->error('删除失败！');
        }
    }

    public function zyp(){
        $act = I('get.act');
        if($act === 'delZyp'){
            $id = I('get.id');
            $this->delZypAndSub(M('pd_order'),$id);
        }
        $field = 'wt_pd_order.id ,
        wt_admin.username as username ,
        wt_pd_order.gongchengmingcheng as gongchengmingcheng,
        wt_pd_order.gongdanbianhao as gongdanbianhao,
        wt_pd_order.gongzuobanzu as gongzuobanzu,
        wt_pd_order.shigongfuzeren as shigongfuzeren,
        wt_pd_order.jihuagongzuoshijian as jihuagongzuoshijian,
        wt_pd_order.jihuagongzuoshijian_kaishi as jihuagongzuoshijian_kaishi,
        wt_pd_order.jihuagongzuoshijian_jieshu as jihuagongzuoshijian_jieshu,
        wt_pd_order.status,
        wt_pd_order.lock_time
        ';
        $curUser = session('curUser');
        $curUserId = $curUser['id'];

        // $condition = array('type' => 'XL');

        if($curUserId != 1 && $curUser['group'] != C('ZXYHZ')){
            $condition['uid'] = $curUser['id'];
        }


        $keyword = trim(I('keyword'));
        $deviceNo = M('device_list')->where("name = '".$keyword."'")->getField('index_code');
        if($keyword){
            $kw['gongdanbianhao']  = array('like', "%$keyword%");
            $kw['gongchengmingcheng']  = array('like', "%$keyword%");
            if($deviceNo){
                $kw['gongzuobanzu']  = $deviceNo;
            }
            $kw['_logic'] = 'or';
            $condition['_complex'] = $kw;
        }
         ############################
        $orderStr = '';
        if(isset($_COOKIE['sort2'])){
            foreach($_COOKIE['sort2'] as $k => $v){
                if(!empty($k) && ($v=='asc' || $v=='desc')){
                    $myorderAry[] = "`$k` $v";
                    break;
                }
            }
        }
        if(strpos($orderStr , 'jihuagongzuoshijian_kaishi') === false){
            $myorderAry[]= "`jihuagongzuoshijian_kaishi` desc ";
        }
        $myorderAry[]= "`jihuagongzuoshijian_jieshu` desc ";
        $myorderAry[]= "`add_time` desc ";
        $myorderAry[]= "`id` desc";

        $orderStr = implode(',', $myorderAry);
        #########################

        #########################
        $count = M('pd_order')
        ->field($field)
        ->where($condition)
        ->join('left join wt_admin on wt_admin.id = wt_pd_order.uid')
        ->count();
        $page = new \Think\Page($count, C("PAGE_LIMITS"));
        $show = $page->show();
        #########################
        $list = M('pd_order')
        ->field($field)
        ->where($condition)
        ->join('left join wt_admin on wt_admin.id = wt_pd_order.uid')
        ->order($orderStr)
        ->limit($page->firstRow . ',' . $page->listRows)
        ->select();
        // $mbbb = "%s年%s月%s日%s时%s分 - %s年%s月%s日%s时%s分";
        foreach($list as $k =>$v){
            if(!empty($v['jihuagongzuoshijian_kaishi']) && !empty($v['jihuagongzuoshijian_jieshu'])){
                $spmb = "%s 至 %s";
            }else{
                $spmb = "%s %s";
            }
            $list[$k]['jihuagongzuoshijian'] =  sprintf($spmb , $v['jihuagongzuoshijian_kaishi'] , $v['jihuagongzuoshijian_jieshu']);
        }
        $this->assign('list' , $list);
        $this->assign('keyword' , $keyword);
        $this->assign("num",$count); #######
        $this->assign("show",$show); #######
        $this->assign('groups',$this->getWorkGroup());
        $this->display('zyplist');
    }

    public function editzyp(){
        if(IS_POST){
            $db = D('pdorder');
            $res = $db->create();
            // dump($res);die();
            if($res){
                if($db->save()){

                    $this->success('添加成功');
                }else{
                    // echo $db->_sql();die();
                    $this->error('数据库写入失败');
                }
            }else{
                $this->error($db->getError());
            }

        }else{
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition['uid'] = $curUserId;
            $record = M('pd_order')->where($condition)->find($id);
            if(!$record){
                $this->error("找不到你要的数据，或数据不属于你");
            }

            $record['jihuagongzuoshijian'] = explode('-' , $record['jihuagongzuoshijian']);
            $record['gongzuokaishishijian'] = explode('-' , $record['gongzuokaishishijian']);
            $record['gongzuojieshushijian'] = explode('-' , $record['gongzuojieshushijian']);


##
            $record['jibenzhuyishixiangxuanze'] = unserialize($record['jibenzhuyishixiangxuanze']);
            $record['jibenzhuyishixiangzhixing'] = unserialize($record['jibenzhuyishixiangzhixing']);
            $record['linshidianyuanzhuyishixiangxuanze'] = unserialize($record['linshidianyuanzhuyishixiangxuanze']);
            $record['linshidianyuanzhuyishixiangzhixing'] = unserialize($record['linshidianyuanzhuyishixiangzhixing']);
            $record['pinguizhuyishixiangxuanze'] = unserialize($record['pinguizhuyishixiangxuanze']);
            $record['pinguizhuyishixiangzhixing'] = unserialize($record['pinguizhuyishixiangzhixing']);
            $record['jiuweizhuyishixiangxuanze'] = unserialize($record['jiuweizhuyishixiangxuanze']);
            $record['jiuweizhuyishixiangzhixing'] = unserialize($record['jiuweizhuyishixiangzhixing']);
            $record['dianlantouzhuyishixiangxuanze'] = unserialize($record['dianlantouzhuyishixiangxuanze']);
            $record['dianlantouzhuyishixiangzhixing'] = unserialize($record['dianlantouzhuyishixiangzhixing']);
#
###
            $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);
            $record['gaoyashiyanzhuyishixiangxuanze'] = unserialize($record['gaoyashiyanzhuyishixiangxuanze']);
            $record['gaoyashiyanzhuyishixiangzhixing'] = unserialize($record['gaoyashiyanzhuyishixiangzhixing']);
            $record['diaoxianzhuyishixiangxuanze'] = unserialize($record['diaoxianzhuyishixiangxuanze']);
            $record['diaoxianzhuyishixiangzhixing'] = unserialize($record['diaoxianzhuyishixiangzhixing']);
            $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);
            $record['yunshuzhuyishixiangzhixing'] = unserialize($record['yunshuzhuyishixiangzhixing']);
            $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);#####


            $this->assign('record' , $record);
            $curUser = session('curUser');
            $subGroup = M('device_list')->where('bind_user_id = "'.$curUser['id'].'"')->select();
            $this->assign('subGroup',$subGroup);
            $this->display();
        }
    }

    public function delzyp(){
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        if(M('pd_order')->where($condition)->delete($id)){
            $this->success('删除成功！');

        }else{
            $this->error('删除失败！');
        }
    }

    /**
     * 添加引导页面
     */
    public function add()
    {
        $this->display();
    }

    /**
     * 配电安全施工单
     */
    public function pd_order()
    {
        if(IS_POST){
            $db = D('Pdorder');
            $res = $db->create();
            if($res){
                if($db->add()){
                    $this->success('添加成功');
                }else{
                    $this->error('数据库写入失败');
                }
            }else{
                $this->error($db->getError());
            }
        }else{
            $curUser = session('curUser');
            $subGroup = M('device_list')->where('bind_user_id = "'.$curUser['id'].'"')->select();
            $this->assign('subGroup',$subGroup);
            $this->display();
        }
    }

    public function view()
    {
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        $record = M('pd_order')->where($condition)->find($id);
        if(!$record){
            $this->error("找不到你要的数据，或数据不属于你");
        }

        $record['jihuagongzuoshijian'] = explode('-' , $record['jihuagongzuoshijian']);
        $record['gongzuokaishishijian'] = explode('-' , $record['gongzuokaishishijian']);
        $record['gongzuojieshushijian'] = explode('-' , $record['gongzuojieshushijian']);


##
        $record['jibenzhuyishixiangxuanze'] = unserialize($record['jibenzhuyishixiangxuanze']);
        $record['jibenzhuyishixiangzhixing'] = unserialize($record['jibenzhuyishixiangzhixing']);
        $record['linshidianyuanzhuyishixiangxuanze'] = unserialize($record['linshidianyuanzhuyishixiangxuanze']);
        $record['linshidianyuanzhuyishixiangzhixing'] = unserialize($record['linshidianyuanzhuyishixiangzhixing']);
        $record['pinguizhuyishixiangxuanze'] = unserialize($record['pinguizhuyishixiangxuanze']);
        $record['pinguizhuyishixiangzhixing'] = unserialize($record['pinguizhuyishixiangzhixing']);
        $record['jiuweizhuyishixiangxuanze'] = unserialize($record['jiuweizhuyishixiangxuanze']);
        $record['jiuweizhuyishixiangzhixing'] = unserialize($record['jiuweizhuyishixiangzhixing']);
        $record['dianlantouzhuyishixiangxuanze'] = unserialize($record['dianlantouzhuyishixiangxuanze']);
        $record['dianlantouzhuyishixiangzhixing'] = unserialize($record['dianlantouzhuyishixiangzhixing']);
#
###
        $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);
        $record['gaoyashiyanzhuyishixiangxuanze'] = unserialize($record['gaoyashiyanzhuyishixiangxuanze']);
        $record['gaoyashiyanzhuyishixiangzhixing'] = unserialize($record['gaoyashiyanzhuyishixiangzhixing']);
        $record['diaoxianzhuyishixiangxuanze'] = unserialize($record['diaoxianzhuyishixiangxuanze']);
        $record['diaoxianzhuyishixiangzhixing'] = unserialize($record['diaoxianzhuyishixiangzhixing']);
        $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);
        $record['yunshuzhuyishixiangzhixing'] = unserialize($record['yunshuzhuyishixiangzhixing']);
        $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);#####


        $this->assign('record' , $record);
        $this->display();
    }

    public function dy()
    {
        $act = I('act');
        if ($act == 'zyp1' || $act == 'zyp2') {
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition = array();
            //$condition['uid'] = $curUserId;
            $record = M('pd_order')->where($condition)->find($id);
            if(!$record){
                $this->error("找不到你要的数据，或数据不属于你");
            }
            $record['jihuagongzuoshijian'] = explode('-' , $record['jihuagongzuoshijian']);
            $record['gongzuokaishishijian'] = explode('-' , $record['gongzuokaishishijian']);
            $record['gongzuojieshushijian'] = explode('-' , $record['gongzuojieshushijian']);
            $record['jibenzhuyishixiangxuanze'] = unserialize($record['jibenzhuyishixiangxuanze']);
            $record['jibenzhuyishixiangzhixing'] = unserialize($record['jibenzhuyishixiangzhixing']);
            $record['linshidianyuanzhuyishixiangxuanze'] = unserialize($record['linshidianyuanzhuyishixiangxuanze']);
            $record['linshidianyuanzhuyishixiangzhixing'] = unserialize($record['linshidianyuanzhuyishixiangzhixing']);
            $record['pinguizhuyishixiangxuanze'] = unserialize($record['pinguizhuyishixiangxuanze']);
            $record['pinguizhuyishixiangzhixing'] = unserialize($record['pinguizhuyishixiangzhixing']);
            $record['jiuweizhuyishixiangxuanze'] = unserialize($record['jiuweizhuyishixiangxuanze']);
            $record['jiuweizhuyishixiangzhixing'] = unserialize($record['jiuweizhuyishixiangzhixing']);
            $record['dianlantouzhuyishixiangxuanze'] = unserialize($record['dianlantouzhuyishixiangxuanze']);
            $record['dianlantouzhuyishixiangzhixing'] = unserialize($record['dianlantouzhuyishixiangzhixing']);
            $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);
            $record['gaoyashiyanzhuyishixiangxuanze'] = unserialize($record['gaoyashiyanzhuyishixiangxuanze']);
            $record['gaoyashiyanzhuyishixiangzhixing'] = unserialize($record['gaoyashiyanzhuyishixiangzhixing']);
            $record['diaoxianzhuyishixiangxuanze'] = unserialize($record['diaoxianzhuyishixiangxuanze']);
            $record['diaoxianzhuyishixiangzhixing'] = unserialize($record['diaoxianzhuyishixiangzhixing']);
            $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);
            $record['yunshuzhuyishixiangzhixing'] = unserialize($record['yunshuzhuyishixiangzhixing']);
            $record['yunshuzhuyishixiangxuanze'] = unserialize($record['yunshuzhuyishixiangxuanze']);#####
            $this->assign('record' , $record);
            $this->assign("num", $act);
            $this->display('zypdy');
        } else {
            $id = I('id');
            if (!$id) {
                $this->error('非法请求');
            }
            $tmp = $this->get_zyp_sub_order('pd_order', $id);
            $this->tmp = $tmp;
            $this->display();
        }
    }

    public function aqjylist()
    {
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition = array('type' => 'PD');
        if($curUserId != 1 && $curUser['group'] != C('ZXYHZ')){
            $condition['uid'] = $curUser['id'];
        }
        $keyword = trim(I('keyword'));
        if($keyword){
            $condition['gongdanbianhao']  = array('like', "%$keyword%");
        }
        $count = M('aqjy')
            ->where($condition)
            ->count();

        $page = new \Think\Page($count, C("PAGE_LIMITS"));
        $show = $page->show();
        ####################
        #
        $list = M('aqjy')
            ->where($condition)
            ->order("`add_time` desc ,  `id` desc")
            ->limit($page->firstRow . ',' . $page->listRows)
            ->select();
        foreach($list as $k=>$v){
            $list[$k]['pro_status'] = M('pd_order')->where('gongdanbianhao = "'.$v['gongdanbianhao'].'"')->getField('status');
        }
        $this->assign('list' , $list);
        $this->assign('keyword' , $keyword);
        $this->assign("num",$count); #######
        $this->assign("show",$show); #######
        $this->display('Work/aqjylist');
    }
}
