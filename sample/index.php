<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
	<title>Scrapload</title>
	<script type="text/javascript" src="/js/sdx/lib/jquery-1.4.4.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/jquery-ui-1.8.7.custom.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/scrupload/jquery.scrupload.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/scrupload/gears/jquery.ui.scruploadHtml4.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/scrupload/gears/jquery.ui.scruploadSWFUpload.js"></script>
	<script type="text/javascript">
		$(function(){
			$("#button_html4").scruploadHtml4({
				//html4_use_input: true,
				url: '/scrupload/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "8MB",
				types: "jpg|jpeg|gif|png|bmp",
				select_limit: 1,
				queue_limit: 3,
				onInit: function(event, ui)
				{
					console.info('init', ui)
				},
				onSelect: function(event, ui)
				{
					console.info('select',ui)
				},
				onStart: function(event, ui)
				{
					console.info('start', ui);
				},
				onProgress: function(event, ui)
				{
					console.info('progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					console.info('file complete', ui);
				},
				onComplete: function(event, ui)
				{
					console.info('complete', ui);
				},
				onError: function(event, ui)
				{
					console.info('error', ui);
				}
			});



			$("#button_swfuplod").scruploadSWFUpload({
				url: '/scrupload/upload.php',
				post_params: {hoge: 123},
				get_params:{huga: 456},
				size_limit: "8MB",
				types: "jpg|gif|png|bmp",
				select_limit: 1,
				queue_limit: 3,
				onInit: function(event, ui)
				{
					console.info('init', ui)
				},
				onSelect: function(event, ui)
				{
					console.info('select',ui)
				},
				onStart: function(event, ui)
				{
					console.info('start', ui);
				},
				onProgress: function(event, ui)
				{
					console.info('progress', ui);
				},
				onFileComplete: function(event, ui)
				{
					console.info('file complete', ui);
				},
				onComplete: function(event, ui)
				{
					console.info('complete', ui);
				}
			});
			
		});



	</script>
</head>
<body>
<p>Scrupload demo.</p>

<div>
<h1>html4</h1>
<div id="button_html4"><img src="/img/upload.gif" /></div>
<a href="javascript:void(0)" onclick="$('#button_html4').scruploadHtml4('destroy')">destroy</a>
</div>

<h1>SWFUpload</h1>
<div id="button_swfuplod"><img src="/img/upload.gif" /></div>
<a href="javascript:void(0)" onclick="$('#button_swfuplod').scruploadSWFUpload('destroy')">destroy</a>
</div>

</body>
</html>
