<?php
date_default_timezone_set('Asia/Tokyo');
function scrupload_log($message, $filename = 'scrupload.log')
{
	$hdl = fopen('log/'.$filename, 'a');
	flock($hdl, LOCK_EX);
	fwrite($hdl, '['.date('Y-m-d H:i:s').']'.PHP_EOL.var_export($message, true).PHP_EOL);
	fclose($hdl);
	chmod('log/'.$filename, 0666);
}

require_once '../php/Scrupload/File.php';

$file = new Scrupload_File('./tmp/test');
$file->save();

$file->set('GET', $_GET);
$file->set('POST', $_POST);

if(isset($_POST['error_trigger']))
{
	$file->addError(Scrupload_File::ERROR_SYSTEM, 'Some error has happend!');
	
	$e = new Scrupload_UploadException("IMAGE_SIZE", null, array('width' => 200, 'height' => 200));
	$file->addErrorFromException($e);
}


echo json_encode($file->toArray());