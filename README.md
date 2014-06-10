lazyT
=====

a light weight template engine use for bitauto

轻量级 javascript 模板引擎

##	目录

*	[特性](#特性)
*	[快速上手](#快速上手)
*	[模板语法](#模板语法)
*	[下载](#下载)
*	[方法](#方法)
*	[更新日志](#更新日志)
*	[授权协议](#授权协议)
*	[使用示例](http://111skr.github.com/lazyT/lazyTDemo/demo1.html)

##	特性

1.	无依赖，纯原生
2.	提供便捷语法实现if，for逻辑
3.	低复杂度
4.	可扩展
5.	执行效率较高（[性能测试](http://111skr.github.com/lazyT/lazytDemo/speedTest.html)）


## 快速上手


### 编写模板

使用一个``type="text/x-lazyT-template"``的``script``标签存放模板：
	
	<script id="test" type="text/html">
	<h1>{#= D.title#}</h1>
	<ul>
	    {#~ D.list:item:index #}
		<li>
                索引 {#=index + 1#} ：{#=item#}</li>
		{#? index >0 #}
			<h1>{#=index*1#}</h1>
		{#?#}
                </li>
	    {#~#}
	</ul>
	</script>

### 渲染模板
	
	var data = {
		title: '标签',
		list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
	};
	var template = document.getElementById('content').innerHTML,
	html = lazyT.tmpl(template)(data);
	document.getElementById('content').innerHTML = html;


[演示](http://111skr.github.com/lazyT/lazyTDemo/demo1.html)

##	模板语法

有两个版本的模板语法可以选择。

###	简洁语法

推荐使用，语法简单实用，利于读写。

####    条件判断

        {#? 判断表达式 #}    //等价于 if( )
        
        {#?? 判断表达式#}    //等价于 else if( )

        {#??#}               //等价于 else

        {#?#}

####    循环

	{#~ [循环体]:[单项]:[索引] #}		
	
	{#~#}

###	原生语法
	
	{## js code #}
        例如：
	{## if(D.isLogined){ #}
		{#= D.UserName#}
	{## } #}

##	下载

* [lazyT.js](https://raw.githubusercontent.com/111skr/lazyT/master/lazyT.js) 
* [lazyT.min.js](https://raw.githubusercontent.com/111skr/lazyT/master/lazyT.min.js)


## 更新日志


## 授权协议

Released under the MIT

============
