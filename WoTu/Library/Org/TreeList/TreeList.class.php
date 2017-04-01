<?php

namespace Org\TreeList;

class TreeList {
    static public $treeList = array(); //������޷��������һҳ���ж�����޷������ʹ�� Tool::$treeList = array(); ���
    /**
     * ���޼�����
     * @access public
     * @param Array $data     //���ݿ����ȡ�Ľ����
     * @param Int $pid
     * @param Int $count       //�ڼ�������
     * @return Array $treeList
     */
    static public function tree($data,$pid = 0,$count = 1,$field = 'fid')
    {
        foreach ($data as $key => $value){
            if($value[$field]==$pid){
                $value['Count'] = $count;
                self::$treeList []=$value;
                unset($data[$key]);
                self::tree($data,$value['id'],$count+1);
            }
        }
        return self::$treeList ;
    }
}
