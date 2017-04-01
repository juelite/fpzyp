define('./ocx_kmsfileupload', ['{hikui}/active_x'], function(require, exports){
    var Active_x = require('{hikui}/active_x');
    return Active_x.extend({
    
        constructor: function(opt){
            this.base(opt, ['hikui-active'], []);
        },
        render: function(){
            this.base('clsid:8CB60BB1-1658-41A9-A4F9-411E4D91B7BE');
        },
        throwError: function(error){
			throw new Error(error);
        },
		handleException : function(e) {
            if(typeof jAlert != 'undefined')
                jAlert("ocx.reUpdate");
		},
        UpdateGlobalParam: function(data){
            this.hasUpdateGlobalParam = true;
            var pxml = ['<Globalparam><kms_info><ip>', data.vmsBo.ipAddr, '</ip><port>', data.vmsBo.wsPort, '</port><user_name>', data.vmsBo.loginName, '</user_name><user_pwd>', data.vmsBo.pwd, '</user_pwd></kms_info></Globalparam>'];
			this.ocxEl[0].UpdateGlobalParam(pxml.join(''));
        },
        
        LocalFileUpLoad: function(data, file, indexCode, type, mmtype,tauto){
            var fxml = ['<FileUploadParam>', '<file_type>', type, '</file_type>', // <!-- 0—抓图 1—本地录像 -->
 '<dev_type>0</dev_type>', // <!-- 设备类型: 0-海康，1-大华 -->
 '<camera_index>', data.camera.channelno, '<camera_index>', // 监控点索引
 '<camera_indexcode>', data.camera.indexcode, '</camera_indexcode>', // 监控点编号
 '<camera_name>', data.camera.name, '</camera_name>', // 监控点名称
 '<uploader>', data.camera.creator, '</uploader>', // <!-- 上传者名称 -->
 '<file_name>', file, '</file_name>', // <!-- 全文件名 -->
 '</FileUploadParam>'];
            return this.ocxEl[0].LocalFileUpLoad(fxml.join(''), tauto);
        },
        
        toLocalFileUpLoad: function(file, indexCode, type, mmtype,tauto){
            var self = this;
            $.ajax({
                url: 'loadUploadFileInfo.action',
                data: {
                    indexCode: indexCode,
                    action: this.hasUpdateGlobalParam ? 1 : 0
                },
                dataType: 'json',
                success: function(data){
                    if (!self.hasUpdateGlobalParam) {
                    	if(data.vmsBo==null){
                            if(typeof jAlert != 'undefined')
                                jAlert(language.text("ocx.configKMS"));
                            return;
                    	}
                        self.UpdateGlobalParam(data);
                    }
                    self.LocalFileUpLoad(data, file, indexCode, type, mmtype,tauto);
                }
            })
        }
    });
});
