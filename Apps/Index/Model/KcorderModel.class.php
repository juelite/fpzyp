<?php
/**
 * Created by PhpStorm.
 * User: wy
 * Date: 2016/9/22
 * Time: 23:43
 */
namespace Index\Model;
use Think\Model;

class KcorderModel extends Model
{
    protected $tableName  = 'kc_order';

    protected $_validate = array(
        array('gongdanbianhao', 'require', '工单编号不能为空'),
        array('fenxiangzuoye1', 'require', '分项作业和作业人员至少填写一项'),
        array('zuoyerenyuan1', 'require', '分项作业和作业人员至少填写一项')
    );


    protected $_auto = array(
        array('status','0'),

        array('add_time','time',1,'function'),
        array('uid' , 'getUid' , 3 , 'callback'),

        array('type' , 'getType' , 3 , 'callback'),
        array('gongzuofanwei' , 'uploadPicGongzuoFanwei' , 3 , 'callback'),
        array('jihuagongzuoshijian' , 'jihuagongzuoshijian' , 3 , 'callback'),
    );

    protected function jihuagongzuoshijian(){
        $sj1 = I('jihuagongzuoshijian_1');
        $sj2 = I('jihuagongzuoshijian_2');

        $sj = $sj1 . C('DATETIME_CONNECT_CHAR') . $sj2;
        unset($_POST['jihuagongzuoshijian_1']);
        unset($_POST['jihuagongzuoshijian_2']);
        return $sj;
    }

    /**
     * 将教育内容选择的结果序列化返回
     * @return string 返回序列化的选择结果
     */
    protected function getJYNR()
    {
        $jynr = I('jiaoyuneirong');
        if(!empty($jynr)){
            return serialize($jynr);
        }else{
            return null;
        }

    }

    protected function uploadPicGongzuoFanwei(){
        if($_FILES['gongzuofanwei']['error'] == 0){
            $upload = new \Think\Upload();// 实例化上传类
            $upload->maxSize   =     40*1024*1024 ;// 设置附件上传大小
            $upload->exts      =     array('jpg', 'gif', 'png', 'jpeg');// 设置附件上传类型
            $upload->rootPath  =     './Uploads/'; // 设置附件上传根目录
            $upload->savePath  =     ''; // 设置附件上传（子）目录
            // 上传文件
            $info   =   $upload->upload();
            if(!$info) {// 上传错误提示错误信息
                return null;
            }else{// 上传成功
                return $info['gongzuofanwei']['savepath'].$info['gongzuofanwei']['savename'];
            }
        }else{
            return null;
        }
    }

    protected function getUid(){
        $curUser = session('curUser');
        return intval($curUser['id']);
    }
    protected function buildTime(){
        return implode('-', I('hy_time'));
    }

    protected function getType(){
        $bianHao = I('gongdanbianhao');
        if(strpos($bianHao , 'PD') !== false){
            $type = "PD";
        }else if(strpos($bianHao , 'XL')){
            $type = "XL";
        }else if(strpos($bianHao , 'DL')){
            $type = "DL";
        }
        return $type;
    }
}
