<?php
/**
 * Created by PhpStorm.
 * User: wy
 * Date: 2016/9/22
 * Time: 23:43
 */
namespace Index\Model;
use Think\Model;

class AqjyorderModel extends Model
{
    protected $tableName  = 'aqjy';


    protected $_auto = array(
        array('jiaoyuneirong','getJYNR',3,'callback'),
        array('add_time','time',1,'function'),
        array('uid' , 'getUid' , 3 , 'callback'),
        array('jh_time' , 'buildTime' , 3 , 'callback'),
        array('qm_time' , 'buildTime1' , 3 , 'callback'),
        array('type' , 'getType' , 3 , 'callback'),
    );

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

    protected function getUid(){
        $curUser = session('curUser');
        return intval($curUser['id']);
    }
    protected function buildTime(){
        return implode('-', I('jh_time'));
    }

    protected function buildTime1(){
        return implode('-', I('qm_time'));
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
