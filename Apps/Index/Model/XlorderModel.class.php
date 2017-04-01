<?php
/**
 * Created by PhpStorm.
 * User: wy
 * Date: 2016/9/22
 * Time: 23:43
 */
namespace Index\Model;
use Think\Model;

class XlorderModel extends Model
{
    protected $tableName  = 'xl_order';

    protected $_validate = array(
        array('gongchengmingcheng', 'require', '工程名称不能为空'),
        array('gongzuobanzu', 'require', '工作班组不能为空'),
        array('shigongfuzeren', 'require', '施工（工作）负责人不能为空')
    );


    protected $_auto = array(
        array('gongdanbianhao','createGDBH',1,'callback'),
        array('add_time','time',1,'function'),
        array('status','0'),
        array('uid' , 'getUid' , 3 , 'callback'),
        #array('jihuagongzuoshijian' , 'get_jhgzsj' , 3 , 'callback'),
        array('gongzuokaishishijian' , 'get_gzkssj' , 3 , 'callback'),
        array('gongzuojieshushijian' , 'get_gzjssj' , 3 , 'callback'),

        array('jibenzhuyishixiangxuanze' , 'get_jbzysxxz' , 3 , 'callback'),
        array('jibenzhuyishixiangzhixing' , 'get_jbzysxzx' , 3 , 'callback'),

        array('yunshuzhuangxiexuanze' , 'get_yszxxz' , 3 , 'callback'),
        array('yunshuzhuangxiezhixing' , 'get_yszxzx' , 3 , 'callback'),

        array('wagufushexuanze' , 'get_wgfsxz' , 3 , 'callback'),
        array('wagufushezhixing' , 'get_wgfszx' , 3 , 'callback'),

        array('fushedianlanxuanze' , 'get_fsdlxz' , 3 , 'callback'),
        array('fushedianlanzhixing' , 'get_fsdlzx' , 3 , 'callback'),

        array('dianlantouxuanze' , 'get_dltxz' , 3 , 'callback'),
        array('dianlantouzhixing' , 'get_dltzx' , 3 , 'callback'),

        array('dianlanshiyanxuanze' , 'get_dlsyxz' , 3 , 'callback'),
        array('dianlanshiyanzhixing' , 'get_dlsyzx' , 3 , 'callback'),


        array('dianlanyunshuhezhuangxie' , 'checkvaluedlyszx' , 3 , 'callback'),
        array('wagoufushe' , 'checkvaluewgfs' , 3 , 'callback'),
        array('fushedianlan' , 'checkvaluefsdl' , 3 , 'callback'),
        array('dinlantou' , 'checkvaluedlt' , 3 , 'callback'),
        array('dianlanshiyan' , 'checkvaluedlsy' , 3 , 'callback'),

    );

    protected function checkvaluedlyszx(){
        return I('dianlanyunshuhezhuangxie') == 1 ? 1 : 0;
    }

    protected function checkvaluewgfs(){
        return I('wagoufushe') == 1 ? 1 : 0;
    }

    protected function checkvaluefsdl(){
        return I('fushedianlan') == 1 ? 1 : 0;
    }

    protected function checkvaluedlt(){
        return I('dinlantou') == 1 ? 1 : 0;
    }

    protected function checkvaluedlsy(){
        return I('dianlanshiyan') == 1 ? 1 : 0;
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
        $per = "温岭-非普公司-".date('Y-m');
        $per .= '-DL-';
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

    protected function get_yszxxz()
    {
        return serialize(I('yunshuzhuangxiexuanze'));
    }

    protected function get_yszxzx()
    {
        return serialize(I('yunshuzhuangxiezhixing'));
    }

    protected function get_wgfsxz()
    {
        return serialize(I('wagufushexuanze'));
    }

    protected function get_wgfszx()
    {
        return serialize(I('wagufushezhixing'));
    }

    protected function get_fsdlxz()
    {
        return serialize(I('fushedianlanxuanze'));
    }

    protected function get_fsdlzx()
    {
        return serialize(I('fushedianlanzhixing'));
    }

    protected function get_dltxz()
    {
        return serialize(I('dianlantouxuanze'));
    }

    protected function get_dltzx()
    {
        return serialize(I('dianlantouzhixing'));
    }

    protected function get_dlsyxz()
    {
        return serialize(I('dianlanshiyanxuanze'));
    }

    protected function get_dlsyzx()
    {
        return serialize(I('dianlanshiyanzhixing'));
    }

}
