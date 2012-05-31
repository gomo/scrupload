<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
	<title>Scrapload</title>
	<script type="text/javascript" src="/js/sdx/lib/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/jquery.cookie.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/jquery-ui-1.8.7.custom.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/swfupload/swfupload.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/swfupload/plugins/swfupload.queue.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/scrupload/jquery.ui.scrupload.all.js"></script>
	<script type="text/javascript"><!--
		$(function(){
			$("#button_html5").scruploadHtml5({
				url: '/scrupload/sample/upload.php',
				post_params: {error_trigger: 1},
				get_params:{huga: 456},
				size_limit: "100MB",
				types: "jpg|jpeg|gif|png|bmp",
				onInit: function(event, ui)
				{
					display(ui.element, 'init', ui);
				},
				onSelect: function(event, ui)
				{
					display(ui.element, 'select', ui);
				},
				onFileStart: function(event, ui)
				{
					display(ui.element, 'filestart', ui);
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
					//display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					//display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					//display(ui.element, 'button out', ui);
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
				url: '/scrupload/sample/upload.php',
				post_params: {error_trigger: 1},
				get_params:{huga: 456},
				size_limit: "100MB",
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
					//display(ui.element, 'button over', ui);
				},
				onButtonDown: function(event, ui)
				{
					//display(ui.element, 'button down', ui);
				},
				onButtonOut: function(event, ui)
				{
					//display(ui.element, 'button out', ui);
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
	});
	--></script>

</head>
<body>
<p>Scrupload demo.</p>

<div>
<h1>html5</h1>
<div id="button_html5"></div>
<a href="javascript:void(0);" onclick="$('#button_html5').scruploadHtml5('destroy')">destroy</a>
<div class="display"></div>
</div>


<div>
<h1>html4</h1>
<div id="button_html4"></div>
<a href="javascript:void(0);" onclick="$('#button_html4').scruploadHtml4('destroy')">destroy</a>
<div class="display"></div>
</div>

<div style="height: 3000px">
&nbsp;
</div>

</body>
</html>
