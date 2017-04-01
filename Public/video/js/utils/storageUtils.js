/**
 * Created with JetBrains WebStorm.
 * User: wanqiongyao
 * Date: 15-6-18
 * Time: 上午11:42
 * To change this template use File | Settings | File Templates.
 */

/**
 * type支持的类型有
 * cookie 支持与后台交互
 * local 持久保存客户端数据的方案
 * session,global,indexDB
 * */
function hikStorage(type,options){
    if(type == 'cookie'){
        return new CookieStorage(options && options.maxage,options && options.path,options);
    }else if(type == 'session'){
        if(typeof sessionStorage == "object"){
            return sessionStorage;
        }else{
            throw new Error('Local storage not avaliable.');
        }
    }else if(type == 'local'){
        if(typeof localStorage == 'object'){
            return localStorage;
        }else if(typeof globalStorage == "object"){
            return globalStorage[(options && options.domain) || location.host];
        }else{
            throw new Error('Local storage not avaliable.');
        }
    }else if(type == 'global'){
        if(typeof globalStorage == "object"){
            return globalStorage[(options && options.domain) || location.host];
        }else{
            throw new Error('Local storage not avaliable.');
        }
    }else if(type == 'indexDB'){
        return;
    }else {
        return  window.sessionStorage || (window.UserDataStorage && new UserDataStorage()) || new CookieStorage(options && options.maxage,options && options.path,options);
    }
}

