var NavConfig = {
	NavList: [{
		title: '例子',
		url: 'demo1.html'
	}, {
		title: '{##  #}',
		url: 'demo2.html'
	}, {
		title: '{#?#} {#??#} {#?#}',
		url: 'demo3.html'
	}, {
		title: '{#~D.dataList:item:index#} {#~#}',
		url: 'demo4.html'
	}, {
		title: '顶通中的应用',
		url: 'demo5.html'
	}, {
		title: '扩展lazyT',
		url: 'extendlazyT.html'
	}, {
		title: '速度测试1',
		url: 'speedTest.html'
	}, {
		title: '速度测试2',
		url: 'speedTest2.html'
	}, {
		title: '文件加载比较',
		url: 'jsSourceSize.html'
	}],
	templateStr: '<div class="header"><h1>lazyT 示例</h1><ul id="navListContainer">{#~D:item:index#}<li><a href="{#=item.url#}"><i>{#=item.title#}</i></a></li>{#~#}</ul></div>'
};
var html = lazyT.tmpl(NavConfig.templateStr)(NavConfig.NavList);
$(document.body).prepend(html);