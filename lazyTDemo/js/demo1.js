(function (global) {
    'use strict';

    var lazyT = {
        templateSettings: {
            TemplateRegQueue: [{
                reg:/^\s*|\s$/g, // /(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, //去掉换行
                func: ''
            }, {
                reg: /\r|\n|\t|\/\*[\s\S]*?\*\//g,//去掉注释和空白
                func: ''
            }, {
                reg: /'|\\/g, //对模板中的js字符串等添加转义字符
                func: '\\$&'
            }, {
                reg: /\{#=([\s\S]+?)#\}/g, //变量输出
                func: function (m, code) {
                    return "'+(" + unescape(code) + ")+'";
                }
            }, {
                reg: /\{##([\s\S]+?)#\}/g, //js代码执行
                func: function (m, code) {
                    return "';" + unescape(code) + "res+='";
                }
            }, {
                reg: /\{#\?(\?)?\s*([\s\S]*?)\s*#\}/g, //判断
                func: function (m, elsecase, code) {
                    return elsecase ?
                        (code ? "';}else if(" + unescape(code) + "){res+='" : "';}else{res+='") :
                        (code ? "';if(" + unescape(code) + "){res+='" : "';}res+='");
                }
            }, {
                reg: /\{#~\s*(?:#\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*#\})/g, //循环遍历
                func: function (m, iterate, vname, iname) {
                    if (!iterate) return "';} res+='";
                    return "';for(var " + vname + "," + iname + "=0,len=" + iterate + ".length;" + vname + "=" + iterate + "[" + iname + "]," + iname + "<len;" + iname + "++){res+='";
                }
            }],
            PackagingRegQueue: [{
                reg: /^([\s\S]+)$/g, //添加拼接字符串的变量和返回变量
                func: "var res ='$1';return res;"
            }, {
                reg: /(\s|;|\}|^|\{)\s*res\s*\+\s*=\s*'\s*'\s*;/g, //去掉 res+=';'  ;res+='';  }res+='';  {res+='';
                func: '$1'
            }, {
                reg: /\+'\s*'/g,
                func: ''
            }, {
                reg: /(\s|;|\}|^|\{)res\+='\s*'\+/g, //去掉无用的空白字符串
                func: '$1res+='
            }],
            varname: 'D'
        }
    };

    function unescape(code) {
        return code.replace(/\\('|\\)/g, "$1");
    }

    lazyT.tmpl = function (t) {
        var str = t,
            s = lazyT.templateSettings,
            regQueue = s.TemplateRegQueue.concat(s.PackagingRegQueue);

        for (var item, i = 0, len = regQueue.length; i < len; i++) {
            item = regQueue[i];
            str = str.replace(item.reg, item.func);
        }

        try {
            return new Function(s.varname, str);
        } catch (e) {}
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = lazyT;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return lazyT;
        });
    } else {
        global.lazyT = lazyT;
    }
}(this));
﻿;
var Bitauto = Bitauto || {}; //IE的分裂人格问题处理，在js的最开头，添加外部声明
(function (window, undefined) {

	window.Bitauto = window.Bitauto || {};
	window.Bitauto.Login = window.Bitauto.Login || {};

	var utils = {
		callScript: function (url, callback) {
			var head = document.getElementsByTagName("head")[0],
				domscript = document.createElement("script");
			domscript.setAttribute('type', 'text/javascript');
			domscript.setAttribute('src', url);
			domscript.onload = domscript.onreadystatechange = function () {
				if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
					callback && callback();
					domscript.onload = domscript.onreadystatechange = null;
					domscript.parentNode.removeChild(domscript);
				}
			};
			head.appendChild(domscript);
		},
		LoadJs: (function () {
			var LoadJs = {
				LoadedRecords: [],
				head: document.getElementsByTagName("head")[0],
				ExecJs: function (url, callback) {
					var isLoaded = false;

					for (var i = 0, len = LoadJs.LoadedRecords.length; i < len; i++) {
						if (LoadJs.LoadedRecords[i] === url) {
							isLoaded = true;
						}
					}

					if (!isLoaded) {
						var domscript = document.createElement("script");
						domscript.setAttribute('type', 'text/javascript');
						domscript.setAttribute('src', url);
						domscript.onload = domscript.onreadystatechange = function () {
							if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
								domscript.onloadDone = true;
								callback && callback(url);
								domscript.onload = domscript.onreadystatechange = null;
								domscript.parentNode.removeChild(domscript);
							}
						};
						LoadJs.head.appendChild(domscript);
						LoadJs.LoadedRecords.push(url);
					} else {
						callback && callback(url);
					}
				}
			};
			return LoadJs;
		})(),

		extend: function (target, extendObj, isCover) {
			for (var item in extendObj) {
				if ((item in target) && isCover) {
					target[item] = extendObj[item];
				} else {
					target[item] = extendObj[item];
				}
			}
		},

		$: function (id) {
			return document.getElementById(id);
		},
		isFunction: function (obj) {
			return typeof (obj) === 'function';
		}
	},

		ibtLoginOptions = {
			loginHandlerUrl: "http://api.baa.bitauto.com/login/LoginHandler.ashx"
		},

		ibtLogin = {
			Utils: utils,
			extend: function (extendObj, isCover) {
				this.Utils.extend(this, extendObj, isCover);
			},
			result: null,

			onLoginedHandlers: [],

			onComplatedHandlers: [],
			onBeforePostLogin: null,
			postLogin: function (un, up) {
				(ibtLogin.onBeforePostLogin && ibtLogin.onBeforePostLogin());
				ibtLogin.Utils.LoadJs.ExecJs("http://js.inc.baa.bitautotech.com/c/c.js?s=Bitauto.Login.Rsa", function () {
					var key = new Bitauto.RSA.RSAKeyPair("010001", "", "AEEE48CCB2061B182180E4F42AE6684B9194A7AAFDFA04D979EB367A8BB330BE9118EEB7B1D040A1EE6D4C862A5FAE1D7AF4E76B6D4364DB8D2D364D5C9F26B8FF83DA8EB4AF8624AC2488E84DFFFAD91F3E9C5E392D2DA5BF70DE0430787CFEC5833F2CF48F8D64FBCB60B8DFB449FBFB2B27B783AB07DD4A331D4989612DB1"),
						encName = Bitauto.RSA.EncryptedString(key, encodeURIComponent(un)),
						encPwd = Bitauto.RSA.EncryptedString(key, encodeURIComponent(up)),
						src = ibtLoginOptions.loginHandlerUrl + "?username=" + encName + "&userpwd=" + encPwd + "&isrsa=true&r=" + Math.random() + "&returnurl=" + encodeURIComponent(location.href);
					ibtLogin.Utils.callScript(src);
				});
			},

			onloginComplete: function () {
				if (this.result) {
					var temAuths = this.result.auths,
						loadedAuthArr = [],
						isLoadedCurrentDomainAuth = false,
						timeOutId = 0,
						thisItem = this,
						temHostArr = document.location.host.split('.'),
						currentHostName = temHostArr[temHostArr.length - 2],
						onlogined = function () {
							if (ibtLogin.result) {
								for (var i = 0, len = ibtLogin.onComplatedHandlers.length; i < len; i++) {
									utils.isFunction(ibtLogin.onComplatedHandlers[i]) && ibtLogin.onComplatedHandlers[i](ibtLogin.result);
								}
							}

							if (ibtLogin.result.isLogined || ibtLogin.result.loginResult) {
								for (var i = 0, len = ibtLogin.onLoginedHandlers.length; i < len; i++) {
									utils.isFunction(ibtLogin.onLoginedHandlers[i]) && ibtLogin.onLoginedHandlers[i](ibtLogin.result);
								}
							}
						},
						onLoadedScript = function (url) {
							loadedAuthArr.push(url);
							//TODO:添加验证是否获取当前域的身份cookie
							if (!isLoadedCurrentDomainAuth) {
								isLoadedCurrentDomainAuth = url.replace(currentHostName, '').length < url.length;
							}
							if (loadedAuthArr.length === temAuths.length) {
								if (timeOutId > 0) {
									clearTimeout(timeOutId);
								}
								onlogined();
							}
						},
						onTimeOut = function () {
							onLoadedScript = function () {};
							onlogined();
							if (isLoadedCurrentDomainAuth) {
								throw new Error('load currendDomain cookieAuth of ' + currentHostName + ' fail');
							};
						};

					if (typeof ([]) === typeof (temAuths) && temAuths.length > 0) {
						for (var i = 0, len = temAuths.length; i < len; i++) {
							thisItem.Utils.LoadJs.ExecJs(temAuths[i], onLoadedScript);
						}
						timeOutId = setTimeout(onTimeOut, 2000);
					} else {
						onlogined();
					}
				};
			},

			loadData: function () {
				ibtLogin.Utils.callScript(ibtLoginOptions.loginHandlerUrl + "?r=" + Math.random());
			},

			applyByCustom: Bitauto.Login.applyByCustom === undefined ? false : Bitauto.Login.applyByCustom,

			init: function () {
				if (!ibtLogin.applyByCustom) {
					ibtLogin.loadData();
				}
			}

		};


	utils.extend(ibtLogin, window.Bitauto.Login);
	window.Bitauto.Login = ibtLogin;
})(window);
﻿//顶通界面处理
;
(function () {
    Bitauto.Login.extend({
        Template: {
            template: '',
            create: lazyT.tmpl
        },
        containerId: {
            TopLoginId: "LoginContainer"
        },
        container: function () {
            return Bitauto.Login.Utils.$(this.containerId.TopLoginId);
        }
    });

    Bitauto.Login.onComplatedHandlers.push(function (loginResult) {
        if (Bitauto.Login.result) {
            Bitauto.Login.container().innerHTML = Bitauto.Login.Template.create(Bitauto.Login.Template.template)(loginResult);
        }
    });

})();
﻿// 登录逻辑处理
;
(function () {
    Bitauto.Login.extend({
        login: function (txtUserName, txtPassword) {
            if (txtUserName.value === "") {
                txtUserName.focus();
                location.href = "http://i.qichetong.com/authenservice/login.aspx?error=1&ReturnUrl=" + encodeURIComponent(location.href);
            } else if (txtPassword.value === "") {
                txtPassword.focus();
                location.href = "http://i.qichetong.com/authenservice/login.aspx?error=1&ReturnUrl=" + encodeURIComponent(location.href);
            } else {
                Bitauto.Login.postLogin(txtUserName.value, txtPassword.value);
            }
        },
        onEnter: function (e, txtUserName, txtPassword, btnLogin) {
            if (e.keyCode != 13) return;
            this.login(txtUserName, txtPassword);
        },
        customLogout: null,
        logout: function (alink) {
            (this.customLogout && this.customLogout());
            location.href = "http://i.bitauto.com/SingleSignOn/Logout.aspx?returnurl=" + encodeURIComponent(location.href);
        }
    });
    Bitauto.Login.onLoginedHandlers.push(function (loginResult) {
        if (!!Bitauto.Login.isNeedRefresh && loginResult && loginResult.isLogined && loginResult.loginResult) {
            location.reload();
        }
    });
})();
﻿// 第三方登录
;
(function () {
    Bitauto.Login.extend({
        OtherWebSiteLogin: function (platForm, winWidth, winHeight) {
            var domain = location.host.split("."),
                isNeedOpenInCurrentWindow = platForm.toLowerCase() === 'taobao' && !(/qichetong|bitauto/ig).test(location.host),
                strDomain = isNeedOpenInCurrentWindow ? 'qichetong.com' : domain[domain.length - 2] + "." + domain[domain.length - 1],
                url = 'http://i.' + strDomain;

            url += '/UserIntergration/Renren/TopLogin.aspx?key=' + platForm + '&returnurl=' + location.href;

            if (isNeedOpenInCurrentWindow) {
                location.href = url;
            } else {
                document.domain = domain[domain.length - 2] + '.' + domain[domain.length - 1];
                window.open(url, platForm, 'width=' + winWidth + ', height=' + winHeight + ', toolbar =no, menubar=no, scrollbars=yes, resizable=no,location=no,status=no');
            }
        }
    })
})();
﻿;
(function () {
    Bitauto.Login.extend({
        afterLoginDo: function (invoke) {
            var LoginObj = this.result;
            if (LoginObj) {
                var flag = "isLogined" in LoginObj && LoginObj.isLogined;
                if (flag) invoke();
                else {
                    var domain = location.host.split(".");
                    document.domain = domain[domain.length - 2] + "." + domain[domain.length - 1];
                    var handler = function () {
                        AjaxLogin.callBack = function () {
                            AjaxLogin.close();
                            Bitauto.Login.init();
                            invoke();
                        };
                        AjaxLogin.show();
                    };
                    if (typeof AjaxLogin == "undefined") {
                        this.Utils.LoadJs.ExecJs("http://js.inc.baa.bitautotech.com/quicklogin.js", handler);
                    } else {
                        handler();
                    }
                }
            }

        }
    });
})();
﻿;
(function (window, undefined) {
	var ibtLogin = window.Bitauto.Login,
		baseInit = ibtLogin.init;

	ibtLogin.finallyHandlers = ibtLogin.onComplatedHandlers;
	ibtLogin.onloginedHandlers = ibtLogin.onLoginedHandlers;
	ibtLogin.getLoginModule = function () {
		ibtLogin.loadData();
	};

	ibtLogin.onLoginedHandlers.push(function () {
		if (typeof (ibtLogin.onlogined) === 'function') {
			ibtLogin.onlogined.apply(ibtLogin, arguments);
		};
	});

	ibtLogin.init = function (containerId) {
		if (typeof (containerId) === 'string' && ibtLogin.containerId) {
			ibtLogin.containerId.TopLoginId = containerId;
		}
		baseInit.apply(ibtLogin, arguments);
	};
	window.LoadJs = ibtLogin.Utils.LoadJs;
})(window);
﻿/*********************************************************
 * Creator：songzb
 * Create time：2014-02-28
 * dependents:
 * Description：监听用户是否有新信息
 * history：
 * *******************************************************/
(function (window, factory) {
	'use strict';

	if (typeof exports !== 'undefined') {
		// CommonJS
		exports.NewMessageListener = factory(window);
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define('NewMessageListener', [], function () {
			return factory(window);
		});
	} else {
		// Browser global
		window.Bitauto = window.Bitauto || {};
		window.Bitauto.NewMessageListener = factory(window);
	}
})(window, function (window) {
	'use strict';

	var Utils,
		EnumMsgState,
		defaultOptions,
		JsonpHelper,
		NewMessageListener;

	Utils = {
		extend: function (obj1, obj2) {
			if ( !! obj2) {
				for (var item in obj1) {
					if (obj2[item]) {
						if (typeof obj2[item] === 'object') {
							obj1[item] = extend(obj1[item], obj2[item]);
						} else {
							obj1[item] = obj2[item];
						}
					}
				}
			}
			return obj1;
		},

		guidGenerator: function () {
			var S4 = function () {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			};

			return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
		},
		execFuncArrary: function (arr, args, context) {
			context = context ? context : this;
			if (arr && arr.length) {
				for (var i = 0, len = arr.length; i < len; i++) {
					arr[i].apply(context, Array.prototype.slice.call(arguments, 1));
				}
			}
		},
		cloneEvents: function (eventsSource) {
			var copyObj = {};
			for (var item in eventsSource) {
				copyObj[item] = eventsSource[item].concat();
			}
			return copyObj;
		},

		getIndexOfArr: function (item, arr) {
			var i = 0,
				len = arr;
			for (; i < len; i++) {
				if (item === arr[i]) {
					return i;
				}
			}
			return -1;
		}

	};

	JsonpHelper = (function () {
		var head = document.getElementsByTagName("head")[0],
			events = [],
			create = function (callback, context) {

				var key = Utils.guidGenerator(),
					scriptElm = this.scriptElm = document.createElement('script');

				scriptElm.setAttribute('type', 'text/javascript');
				scriptElm.setAttribute('src', 'http://api.baa.bitauto.com/ibt/GetNewMessageState.ashx?key=' + key + '&callback=NewMessageListenerCallBack');
				scriptElm.setAttribute('charset', 'UTF-8');

				scriptElm.onload = scriptElm.onreadystatechange = function () {
				    if (!this.readyState || "loaded" === scriptElm.readyState || "complete" === scriptElm.readyState) {
						this.parentNode.removeChild(this);
					}
				};

				events.push({
					key: key,
					func: callback,
					context: context
				});

				head.appendChild(scriptElm);
			},
			getEventIndex = function (key) {
				var i, len;
				for (i = 0, len = events.length; i < len; i++) {
					if (events[i].key === key) {
						return i;
					}
				}
				return -1;
			},

			onJsonpElmLoaded = function (data) {
				var eventIndex = getEventIndex(data.key),
					callback = eventIndex < 0 ? null : events[eventIndex];
				if (callback) {
					callback.func.call(callback.context, data);
					events.splice(eventIndex, 1);
				}
			};

		window.NewMessageListenerCallBack = onJsonpElmLoaded;

		return {
			create: create,
			onLoadName: 'onLoaded'
		};

	})();

	EnumMsgState = {
		Error: 0,
		NoLogin: 1,
		NewMsg: 2,
		NoNewMsg: 3
	};

	NewMessageListener = function (options, events) {
		if (!(this instanceof NewMessageListener)) {
			return new NewMessageListener(options);
		}

		this.options = Utils.extend({
			mediatorInterval: true,
			interval: 5000
		}, options);

		this.eventsContainer = Utils.extend({
			'NewMessage': [],
			'Error': [],
			'NoLogin': [],
			'NoNewMessage': [],
			'RequestComplated': []
		}, events);

	};

	NewMessageListener.prototype.on = function (key, callbacksArr) {
		var baseCallbacksArr;

		if (typeof key === 'string' && this.eventsContainer.hasOwnProperty(key) &&
			(callbacksArr instanceof Array || typeof callbacksArr === 'function')) {

			baseCallbacksArr = this.eventsContainer[key];
			if (!(baseCallbacksArr instanceof Array)) {
				baseCallbacksArr = [];
			}

			this.eventsContainer[key] = baseCallbacksArr.concat(callbacksArr);
		}
	};

	NewMessageListener.prototype.off = function (key, callbacksArr) {
		var baseCallbacksArr;

		if (typeof key === 'string' && this.eventsContainer.hasOwnProperty(key)) {

			baseCallbacksArr = this.eventsContainer[key];

			if (!callbacksArr) {
				this.eventsContainer[key] = [];
			} else if (callbacksArr instanceof Array) {
				for (var i = 0, j = 0, ilen = baseCallbacksArr.length, jlen = callbacksArr.length; i < ilen; i++) {
					for (; j < jlen; j++) {
						if (baseCallbacksArr[i] === callbacksArr[j]) {
							baseCallbacksArr.splice(i, 1);
						}
					}
				}
			} else if (typeof callbacksArr == 'function') {
				for (var i = 0, len = baseCallbacksArr.length; i < len; i++) {
					if (baseCallbacksArr[i] === callbacksArr) {
						baseCallbacksArr.splice(i, 1);
						break;
					}
				};
			}
		}
	};

	NewMessageListener.prototype.run = function (mediatorInterval) {

		var currentEvents = Utils.cloneEvents(this.eventsContainer),
			currentMonitorInerval = typeof mediatorInterval === 'boolean' ? mediatorInterval : this.options.mediatorInterval;

		JsonpHelper.create(function (data) {
			var callbacksArr,
				$this = this;

			if (data.state) {
				switch (data.state) {
				case EnumMsgState.Error:
					callbacksArr = currentEvents["Error"];
					break;
				case EnumMsgState.NewMsg:
					callbacksArr = currentEvents["NewMessage"];
					break;
				case EnumMsgState.NoLogin:
					callbacksArr = currentEvents["NoLogin"];
					break;
				case EnumMsgState.NoNewMsg:
					callbacksArr = currentEvents["NoNewMessage"];
					break;
				}
			} else {
				callbacksArr = currentEvents["Error"];
			}

			Utils.execFuncArrary(callbacksArr.concat(currentEvents["RequestComplated"]), data, this);

			if (currentMonitorInerval) {
				this.intervalId = setTimeout(function () {
					$this.run(mediatorInterval);
				}, this.options.interval);
			}

		}, this);
	};

	NewMessageListener.prototype.stop = function (mediatorInterval) {
		if (arguments.length > 0) {
			this.options.mediatorInterval = !mediatorInterval;
		}
		if (this.intervalId > 0) {
			clearTimeout(this.intervalId);
		}
	};

	return NewMessageListener;
});
﻿;
(function () {
	Bitauto.Login.onBeforePostLogin = function () {
		Bitauto.Login.container().innerHTML = '<ul><li>正在登录，请稍候……</li></ul>';
	};
	Bitauto.Login.onLoginedHandlers.push(function () {
		var msgListener = Bitauto.NewMessageListener({
			interval: 60000
		});
		msgListener.on('RequestComplated', function (data) {
			var msgBox = document.getElementById('top_msg');
			if (data.state == 2) {
				msgBox.firstChild.innerHTML = "新消息";
				msgBox.firstChild.className = "newmsg";
			} else {
				msgBox.firstChild.innerHTML = "消息";
				msgBox.firstChild.className = "";
			}
		})
		msgListener.run();
	});
	Bitauto.Login.Template.template = "<ul>{#? D.isLogined#}<li>您好,</li><li class=\"bit_link\" onmouseover=\"document.getElementById('ulIBitauto').style.display='';this.className='bit_link bit_hover'\" onmouseout=\"document.getElementById('ulIBitauto').style.display='none';this.className='bit_link'\"><strong><a target=\"_blank\" id=\"aHeaderUserName\" href=\"http://i.qichetong.com/u{#=D.userId#}\">{#=D.userName#}<em></em></a><sub></sub></strong><ul class=\"byname login_linkbox\" id=\"ulIBitauto\" style=\"display: none;\"><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!forum/topics.html\">我的论坛</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/apps/!lukuang/\">实时路况</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!ask/\">我的问答</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!wz/\">违章查询</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!album/AlbumList.html\">我的相册</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!jz/\">用车记账</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!badges/default.html\">我的勋章</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!youhao/\">有号购车</a></li><li><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/!giftshop/converted.html\">礼品兑换</a></li><li><a target=\"_blank\" href=\"http://j.bitauto.com/\">品牌之家</a></li><li class=\"enteribit\"><a target=\"_blank\" href=\"http://i.qichetong.com/\">进入汽车通&gt;&gt;</a></li></ul></li><li class=\"login_0\" id=\"top_msg\"><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/MessageCenter/\" class=\"\">消息</a></li><li id=\"myfocuscar\" class=\"bit_link\" onmouseover=\"document.getElementById('login_myfocuscar').style.display='';this.className='bit_link bit_hover';\" onmouseout=\"document.getElementById('login_myfocuscar').style.display='none';this.className='bit_link'\"><strong><a href=\"javascript:;\">我关注的车<em></em></a><sub></sub></strong><ul class=\"focuscar login_linkbox\" id=\"login_myfocuscar\" style=\"display: none;\"><li><b>最近看过</b>{#? D.viewedcars.length>0#} {#~ D.viewedcars:car:index#}<p><a target=\"_blank\" href=\"http://car.bitauto.com/{#=car.CarSerialAllSpell#}\">{#=car.CarSerialTitle#}</a></p>{#~#}{#?#}<b class=\"mygarage\"><a target=\"_blank\" href=\"http://i.qichetong.com/u{#=D.userId#}/car\">我的车库</a></b>{#?D.owncar.length>0#}{#~D.owncar:car:index#}<p><a target=\"_blank\" href=\"http://car.bitauto.com/{#=car.CarSerialAllSpell#}\">{#=car.CarSerialTitle#}</a></p>{#~#}{#?#}{#?D.plancar.length>0#}{#~D.plancar:car:index#}<p><a target=\"_blank\" href=\"http://car.bitauto.com/{#=car.CarSerialAllSpell#}\">{#=car.CarSerialTitle#}</a></p>{#~#}{#?#}</li></ul></li><li class=\"lastB\"><a target=\"_self\" href=\"javascript:Bitauto.Login.logout(this);\">[退出]</a></li>{#??#}<li><label>帐号</label><input onkeypress=\"Bitauto.Login.onEnter(event,this,document.getElementById('txtUserPwdHeader'),document.getElementById('btnUserLoginHeader'));\" class=\"bit_loginInput\" name=\"txtUserNameTopHeader\" id=\"txtUserNameTopHeader\" type=\"text\"></li><li><label>密码</label><input onkeypress=\"Bitauto.Login.onEnter(event,document.getElementById('txtUserNameTopHeader'),this,document.getElementById('btnUserLoginHeader'));\" class=\"bit_loginInput\" name=\"txtUserPwdHeader\" id=\"txtUserPwdHeader\" type=\"password\"></li><li class=\"login\"><input value=\"登录\" class=\"bit_logintop\" id=\"btnUserLoginHeader\" onclick=\"Bitauto.Login.login(document.getElementById('txtUserNameTopHeader'),document.getElementById('txtUserPwdHeader'))\" type=\"button\"></li><li class=\"login_0\"><a target=\"_blank\" href=\"http://i.qichetong.com/authenservice/register/default.aspx\">注册</a></li><li class=\"bit_link\" onmouseover=\"document.getElementById('ulSqure').style.display='';this.className='bit_link bit_hover';\"onmouseout=\"document.getElementById('ulSqure').style.display='none';this.className='bit_link';\"><strong><a href=\"javascript:void(0)\">其它帐号登录<em></em></a><sub></sub></strong><ul id=\"ulSqure\" style=\"display: none\"><li><a target=\"_self\" class=\"sina\" title=\"新浪微博帐号登录\" href=\"javascript:void(0)\" onclick=\"Bitauto.Login.OtherWebSiteLogin('Sina');\">新浪微博</a></li><li><a target=\"_self\" class=\"qq\" title=\"QQ帐号登录\" href=\"javascript:void(0)\" onclick=\"Bitauto.Login.OtherWebSiteLogin('Tencent');\">QQ帐号</a></li><li><a target=\"_self\" title=\"人人网帐号登录\" class=\"renren\" href=\"javascript:void(0)\" onclick=\"Bitauto.Login.OtherWebSiteLogin('Renren');\">人人网</a></li><li><a target=\"_self\" id=\"kx001_btn_login\" class=\"kaixin\" href=\"javascript:void(0)\" onclick=\"Bitauto.Login.OtherWebSiteLogin('Kaixin');\">开心网</a></li><li><a target=\"_self\" class=\"baidu\" href=\"javascript:void(0)\" onclick=\"Bitauto.Login.OtherWebSiteLogin('Baidu');\">百度</a></li><li class=\"last\"><a target=\"_self\" class=\"taobao\" href=\"javascript:void(0)\" onclick=\"Bitauto.Login.OtherWebSiteLogin('Taobao');\">淘宝网</a></li></ul></li>{#?#}</ul>";
})();

