(function (global) {
	'use strict';

	var lazyT = {
		templateSettings: {
			TemplateRegQueue: [{
				reg: /(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, //去掉换行
				func: ' '
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