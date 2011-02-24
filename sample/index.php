<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
	<title>Scrapload</title>
	<script type="text/javascript" src="/js/sdx/lib/jquery-1.4.4.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/jquery-ui-1.8.7.custom.min.js"></script>
	<script type="text/javascript" src="/js/sdx/lib/scrupload/gears/jquery.ui.scruploadHtml4.js"></script>
	<script type="text/javascript">
		$(function(){
			$("#upload_button").scruploadHtml4({
				//html4_use_input: true,
				url: '/scrupload/upload.php'
			});
		});
	</script>
</head>
<body>
<p>Scrupload demo.</p>
<div id="upload_button"><img src="/img/upload.gif" /></div>
<a href="javascript:void(0)" onclick="$('#upload_button').scruploadHtml4('destroy')">destroy</a>

</body>
</html>
