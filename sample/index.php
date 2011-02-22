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
				button_image: '/img/upload.gif'
			});
		});
	</script>
</head>
<body>
<p>Scrupload demo.</p>
<div id="upload_button"></div>
</body>
</html>
