function UserDataStorage(maxage){
    //创建document元素并附加userData行为
    //因此该元素获得save()和load()方法
    var memory = document.createElement('div');   //创建一个元素
    memory.style.display= 'none';                  //将其隐藏
    memory.style.behavior= "url('#default#userData')"; //附加userData行为
    document.body.appendChild(memory);//将其添加到document元素中。

    //如何传递了maxage参数（单位为秒），则将其设置为userData的有效期，以毫秒为单位
    if(maxage){
        var now = new Date().getTime();    //当前时间
        var expires = now+maxage*1000;       //当前时间加上有效期就等于过期时间
        memory.expires = new Date(expires).toUTCString();
    }

    //通过载入存储的数据来初始化memory元素
    //参数是任意的，只要是在保存的时候存在就可以了
    memory.load("UserDataStorage");            //载入存储的数据

    this.getItem= function(key){         //通过属性来获取保存值
        return memory.getAttribute(key)|| null;
    };
    this.setItem = function(key,value){
        memory.setAttribute(key,value);       //以设置属性的形式来保存数据
        memory.save("UserDataStorage");    //保存数据改变后的状态
    }

    this.removeItem = function(key){
        memory.removeAttribute(key);           //删除存储的数据
        memory.save("UserDataStorage");     //再次保存状态
    }
}