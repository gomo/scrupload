<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
	<title>Scrapload</title>
	<script type="text/javascript" src="/js/sdx/lib/jquery-1.4.4.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/jquery.cookie.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/jquery-ui-1.8.7.custom.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/swfupload/swfupload.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/swfupload/plugins/swfupload.queue.js"></script>
	<script type="text/javascript" src="/scrupload/src/jquery.ui.scrupload.all.js"></script>
	<script type="text/javascript">
		$(function(){
			var limit = 3;
			var count = {
				html5: 0,
				http:  0,
				html4: 0,
				swf:   0
			};

			$("#button_html5").scruploadHtml5({
				url: '/scrupload/sample/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "1MB",
				types: "jpg|jpeg|gif|png|bmp",
				onInit: function(event, ui)
				{
					display(ui.element, 'init', ui);
				},
				onDialogClose: function(event, ui)
				{
					display(ui.element, 'onDialogClose', ui);
				},
				onSelect: function(event, ui)
				{
					display(ui.element, 'select', ui);
					if(count.html5 >= limit)
					{
						return false;
					}

					++count.html5;
				},
				onStartUpload: function(event, ui)
				{
					display(ui.element, 'start_upload', ui);
				},
				onFileStart: function(event, ui)
				{
					display(ui.element, 'file_start', ui);
				},
				onProgress: function(event, ui)
				{
					display(ui.element, 'progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					display(ui.element, 'file complete', ui);
				},
				onButtonOver: function(event, ui)
				{
					display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					display(ui.element, 'button out', ui);
				},
				onComplete: function(event, ui)
				{
					display(ui.element, 'complete', ui);
				},
				onError: function(event, ui)
				{
					display(ui.element, 'error', ui);
				}
			});


			
			
			$("#button_http").scruploadHttp({
				url: '/scrupload/sample/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "8MB",
				types: "jpg|jpeg|gif|png|bmp",
				onInit: function(event, ui)
				{
					display(ui.element, 'init', ui);
				},
				onDialogClose: function(event, ui)
				{
					display(ui.element, 'onDialogClose', ui);
				},
				onSelect: function(event, ui)
				{
					display(ui.element, 'select', ui);
					if(count.http >= limit)
					{
						return false;
					}

					++count.http;
				},
				onStartUpload: function(event, ui)
				{
					display(ui.element, 'start_upload', ui);
				},
				onFileStart: function(event, ui)
				{
					display(ui.element, 'file_start', ui);
				},
				onProgress: function(event, ui)
				{
					display(ui.element, 'progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					display(ui.element, 'file complete', ui);
				},
				onButtonOver: function(event, ui)
				{
					display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					display(ui.element, 'button out', ui);
				},
				onComplete: function(event, ui)
				{
					display(ui.element, 'complete', ui);
				},
				onError: function(event, ui)
				{
					display(ui.element, 'error', ui);
				}
			});

			
			$("#button_html4").scruploadHtml4({
				//html4_use_input: true,
				url: '/scrupload/sample/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "1MB",
				onInit: function(event, ui)
				{
					display(ui.element, 'init', ui);
				},
				onDialogClose: function(event, ui)
				{
					display(ui.element, 'onDialogClose', ui);
				},
				onSelect: function(event, ui)
				{
					display(ui.element, 'select', ui);
					if(count.html4 >= limit)
					{
						return false;
					}

					++count.html4;
				},
				onStartUpload: function(event, ui)
				{
					display(ui.element, 'start_upload', ui);
				},
				onFileStart: function(event, ui)
				{
					display(ui.element, 'file_start', ui);
				},
				onProgress: function(event, ui)
				{
					display(ui.element, 'progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					display(ui.element, 'file complete', ui);
				},
				onButtonOver: function(event, ui)
				{
					display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					display(ui.element, 'button out', ui);
				},
				onComplete: function(event, ui)
				{
					display(ui.element, 'complete', ui);
				},
				onError: function(event, ui)
				{
					display(ui.element, 'error', ui);
				}
			});



			$("#button_swfuplod").scruploadSwfupload({
				url: '/scrupload/sample/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "1MB",
				types: "jpg|gif|png|bmp",
				mutiple_select: true,
				swfupload: {
					cookie: ['PHPSESSID'],
					cookie_method: 'post',
					button_image_url: '/img/upload_splite.gif',
					button_width: 148,
					button_height: 60,
					flash_url: '/js/sdx/lib/swfupload/swfupload.swf'
				},
				onInit: function(event, ui)
				{
					display(ui.element, 'init', ui);
				},
				onDialogClose: function(event, ui)
				{
					display(ui.element, 'onDialogClose', ui);
				},
				onSelect: function(event, ui)
				{
					display(ui.element, 'select', ui);
					if(count.swf >= limit)
					{
						return false;
					}

					++count.swf;
				},
				onStartUpload: function(event, ui)
				{
					display(ui.element, 'start_upload', ui);
				},
				onFileStart: function(event, ui)
				{
					display(ui.element, 'file_start', ui);
				},
				onProgress: function(event, ui)
				{
					display(ui.element, 'progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					display(ui.element, 'file complete', ui);
				},
				onButtonOver: function(event, ui)
				{
					display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					display(ui.element, 'button out', ui);
				},
				onComplete: function(event, ui)
				{
					display(ui.element, 'complete', ui);
				},
				onError: function(event, ui)
				{
					display(ui.element, 'error', ui);
				}
			});







			$("#button_auto").scrupload({
				runtimes: 'html5|swfupload|html4',
				url: '/scrupload/sample/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "8MB",
				types: "jpg|gif|png|bmp",
				mutiple_select: true,
				swfupload: {
					button_image_url: '/img/upload_splite.gif',
					button_width: 148,
					button_height: 60,
					flash_url: '/js/sdx/lib/swfupload/swfupload.swf'
				},
				onInit: function(event, ui)
				{
					display(ui.element, 'init', ui);
				},
				onSelect: function(event, ui)
				{
					display(ui.element, 'select', ui);
				},
				onStartUpload: function(event, ui)
				{
					display(ui.element, 'start_upload', ui);
				},
				onFileStart: function(event, ui)
				{
					display(ui.element, 'file_start', ui);
				},
				onProgress: function(event, ui)
				{
					display(ui.element, 'progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					display(ui.element, 'file complete', ui);
				},
				onButtonOver: function(event, ui)
				{
					display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					display(ui.element, 'button out', ui);
				},
				onComplete: function(event, ui)
				{
					display(ui.element, 'complete', ui);
				},
				onError: function(event, ui)
				{
					display(ui.element, 'error', ui);
				}
			});
		});



		






		//////////////////////////////////////////////
		//Utility
		function display(elem, title, obj)
		{
			console.info(title, obj);
			/*var disp = elem.parent().find('.display');
			disp.append("<h2>"+title+"</h2>"+_toHtmlString(obj));
			$("#button_html4").scruploadHtml4('replace');
			$("#button_swfuplod").scruploadSwfupload('replace');*/
		}

		function _toHtmlString(obj)
		{
			var text = '<ul>';
			for(var key in obj)
			{
				if($.isPlainObject(obj[key]))
				{	
					text += _createRow(key, _toHtmlString(obj[key]));
				}
				else if($.isArray(obj[key]))
				{
					var array = '<ul>';
					for(var i=0; i<obj[key].length; i++)
					{
						array += '<li>['+i+"] : "+_toHtmlString(obj[key][i])+'</li>';
					}
					array += '</ul>';

					text += _createRow(key, array);
				}
				else if($.isFunction(obj[key]))
				{
					text += _createRow(key, 'function');
				}
				else if(obj[key] === null)
				{
					text += _createRow(key, 'NULL');
				}
				else if(typeof obj[key] == 'object' && obj[key].html && obj[key].remove && obj[key].find)
				{
					text += _createRow(key, obj[key].length+' jQuery element');
				}
				else
				{
					text += _createRow(key, obj[key]);
				}
			}

			text += "</ul>";

			return text;
		}

		function _createRow(key, value)
		{
			return "<li>"+key+" : "+value+"</li>";
		}

	</script>

</head>
<body>
<p>Scrupload demo.</p>

<div>
<h1>html5</h1>
<div id="button_html5"></div>
<a href="javascript:void(0)" onclick="$('#button_html5').scruploadHtml5('destroy')">destroy</a>
<div class="display"></div>
</div>

<div>
<h1>http</h1>
<div id="button_http"></div>
<a href="javascript:void(0)" onclick="$('#button_http').scruploadHttp('destroy')">destroy</a>
<div class="display"></div>
</div>

<div>
<h1>html4</h1>
<div id="button_html4"></div>
<a href="javascript:void(0)" onclick="$('#button_html4').scruploadHtml4('destroy')">destroy</a>
<div class="display"></div>
</div>

<div>
<h1>SWFUpload</h1>
<div id="button_swfuplod"></div>
<a href="javascript:void(0)" onclick="$('#button_swfuplod').scruploadSwfupload('destroy')">destroy</a>
<div class="display"></div>
</div>

<div>
<h1>Auto</h1>
<div id="button_auto"></div>
<a href="javascript:void(0)" onclick="$('#button_auto').scrupload('start', 'http')">http</a>
<a href="javascript:void(0)" onclick="$('#button_auto').scrupload('start', 'html4')">html4</a>
<a href="javascript:void(0)" onclick="$('#button_auto').scrupload('start', 'swfupload')">swfupload</a>
<a href="javascript:void(0)" onclick="$('#button_auto').scrupload('start', 'html5')">http5</a>
<a href="javascript:void(0)" onclick="$('#button_auto').scrupload('destroy')">destroy</a>
<div class="display"></div>
</div>

</body>
</html>
