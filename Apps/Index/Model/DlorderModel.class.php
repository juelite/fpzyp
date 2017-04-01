<?php
/**
 * Created by PhpStorm.
 * User: wy
 * Date: 2016/9/22
 * Time: 23:43
 */
namespace Index\Model;
use Think\Model;

class DlorderModel extends Model
{
    protected $tableName  = 'dl_order';

    protected $_validate = array(
        array('gongchengmingcheng', 'require', '工程名称不能为空'),
        array('gongzuobanzu', 'require', '工作班组不能为空'),
        array('shigongfuzeren', 'require', '施工（工作）负责人不能为空'),
        array('fenxiangzuoyeneirong1', 'require', '分项作业和作业人员至少填写一项'),
        array('gangweizuoyerenyuan1', 'require', '分项作业和作业人员至少填写一项')
    );


    protected $_auto = array(
        array('gongdanbianhao','createGDBH',1,'callback'),
        array('add_time','time',1,'function'),
        array('status','0'),
        array('uid' , 'getUid' , 3 , 'callback'),
        #array('jihuagongzuoshijian' , 'get_jhgzsj' , 3 , 'callback'),
        array('jibenzhuyishixiangxuanze' , 'get_jbzysxxz' , 3 , 'callback'),
        array('jibenzhuyishixiangzhixing' , 'get_jbzysxzx' , 3 , 'callback'),
        array('linshidianyuanzhuyishixiangxuanze' , 'get_lsdyzysxxz' , 3 , 'callback'),
        array('linshidianyuanzhuyishixiangzhixing' , 'get_lsdyzysxzx' , 3 , 'callback'),
        array('pinguizhuyishixiangxuanze' , 'get_pgzysxxz' , 3 , 'callback'),
        array('pinguizhuyishixiangzhixing' , 'get_pgzysxzx' , 3 , 'callback'),
        array('jiuweizhuyishixiangxuanze' , 'get_jwzysxxz' , 3 , 'callback'),
        array('jiuweizhuyishixiangzhixing' , 'get_jwzysxzx' , 3 , 'callback'),
        array('dianlantouzhuyishixiangxuanze' , 'get_dltzysxxz' , 3 , 'callback'),
        array('dianlantouzhuyishixiangzhixing' , 'get_dltzysxzx' , 3 , 'callback'),
        array('gaoyashiyanzhuyishixiangxuanze' , 'get_gysyzysxxz' , 3 , 'callback'),
        array('gaoyashiyanzhuyishixiangzhixing' , 'get_gysyzysxzx' , 3 , 'callback'),
        array('diaoxianzhuyishixiangxuanze' , 'get_dxzysxxz' , 3 , 'callback'),
        array('diaoxianzhuyishixiangzhixing' , 'get_dxzysxzx' , 3 , 'callback'),
        array('yunshuzhuyishixiangxuanze' , 'get_yszysxxz' , 3 , 'callback'),
        array('yunshuzhuyishixiangzhixing' , 'get_yszysxzx' , 3 , 'callback'),
        array('gongzuokaishishijian' , 'get_gzkssj' , 3 , 'callback'),
        array('gongzuojieshushijian' , 'get_gzjssj' , 3 , 'callback'),
        array('qitazhuyishixiangxuanze' , 'checkvalueqtxz' , 3 , 'callback'),
        array('qitazhuyishixiangzhixing' , 'checkvalueqtzx' , 3 , 'callback'),
        ########
        array('ggkwxuanze' , 'get_ggkwxuanze' , 3 , 'callback'),
        array('ggkwzhixing' , 'get_ggkwzhixing' , 3 , 'callback'),

        array('lbgxuanze' , 'get_lbgxuanze' , 3 , 'callback'),
        array('lbgzhixing' , 'get_lbgzhixing' , 3 , 'callback'),

        array('fjxxuanze' , 'get_fjxxuanze' , 3 , 'callback'),
        array('fjxzhixing' , 'get_fjxzhixing' , 3 , 'callback'),

        array('dzpbxuanze' , 'get_dzpbxuanze' , 3 , 'callback'),
        array('dzpbzhixing' , 'get_dzpbzhixing' , 3 , 'callback'),

        array('gdysxuanze' , 'get_gdysxuanze' , 3 , 'callback'),
        array('gdyszhixing' , 'get_gdyszhixing' , 3 , 'callback'),


        ########
    );

    protected function checkvalueqtxz(){
        return I('qitazhuyishixiangxuanze') == 1 ? 1 : 0;
    }

    protected function checkvalueqtzx(){
        return I('qitazhuyishixiangzhixing') == 1 ? 1 : 0;
    }


    /**
     * 生成作业票编号的规则
     * @return string 返回序列化的选择结果
     */
    protected function createGDBH()
    {
        $curUser = session('curUser');
        $condition['uid'] = $curUser['id'];
        $lastPro = $this->where($condition)->order('add_time desc')->getField('gongdanbianhao');
        if($lastPro){
            $ary = explode("-",$lastPro);
            $lastNum = intval(array_pop($ary));
            $num = $lastNum + 1;
            $num = sprintf('%03d',$num);
        }else{
            $num = '001';
        }
        $per = '温岭-非普公司-'.date('Y-m');
        $per .= '-XL-';
        $per .= $curUser['cno'];
        $per .= '-'.$num;
        return $per;
    }

    protected function getUid(){
        $curUser = session('curUser');
        return intval($curUser['id']);
    }

    protected function get_jhgzsj(){
        return implode('-', I('jihuagongzuoshijian'));
    }

    protected function get_gzkssj(){
        return implode('-', I('gongzuokaishishijian'));
    }

    protected function get_gzjssj(){
        return implode('-', I('gongzuojieshushijian'));
    }

    protected function get_jbzysxxz()
    {
        return serialize(I('jibenzhuyishixiangxuanze'));
    }

    protected function get_jbzysxzx()
    {
        return serialize(I('jibenzhuyishixiangzhixing'));
    }

    protected function get_lsdyzysxxz()
    {
        return serialize(I('linshidianyuanzhuyishixiangxuanze'));
    }

    protected function get_lsdyzysxzx()
    {
        return serialize(I('linshidianyuanzhuyishixiangzhixing'));
    }

    protected function get_pgzysxxz()
    {
        return serialize(I('pinguizhuyishixiangxuanze'));
    }

    protected function get_pgzysxzx()
    {
        return serialize(I('pinguizhuyishixiangzhixing'));
    }

    protected function get_jwzysxxz()
    {
        return serialize(I('jiuweizhuyishixiangxuanze'));
    }

    protected function get_jwzysxzx()
    {
        return serialize(I('jiuweizhuyishixiangzhixing'));
    }

    protected function get_dltzysxxz()
    {
        return serialize(I('dianlantouzhuyishixiangxuanze'));
    }

    protected function get_dltzysxzx()
    {
        return serialize(I('dianlantouzhuyishixiangzhixing'));
    }

    protected function get_gysyzysxxz()
    {
        return serialize(I('gaoyashiyanzhuyishixiangxuanze'));
    }

    protected function get_gysyzysxzx()
    {
        return serialize(I('gaoyashiyanzhuyishixiangzhixing'));
    }

    protected function get_dxzysxxz()
    {
        return serialize(I('diaoxianzhuyishixiangxuanze'));
    }

    protected function get_dxzysxzx()
    {
        return serialize(I('diaoxianzhuyishixiangzhixing'));
    }

    protected function get_yszysxxz()
    {
        return serialize(I('yunshuzhuyishixiangxuanze'));
    }

    protected function get_yszysxzx()
    {
        return serialize(I('yunshuzhuyishixiangzhixing'));
    }
########################################
    protected function get_ggkwxuanze()
    {
        return serialize(I('ggkwxuanze'));
    }
    protected function get_ggkwzhixing()
    {
        return serialize(I('ggkwzhixing'));
    }
    //-------------------------------------
    protected function get_lbgxuanze()
    {
        return serialize(I('lbgxuanze'));
    }
    protected function get_lbgzhixing()
    {
        return serialize(I('lbgzhixing'));
    }
    //-------------------------------------
    protected function get_fjxxuanze()
    {
        return serialize(I('fjxxuanze'));
    }
    protected function get_fjxzhixing()
    {
        return serialize(I('fjxzhixing'));
    }
    //-------------------------------------
    protected function get_dzpbxuanze()
    {
        return serialize(I('dzpbxuanze'));
    }
    protected function get_dzpbzhixing()
    {
        return serialize(I('dzpbzhixing'));
    }
    //-------------------------------------
    protected function get_gdysxuanze()
    {
        return serialize(I('gdysxuanze'));
    }
    protected function get_gdyszhixing()
    {
        return serialize(I('gdyszhixing'));
    }
    //-------------------------------------
#######################################


}
