<?php
echo json_encode(array(
	'get' => $_GET,
	'post' => $_POST,
	'files' => $_FILES,
));