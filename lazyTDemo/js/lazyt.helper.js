;
(function (global, factory) {

	if (typeof module !== 'undefined' && module.exports) {
		var lazyT = require('./lazyT');
		factory(lazyT);
	} else if (typeof define === 'function' && define.amd) {
		require(['lazyT'], function (lazyT) {
			factory(lazyT);
		})
	} else {
		factory(global.lazyT);
	}

})(this, function (lazyT) {

	var oldtmplFunc = lazyT.tmpl;

	lazyT.tmpl = function (template) {
		var creator = oldtmplFunc(template);

		return function (D) {
			return creator.call(lazyT.Helper, D);
		};
	};

	lazyT.Helper = (function () {

		var helpFuncCache = {},
			isString = function (c) {
				return 'string' === typeof c;
			};

		return {
			add: function (name, func, isCover) {
				if (isString(name) && typeof func === 'function') {
					if (!(name in helpFuncCache) || isCover) {
						helpFuncCache[name] = func;
					}
				}
			},
			execHelper: function () {
				var args,
					helpName,
					res = null;
				if (arguments.length > 0) {
					args = Array.prototype.slice.call(arguments, 0);
					helpName = args[0];
					if (isString(helpName) && helpFuncCache[helpName]) {
						res = helpFuncCache[helpName].apply(this, args.slice(1));
					}
				}
				return res;
			}
		}
	})();

	lazyT.templateSettings.TemplateRegQueue.push({
		reg: /\{#@helper\:([\w]+)\:(\S+)#\}/g,
		func: function (m, helpName, args) {
			return "';res+=this.execHelper('" + helpName + "'" + "," + args + ")||'';res+='";
		}
	});
})