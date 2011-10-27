<?php
class Scrupload_IllegalOperationException extends Exception
{
	
}

class Scrupload_UploadException extends Exception
{
	private $_type;
	
	public function __construct($type, $message = '')
	{
		parent::__construct($message);
		$this->_type = $type;
	}
	
	public function getType()
	{
		return $this->_type;
	}
}

class Scrupload_File
{
	const ERROR_SYSTEM = 'SYSTEM';
	const ERROR_SIZE = 'SIZE';
	const ERROR_TYPE = 'TYPE';
	
	public static $MIME_TYPE_EXTENSION = array(
		'image/jpeg' => 'jpg',
		'image/png' => 'png',
		'image/gif' => 'gif',
		'text/plain' => 'txt',
		'text/html' => 'html',
		'text/xml' => 'xml',
	);
	
	private $_dir;
	
	private $_values = array(
		'errors' => array()
	);
	
	private $_addvalues = array();
	
	private $_extension;
	
	private $_size;
	
	/**
	 * 
	 * @param string $dir �ۑ���f�B���N�g��
	 */
	public function __construct($dir)
	{
		$this->_dir = $dir;
	}
	
	public function save()
	{
		try 
		{
			$dir = $this->_dir;
			$this->_checkDir($dir);
			
			$post_name = $this->_getPostParam('post_name');
			
			//$_FILES�̃A�b�v���[�h
			if(isset($_FILES[$post_name]))
			{
				$file = $_FILES[$post_name];
				$this->_values['path'] = $this->_move($file, $dir);
				
				$this->_values['id'] = $this->_getPostParam('id');
				$this->_values['filename'] = $file['name'];
				$this->_size = $file['size'];
			}
			//HTTP�̃A�b�v���[�h
			else if($http = $this->_getPostParam($post_name))
			{
				$this->_values['path'] = $this->_save($http, $dir);
				
				$this->_values['id'] = $this->_getPostParam('id');
				$this->_values['filename'] = $this->_getPostParam('filename');
				$this->_size = filesize($this->_values['path']);
			}
			
			$this->_checkSize();
		}
		catch(Scrupload_UploadException $e)
		{
			$this->addError($e->getType(), $e->getMessage());
		}
		catch(Exception $e)
		{
			//�����͗��Ȃ�����
			$this->addError(self::ERROR_SYSTEM, $e->getMessage());
		}
	}
	
	private function _checkDir($dir)
	{
		if(!is_dir($dir))
		{
			if(is_readable($dir))
			{
				throw new Scrupload_UploadException(self::ERROR_SYSTEM, $dir.' is not directory');
			}
			
			$list = explode('/', $dir);
			$path = '';
			foreach($list as $d)
			{
				if(empty($d))
				{
					$path .= '/';
				}
				else
				{
					$path .= $d.'/';
				}
				
				if(!is_dir($path))
				{
					if(!mkdir($path))
					{
						throw new Scrupload_UploadException('Failed to make direcotry '.$path);
					}
					
					$this->_chmod($path, 0777);
				}
			}
			
		}
	}
	
	private function _checkSize()
	{
		$size = $this->_getPostParam('size_limit');
		if($size !== null)
		{
			if($this->_size > $size)
			{
				throw new Scrupload_UploadException(self::ERROR_SIZE);
			}
		}
	}
	
	private function _getPostParam($key)
	{
		return isset($_POST[$key]) ? $_POST[$key] : null;
	}
	
	private function _move($file, $dir)
	{
		if($file['error'] != UPLOAD_ERR_OK && $file['error'] != UPLOAD_ERR_NO_FILE)
		{
			switch ($file['error'])
			{
				case UPLOAD_ERR_INI_SIZE:
					throw new Scrupload_UploadException(self::ERROR_SIZE, 'PHP_INI_SIZE');
					break;
				case UPLOAD_ERR_FORM_SIZE:
					throw new Scrupload_UploadException(self::ERROR_SIZE, 'HTML_FORM_SIZE');
					break;
				default:
					throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'HTTP POST error '.$file['error']);
			}
		}
		
		//�g���q���t�@�C��������擾
		$ext = $this->_getExtFromFilename($file['name']);
		if(!$ext)
		{
			//�_����������mimetype
			$ext = $this->_getExtFromMime($file['tmp_name']);
		}
		$this->_extension = $ext;
		
		//�t�@�C�������擾
		$dest = $this->_generateFilename($dir, $ext);
		
		$res = @move_uploaded_file($file['tmp_name'], $dest);
		if(!$res)
		{
			throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'Failed to move upload file to '.$dest);
		}
		
		$this->_chmod($dest);
		
		return $dest;
	}
	
	private function _save($http, $dir)
	{
		$file = @file_get_contents($http);
		if(!$file)
		{
			throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'Failed to load url '.$http);
		}
		
		//�g���qmime_type���擾����̂ɁAhttp�A�N�Z�X���������Ȃ��̂ň�U�ۑ�
		$dest = $this->_generateFilename($dir, '');
		$res = file_put_contents($dest, $file);
		$file = null;
		
		if(!$res)
		{
			throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'Failed to save file to '.$dest);
		}
		
		//�g���q���t�@�C��������擾
		$ext = $this->_getExtFromFilename($this->_getPostParam('filename'));
		if(!$ext)
		{
			//�_����������mimetype
			$ext = $this->_getExtFromMime($dest);
		}
		
		$this->_extension = $ext;
		
		if($ext)
		{
			$new = $dest.'.'.$ext;
			$res = @rename($dest, $new);
			if(!$res)
			{
				throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'Failed to move tmp file to '.$new);
			}
			
			$dest = $new;
		}
		
		$this->_chmod($dest);
		
		return $dest;
	}
	
	private function _chmod($dest, $mode = 0666)
	{
		$res = @chmod($dest, $mode);
		if(!$res)
		{
			throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'Failed to change permission '.$dest);
		}
	}
	
	private function _getExtFromFilename($name)
	{
		$info = pathinfo($name);
		return isset($info['extension']) ? $info['extension'] : '';
	}
	
	private function _getExtFromMime($path)
	{
		$mime = mime_content_type($path);
		
		if(!$mime)
		{
			return '';
		}
		
		if(isset(self::$MIME_TYPE_EXTENSION[$mime]))
		{
			return self::$MIME_TYPE_EXTENSION[$mime];
		}
		
		return '';
	}
	
	private function _generateFilename($dir, $ext)
	{
		if(strrchr($dir, '/') != '/')
		{
			$dir .= '/';
		}
		
		//�e���|�����摜�t�@�C�����𐶐�����i�ő�5��܂Ŏ��s����j
		for($i = 0; $i < 5; ++$i)
		{
			$tmp_filename = $dir.$this->_generateRandomId();
			if($ext)
			{
				$tmp_filename .= '.'.$ext;
			}
			
			$fp = @fopen($web_dir . $tmp_filename, 'x');
			if ($fp)
			{
				//�쐬�ɐ��������ꍇ�͍��͎g���Ă��Ȃ��t�@�C�����Ȃ̂ŏ��������s�ł���
				fclose($fp);
				return $tmp_filename;
			}
		}
		
		throw new Scrupload_UploadException(self::ERROR_SYSTEM, 'Failed to generate filename');
	}
	
	private function _generateRandomId()
	{
		list($msec, $sec) = explode(' ', microtime());
		//�b + 0.��������}�C�N���b + ������16�i���\�L���ĘA��
		return sprintf('%08x%08x%08x', intval($sec), intval(substr($msec, 2)), mt_rand());
	}
	
	/**
	 * �ۑ���A�t�@�C���̃f�[�^��z��Ŏ擾�B���X�|���X�p�B
	 * @return array
	 */
	public function toArray()
	{
		return array_merge($this->_values, $this->_addvalues);
	}
	
	/**
	 * ���X�|���X�p�̒l���L�[���w�肵�ĒP�ƂŎ擾
	 * @return mixed
	 * @param string $name
	 * @param mixed $default
	 */
	public function get($name, $default = null)
	{
		if(isset($this->_addvalues[$name]))
		{
			return $this->_addvalues[$name];
		}
		
		if(isset($this->_values[$name]))
		{
			return $this->_values[$name];
		}
		
		return $default;
	}
	
	/**
	 * 
	 * @return bool
	 */
	public function hasError()
	{
		return !empty($this->_values['errors']);
	}
	
	/**
	 * 
	 * @return array()
	 */
	public function getErrors()
	{
		return $this->_values['errors'];
	}
	
	/**
	 * 
	 * ���X�|���X�p�ɃG���[��ǉ�
	 * 
	 * @param string $type
	 * @param string $message
	 */
	public function addError($type, $message = null)
	{
		$error = array('type' => strtoupper($type));
		
		if($message)
		{
			$error['message'] = $message;
		}
		
		$this->_values['errors'][] = $error;
	}
	
	/**
	 * 
	 * ���X�|���X�p�̒l��ǉ��B
	 * �������O����������㏑���܂�
	 * 
	 * @param unknown_type $name
	 * @param unknown_type $value
	 */
	public function set($name, $value)
	{
		$this->_addvalues[$name] = $value;
		return $this;
	}
}