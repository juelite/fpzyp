/**
 * @namespace
 * @example
 * 1.使用方法
 *  &lt;input name="userCount" id="userCount" vtype="XXX"/&gt;
 * $('#userCount')。valid();
 * 2.扩展方法
 *
 * $.extand($.vtype,{
 *     xxx : {
 *         valid : function(){
 *             //todo  定义你的验证规则
 *         },
 *         errormsg : '这里写错误提示' ,
 *         info : '这里写info提示'
 *     }
 * })
 */
var vtype ={
    /**
     * @memberof vtype
     * @description 手机号码，11位数字，只适用中文
     * */
    phone: {
        valid: function (val) {return /^1[1-9]\d{9}$/.test(val)},
        errormsg: valLan.phoneError,
        info: valLan.phoneInfo
    },
    /**
     * @memberof vtype
     * @description 是否是必输项
     * */
    required: {
        valid: function (val) {return (val&&val.length) > 0;},
        errormsg: valLan.requiredError,
        info: valLan.requiredInfo
    },
    /**
     * @memberof vtype
     * @description 是否是数字，不包括负数和浮点数
     * */
    num: {
        valid: function (val) {return val - parseFloat(val) >= 0},
        errormsg: valLan.numError,
        info: valLan.numInfo
    },
    /**
     * @memberof vtype
     * @description 是否是数字，包括负数和浮点数
     * */
    numDN: {
        valid: function (val) {
            return vtype.numD.valid(val) && vtype.numN.valid(val);
        },
        errormsg: valLan.numDNError,
        info: valLan.numDNInfo
    },
    /**
     *
     *  @memberof vtype
     *  @description 是否是数字，包括浮点数
     *  */
    numD: {
        valid: function (val) {
            return vtype.num.valid(val) && !/[.]/.test(parseFloat(val));
        },
        errormsg: valLan.numDError,
        info: valLan.numDInfo
    },
    /**
     * @memberof vtype
     * @description 是否是数字，包括负数
     * */
    numN: {
        valid: function (val) {
            return vtype.num.valid(val) && !/[-]/.teset(val)
        },
        errormsg: valLan.numNError,
        info: valLan.numDInfo
    },
    /**
     * @memberof vtype
     * @description 定义不允许输入的特殊字符
     * */
    unusechars: {
        valid: function (val, comp) {
           var i = val.length;
            while(val[--i]) {
                if (!~val[i].indexOf(comp)) {return false;}
            }
            return true;
        },
        errormsg: valLan.unusecharsError,
        info: valLan.unusecharsInfo
    },
    /**
     * @memberof vtype
     * @description 定义输入的最大值，一般适用于整数类型
     * */
    max: {
        valid: function (val, comp) {return parseInt(val,10) <= parseInt(comp,10);},
        errormsg: valLan.maxError,
        info: valLan.maxInfo
    },
    /**
     * @memberof vtype
     * @description 定义输入的最小值，一般适用于整数类型
     * */
    min: {
        valid: function (val, comp) {return val >= comp},
        errormsg: valLan.minError,
        info: valLan.minInfo
    },
    /**
     * @memberof vtype
     * @description 定义输入的最长字符数，以一个英文字节为标准，用户可以配置一个中文占多少个字符
     * */
    maxLength : {
        valid: function (val, len) {
            var ipt = document.createElement('input');
            if('maxLength' in ipt){
                return true;
            }
            return val.length <= len ;
        },
        errormsg : valLan.maxLengthError,
        info : valLan.maxLengthInfo
    },
    /**
     * @memberof vtype
     * @description 定义输入的最短字符数
     * */
    minLength : {
        valid: function (val, len) { return val.length <= len},
        errormsg : valLan.minLengthError,
        info : valLan.minLengthInfo
    },
    /**
     * @memberof vtype
     * @description 定义邮箱的验证类型
     * */
    email: {
        valid: function (val) { return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(val)},
        errormsg: valLan.emailError,
        info: valLan.emailInfo
    },
    /**
     * @memberof vtype
     * @description 定义与某个字段的输入一致
     * */
    equalToTag: {
        valid: function (val, tag) {return val === $(tag).val()},
        errormsg: valLan.equalToTagError,
        info: valLan.equalToTagInfo
    },
    /**
     * @memberof vtype
     * @description 定义电话号码的规则
     * */
    tel : {
        valid : function(val){
            var validateRegs=[/^[0][1-9][0-9]{1,2}-[1-9]{1}[0-9]{6,8}$/,/^[0][1-9][0-9]{1,2}-[1-9]{1}[0-9]{6,8}-[0-9]{2,4}$/,/^((400[6-8]{1})-(\d{3})-(\d{3}))$/,/^((400)-(\d{4})-(\d{3}))$/,/^((400)-(\d{3})-(\d{4}))$/,/^[1-9]{1}[0-9]{6,8}$/,/^((400)(\d{3})(\d{4}))$/]
            if (val == null) {
                return true;
            }
            for(var i = 0; i < validateRegs.length;i++){
                var r = validateRegs[i].test(val);
                if(r){
                    return r;
                }
            }
            return false;
        },
        errormsg : valLan.telError,
        info : valLan.telInfo
    },
    /**
     * @memberof vtype
     * @description 定义ip地址的规则
     * */
    ip : {
        valid : function(val){
            var  validateRegs= /([0-2][0-5][0-5])\.\1\.\1\.\1/;
            return validateRegs.test(val);
        },
        errormsg: valLan.ipError,
        info : valLan.ipInfo
    },
    /**
     * @memberof vtype
     * @description 定义mac地址的规则
     * */
    mac : {
         valid : function(val){
             var c = '', sep = ':', i = 0, j = 0,addrParts;
             sep = val.indexOf("-") > -1 ? "-" : sep;
             if (val.indexOf(sep) < 0 || (val.toLowerCase() == 'ff' + sep + 'ff' + sep + 'ff' + sep + 'ff' + sep + 'ff' + sep + 'ff') || (val.toLowerCase() == '00' + sep + '00' + sep + '00' + sep + '00' + sep + '00' + sep + '00')) {
                 return false;
             }
             addrParts = val.split(sep);
             if (addrParts.length != 6) {
                 return false;
             }
             for (i = 0; i < 6; i++){
                 if (addrParts[i] == ''){
                     return false;
                 }
                 if (addrParts[i].length != 2) {
                     return false;
                 }
                 for (j = 0; j < addrParts[i].length; j++) {
                     c = addrParts[i].toLowerCase().charAt(j);
                     if ((c >= '0' && c <= '9') || (c >= 'a' && c <='f')) {
                         continue;
                     } else {
                         return false;
                     }
                 }
             }
             if ((parseInt(addrParts[0], 16) % 2) == 1) {
                 return false;
             }
             return true;
         },
        errormsg: valLan.macError,
        info : valLan.macInfo
    },
    /**
     * @memberof vtype
     * @description 定义正则表达式的规则
     * */
    regex :{
        valid : function(val,param){
            return new RegExp(param).test(val);
        },
        errormsg : '',
        info : ''
    },
    /**
     * @memberof vtype
     * @description 定义ajax验证的规则
     * */
    ajax : {
        valid: function (val, param, element,startRequest,stopRequest) {
            var thiz = this;
            if(typeof startRequest == "function"){
                startRequest.call(thiz,element);
            }
             $.ajax({
                url: param,
                data: val,
                dataType: 'json',
                success: function (response) {
                    if(!response.success){
                        thiz.showValidate(element,response.msg);
                        return response.msg;
                    }
                    return true;
                },
                error: function () {
                   return false;
                },
                complete : function(response){
                    var result = $.parseJSON(response.responseText),msg = result.msg;
                    if(typeof stopRequest == "function"){
                        stopRequest.call(thiz,element,response.msg);
                    }
                }
             });
            return 'ajax';
        },
        errormsg: '',
        info: ''
    }
}

$.vtype = vtype;
