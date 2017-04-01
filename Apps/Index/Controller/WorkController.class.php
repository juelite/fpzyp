<?php
namespace Index\Controller;
use Think\Controller;
/**
 * 此注释用于后台自动生成权限表（勿删）
 * @ACTION_DEFAULT_CN_NAME:通用权限
 * @ACTION_DEFAULT_ICON:menu-icon fa fa-pie-chart
 */
class WorkController extends ActionController {

    /**
     * 配电工程现场勘察记录单
     */
    public function kc_order()
    {
        if(IS_POST){
            $projId = I('projId');
            $db = D('kcorder');
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

            $from = I('from');
            $projId = I('projId');
            if(!$from || !$projId){
                $this->error("非法操作！");
            }
            switch($from){
                case "xl":
                    $db = M('xl_order');
                    break;
                case "pd":
                    $db = M('pd_order');
                    break;
                case "dl":
                    $db = M('dl_order');
                    break;
            }
            $condition['id'] = $projId;
            $no = $db->where($condition)->getField("gongdanbianhao");
            $proInfo = $db->where($condition)->find();
            $this->assign('no',$no);

            $db = D('kcorder');
            if($db->where(array('gongdanbianhao'=>$no))->find()){  ## 已经添加【一张作业票只能添加一张勘察记录】
                $this->error('一张作业票只能添加一张勘察记录 ，您已经添加过勘察记录');
            }else{
                $this->assign('no',$no);
                $this->assign('record',$proInfo);
                $this->display();
            }
        }
    }

    /**
     * 施工单班前、班后会记录单
     */
    public function hy_order()
    {
        if(IS_POST){
            $from = I('get.from');

            switch($from){
                case "xl":
                    $url = U('xl/index');
                    break;
                case "pd":
                    $url = U('pd/index');
                    break;
                case "dl":
                    $url = U('dl/index');
                    break;
            }

            $db = D('hyorder');
            $res = $db->create();
            if($res){
                if($db->add()){
                    $this->success('添加成功',$url);
                }else{
                    $this->error('数据库写入失败');
                }
            }else{
                $this->error($db->getError());
            }
        }else{
            $from = I('get.from');
            $projId = I('projId');
            if(!$from || !$projId){
                $this->error("非法操作！");
            }
            switch($from){
                case "xl":
                    $db = M('xl_order');
                    break;
                case "pd":
                    $db = M('pd_order');
                    break;
                case "dl":
                    $db = M('dl_order');
                    break;
            }
            $condition['id'] = $projId;
            $no = $db->where($condition)->getField("gongdanbianhao");
            $this->assign('no',$no);
            $proInfo = $db->where($condition)->find();
            $this->assign('proInfo',$proInfo);
            // $this->display();

            $db = D('hyorder');
            if($db->where(array('gongdanbianhao'=>$no))->find()){  ## 已经添加【一张作业票只能添加一张会议记录】
                $this->error('一张作业票只能添加一张会议记录 ，您已经添加过会议记录');
            }else{
                $this->assign('no',$no);
                $this->display();
            }
        }
    }

    public function aqjy()
    {
        if(IS_POST){
            $db = D('aqjyorder');
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
            $from = I('from');
            $projId = I('projId');
            if(!$from || !$projId){
                $this->error("非法操作！");
            }
            switch($from){
                case "xl":
                    $db = M('xl_order');
                    break;
                case "pd":
                    $db = M('pd_order');
                    break;
                case "dl":
                    $db = M('dl_order');
                    break;
            }
            $condition['id'] = $projId;
            $record = $db->where($condition)->find();
            $no = $record["gongdanbianhao"];
            $db = D('aqjyorder');
            if($db->where(array('gongdanbianhao'=>$no))->find()){  ## 已经添加【一张作业票只能添加一张安全教育卡】
                $this->error('一张作业票只能添加一张安全教育卡 ，您已经添加过安全教育卡');
            }else{
                $this->assign('no',$no);
                $this->assign('record' , $record);
                $this->display();
            }
        }
    }

    public function editaqjy()
    {
        if(IS_POST){
            $db = D('aqjyorder');
            $res = $db->create();
            if($res){
                if($db->save()){
                    $this->success('更新成功');
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
            $record = M('aqjy')->where($condition)->find($id);
            if(!$record){
                $this->error('找不到你要的数据，或数据不属于你');
            }
            $record['jh_time'] = explode('-',$record['jh_time']);
            $record['qm_time'] = explode('-',$record['qm_time']);
            $record['jiaoyuneirong'] = unserialize($record['jiaoyuneirong']);
            $jyType = $record['type'];
            $Mproj = '';
            if($jyType == 'PD'){
                $Mproj = M('pd_order');
            }else if($jyType == 'XL'){
                $Mproj = M('xl_order');
            }else if($jyType == 'DL'){
                $Mproj = M('dl_order');
            }
            $zypRecord = $Mproj->where(array('gongdanbianhao'=> $record['gongdanbianhao']))->find();
            $manager = $zypRecord['shigongfuzeren'];
            $this->assign('manager' , $manager);
            $this->assign('record' , $record);
            $this->display();
        }
    }

    public function aqjyview()
    {
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        $record = M('aqjy')->where($condition)->find($id);
        if(!$record){
            $this->error('找不到你要的数据，或数据不属于你');
        }
        $record['jh_time'] = explode('-',$record['jh_time']);
        $record['qm_time'] = explode('-',$record['qm_time']);
        $record['jiaoyuneirong'] = unserialize($record['jiaoyuneirong']);
        $this->assign('record' , $record);
        $jyType = $record['type'];
        $Mproj = '';
        if($jyType == 'PD'){
            $Mproj = M('pd_order');
        }else if($jyType == 'XL'){
            $Mproj = M('xl_order');
        }else if($jyType == 'DL'){
            $Mproj = M('dl_order');
        }
        $zypRecord = $Mproj->where(array('gongdanbianhao'=> $record['gongdanbianhao']))->find();
        $manager = $zypRecord['shigongfuzeren'];
        $this->assign('manager' , $manager);
        $this->display();
    }

    public function delaqjy()
    {
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        $record = M('aqjy')->where($condition)->find($id);
        if(!$record){
            $this->error('找不到你要的数据，或数据不属于你');
        }
        M('aqjy')->where($condition)->delete($id);
        $this->success('删除成功！');
    }

    public function hyview()
    {
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        $record = M('hy_order')->where($condition)->find($id);
        if(!$record){
            $this->error('找不到你要的数据，或数据不属于你');
        }
        $this->assign('record' , $record);
        $zz = "/^(?:[^a-z]*?)(?:-)([a-z]{2})(?:-)(?:[^a-z]*?)$/i";
        preg_match($zz , $record['gongdanbianhao'] , $from);
        $from = strtolower($from[1]);
        switch($from){
            case "xl":
                $db = M('xl_order');
                break;
            case "pd":
                $db = M('pd_order');
                break;
            case "dl":
                $db = M('dl_order');
                break;
        }
        $condition = array();
        $condition['gongdanbianhao'] = $record['gongdanbianhao'];
        $proInfo = $db->where($condition)->find();
        $this->assign('proInfo',$proInfo);

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

    public function kcview()
    {
        $id = I('id');
        $curUser = session('curUser');
        $curUserId = $curUser['id'];
        $condition['uid'] = $curUserId;
        $record = M('kc_order')->where($condition)->find($id);
        if(!$record){
            $this->error("找不到你要的数据，或数据不属于你");
        }
        $this->assign('record' , $record);
        $this->display();
    }

    public function dy()
    {
        $act = I("act");
        if($act == 'kc'){
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition['uid'] = $curUserId;
            $record = M('kc_order')->where($condition)->find($id);
            if(!$record){
                $this->error("找不到你要的数据，或数据不属于你");
            }
            $this->assign('record' , $record);
            $this->display("kcdy");
        }elseif($act == 'hy'){
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition = array();
            $condition['uid'] = $curUserId;
            $record = M('hy_order')->where($condition)->find($id);
            if(!$record){
                $this->error('找不到你要的数据，或数据不属于你');
            }
            $this->assign('record' , $record);

            $zz = "/^(?:[^a-z]*?)(?:-)([a-z]{2})(?:-)(?:[^a-z]*?)$/i";
            preg_match($zz , $record['gongdanbianhao'] , $from);
            $from = strtolower($from[1]);
            switch($from){
                case "xl":
                    $db = M('xl_order');
                    break;
                case "pd":
                    $db = M('pd_order');
                    break;
                case "dl":
                    $db = M('dl_order');
                    break;
            }
            $condition = array();
            $condition['gongdanbianhao'] = $record['gongdanbianhao'];
            $proInfo = $db->where($condition)->find();
            $this->assign('proInfo',$proInfo);


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
            $this->display("hydy");
        }elseif($act == 'aqjy'){
            $id = I('id');
            $curUser = session('curUser');
            $curUserId = $curUser['id'];
            $condition['uid'] = $curUserId;
            $record = M('aqjy')->where($condition)->find($id);
            if(!$record){
                $this->error('找不到你要的数据，或数据不属于你');
            }
            $record['jh_time'] = explode('-',$record['jh_time']);
            $record['qm_time'] = explode('-',$record['qm_time']);
            $record['jiaoyuneirong'] = unserialize($record['jiaoyuneirong']);
            $this->assign('record' , $record);
            $jyType = $record['type'];
            $Mproj = '';
            if($jyType == 'PD'){
                $Mproj = M('pd_order');
            }else if($jyType == 'XL'){
                $Mproj = M('xl_order');
            }else if($jyType == 'DL'){
                $Mproj = M('dl_order');
            }
            $zypRecord = $Mproj->where(array('gongdanbianhao'=> $record['gongdanbianhao']))->find();
            $manager = $zypRecord['shigongfuzeren'];
            $this->assign('manager' , $manager);
            $this->display("aqjydy");
        }elseif($act == 'dg'){
            $cno = I("cno");
            if(!$cno){
                $this->error('找不到数据');
            }
            $this->assign("cno",$cno);
            $this->display("dg_order");
        }elseif($act == 'lddg'){
            $cno = I("cno");
            if(!$cno){
                $this->error('找不到数据');
            }
            if(strpos($cno,'DL') !== false){
                $db = M("dl_order");
            }elseif(strpos($cno,'XL') !== false){
                $db = M("xl_order");
            }elseif(strpos($cno,'PD') !== false){
                $db = M("pd_order");
            }
            $res = $db->where("gongdanbianhao = '".$cno."'")->find();
            $this->assign("res",$res);
            $this->display("lddg");
        }
    }

}
