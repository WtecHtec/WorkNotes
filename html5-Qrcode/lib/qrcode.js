(function($) {
	window.result = ''
    var Qrcode = function(tempBtn,callback) {
		Qrcode.prototype['callback'] = callback
        var _this_ = this;
        var isWeiboWebView = /__weibo__/.test(navigator.userAgent);

        if (isWeiboWebView) {
            if (window.WeiboJSBridge) {
                _this_.bridgeReady(tempBtn);
            } else {
                document.addEventListener('WeiboJSBridgeReady', function() {
                    _this_.bridgeReady(tempBtn);
                });
            }
        } else {
            _this_.nativeReady(tempBtn);
        }
    };

    Qrcode.prototype = {
        nativeReady: function(tempBtn) {
            $('[node-type=jsbridge]',tempBtn).on('click',function(e){
                e.stopPropagation();
            });

            $(tempBtn).bind('click',function(e){
                $(this).find('input[node-type=jsbridge]').trigger('click');
            });

            $(tempBtn).bind('change', this.getImgFile);
        },
        bridgeReady: function(tempBtn) {
            $(tempBtn).bind('click', this.weiBoBridge);
        },
        weiBoBridge: function() {
			console.log('sss')
            window.WeiboJSBridge.invoke('scanQRCode', null, function(params) {
				
				Qrcode.prototype['callback'](params.result)
				//得到扫码的结果
                $('.result-qrcode').append(params.result + 'weiBoBridge <br/>');
            });
        },
        getImgFile: function() {
            var _this_ = this;
            var inputDom = $(this).find('input[node-type=jsbridge]');
            var imgFile = inputDom[0].files;
            var oFile = imgFile[0];
            var oFReader = new FileReader();
            var rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

            if (imgFile.length === 0) {
                return;
            }

            if (!rFilter.test(oFile.type)) {
                alert("选择正确的图片格式!");
                return;
            }

            oFReader.onload = function(oFREvent) {
			    console.log('oFREvent',oFREvent.target.result)
                qrcode.decode(oFREvent.target.result);
                qrcode.callback = function(data) {
					
					Qrcode.prototype['callback'](data)
                    //得到扫码的结果
                    $('.result-qrcode').append(data + 'oFREvent <br/>');
					inputDom.val('')
					
				};
            };

            oFReader.readAsDataURL(oFile);
        },
        destory: function() {
            $(tempBtn).off('click');
        }
    };

    Qrcode.init = function(tempBtn, callback) {
        var _this_ = this;

        tempBtn.each(function() {
            new _this_($(this),callback);
        });
		
    };
    window.Qrcode = Qrcode;
})(window.Zepto ? Zepto : jQuery);
