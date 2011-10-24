(function($, g){

if(g.scrupload )
{
	return;
}
	
var scr = g.scrupload = g.scrupload||{},
	file_count = 0;
;

scr.SELECTED = 1;
scr.UPLOADING = 2;
scr.FAILED = 3;
scr.DONE = 4;

scr.ERROR_TYPE = 'TYPE';
scr.ERROR_SIZE = 'SIZE';
scr.ERROR_HTTP = 'HTTP';
//scr.ERROR_QUEUE_LIMIT = 12;

scr.uniqid = function(prefix)
{
	var uid = new Date().getTime().toString(32), i;

	for (i = 0; i < 5; i++) 
	{
		uid += Math.floor(Math.random() * 65535).toString(32);
	}

	return ('scrupload-'+ uid).toString(32);
};

scr.buildUrlQuery = function(url, params)
{
	var q = $.param(params);
	if(!q)
	{
		return url;
	}
	else
	{
		return q.indexOf("?") != -1 ? url+"&"+q : url+"?"+q;
	}
};

scr.generateElementId = function(element)
{
	var id = element.attr('id');
	if(id)
	{
		return id;
	}
	
	while(true)
	{
		id = this.uniqid();
		if($('#'+id).length === 0)
		{
			element.attr("id", id);
			return id;
		}
	}
};

/**
 * optionsの中で強制的にpostするもの
 * @param options
 * @returns
 */
scr.buildDefaultOptions = function(options){
	
	if(options.types)
	{
		options.post_params.types = options.types;
	}
	
	
	if(options.size_limit)
	{
		options.post_params.size_limit = options.size_limit;
	}
	
	//size_limitをバイトにする
	if(options.size_limit)
	{
		var limit = options.size_limit;
		var result;
		if(result = limit.match(/^([0-9]+)MB$/i))
		{
			options.size_limit = result[1] * 1024 * 1024;
		}
		else if(result = limit.match(/^([0-9]+)KB$/i))
		{
			options.size_limit = result[1] * 1024;
		}
		else if(result = limit.match(/^([0-9]+)B?$/i))
		{
			options.size_limit = result[1];
		}
		else
		{
			throw options.size_limit+' is illegal size_limit value.';
		}
	}
};

/**
 * 拡張子をチェックする
 * @param widget
 * @param file
 */
scr.checkTypes = function(widget, file)
{
	if(file.upload !== false && widget.options.types)
	{
		var list = widget.options.types.split("|"), i;
		if($.inArray(file.type, list) == -1)
		{
			file.upload = false;
			file.status = scrupload.FAILED;
			widget._trigger('onError', null, {
				element: widget.element,
				file: file,
				error: scrupload.ERROR_TYPE,
				runtime: widget.runtime,
				options: widget.options
			});
		}
	}
};

/**
 * サイズをチェック
 * @param widget
 * @param file
 */
scr.checkSize = function(widget, file)
{
	if(file.upload !== false && widget.options.size_limit && file.size)
	{
		if(file.size > widget.options.size_limit)
		{
			file.upload = false;
			file.status = scrupload.FAILED;
			widget._trigger('onError', null, {
				element: widget.element,
				file: file,
				error: scrupload.ERROR_SIZE,
				runtime: widget.runtime,
				options: widget.options
			});
		}
	}
};

scr.defaultOptions = function(options)
{	
	return $.extend({}, {
		file_post_name: 'file',
		post_params: {},
		get_params: {},
		interval: 0
	}, options||{});
};

scr.initButtonEvent = function(widget, element){
	var mouseover = false;
	element.mouseout(function(){
		if(mouseover)
		{
			widget._trigger('onButtonOut', null, {
				element: widget.element,
				runtime: widget.runtime,
				options: widget.options
			});
			mouseover = false;
		}
	}).mouseover(function(){
		if(!mouseover)
		{
			widget._trigger('onButtonOver', null, {
				element: widget.element,
				runtime: widget.runtime,
				options: widget.options
			});
			mouseover = true;
		}
	}).mousedown(function(){
		widget._trigger('onButtonDown', null, {
			element: widget.element,
			runtime: widget.runtime,
			options: widget.options
		});
	});
};

scr.createFile = function(file, options){
	
	return {
		id : (options.file_id_prefix||'scrfile-'+(++file_count)),
		time: new Date(),
		filename: file.name||file.fileName,
		size: file.size,
		type: scr.detectFileType(file),
		status: this.SELECTED,
		user: {},
		get: $.extend({}, options.get_params),
		post: $.extend({}, options.post_params)
	};
};

scr.detectFileType = function(file)
{
	var type;
	if(file.type)
	{
		if(file.type.indexOf('/') == -1)
		{
			type = file.type.substr(1);
		}
	}

	if(!type)
	{
		var name = file.name||file.fileName;
		type = name.substr(name.lastIndexOf('.') + 1);
	}
	
	
	
	return type.toLowerCase();
};

scr.onSelect = function(widget, file)
{
	if(file.upload !== false)
	{
		var ret = widget._trigger('onSelect', null, {
			element: widget.element,
			runtime: widget.runtime,
			file: file,
			options: widget.options
		});
		
		if(ret === false)
		{
			file.upload = false;
		}
	}
};

scr.submitIframForm = function(form, filename, widget, func){
	var self = widget,
		file
		;
	
	file = scrupload.createFile({name: filename}, self.options);
	
	(func||$.noop)(file);
	
	//file typeのチェック
	if(filename != 'n/a')
	{
		scrupload.checkTypes(self, file);
	}
	
	//size check
	//html4/httpはサイズのチェックは出来ません
	
	scrupload.onSelect(self, file);
	
	self._trigger('onStart', null, {
		element: self.element,
		runtime: self.runtime,
		files: file.upload !==  false ? [file] : [],
		options: self.options
	});
	
	if(file.upload !== false)
	{
		self._trigger('onFileStart', null, {
			element: self.element,
			runtime: self.runtime,
			file: file,
			options: self.options
		});
		
		form.submit(function(){
			//post params
			file.post.id = file.id;
			$.each(file.post, function(key){
				form.append('<input type="hidden" name="'+key+'" value="'+this+'" />');
			});
			
			//get params
			var url = form.attr("action");
			url = scrupload.buildUrlQuery(url, file.get);
			form.attr('action', url);
			
			file.status = scrupload.UPLOADING;
			self._trigger('onProgress', null, {
				element: self.element,
				runtime: self.runtime,
				file: file,
				progress: {percent: 0},
				options: self.options
			});
		});
		
		//upload
		form.attr('target', file.id);
		form.find('input[name=id]').val(file.id);
		$('<iframe src="about:blank" name="' + file.id + '">')
			.appendTo(document.body)
			.css({width: '1px', height: '1px', position: 'absolute', left: '-10000px', top: '-10000px'})
			.load(function(){
				var iframe = $(this),
					resp = $(this.contentWindow.document.body).text()
					;
				
				if (resp)
				{
					self._trigger('onProgress', null, {
						element: self.element,
						file: file,
						runtime: self.runtime,
						progress: {percent: 100},
						options: self.options
					});
					
					file.status = scrupload.DONE;
					self._trigger('onFileComplete', null, {
						element: self.element,
						file: file,
						runtime: self.runtime,
						response: resp,
						options: self.options
					});
					
					//html4は一個しかアップロードできないので同義
					self._trigger('onComplete', null, {
						element: self.element,
						uploaded: [file],
						runtime: self.runtime,
						options: self.options
					});
				}
				
				setTimeout(function(){
					iframe.remove();
					form.remove();
					self._resetInterface();
					self.element.removeClass("scr_uploading");
				}, 0);
			});
		
		form.submit();
	}
	else
	{
		form.remove();
		self._resetInterface();
		self.element.removeClass("scr_uploading");
		
		self._trigger('onComplete', null, {
			element: self.element,
			uploaded: [file],
			runtime: self.runtime,
			options: self.options
		});
	}
};

scr.disableInterface = function(element, options){
	
	cover = element.data('disable-cover');
	
	if(!cover)
	{
		cover = $("<div></div>")
			.appendTo(element)
			.css('position', 'absolute')
			.css('top', 0)
			.css('left', 0)
			.css('z-index', 10000)
			//.css('background-color', '#000')
			.offset(element.offset())
			.width(element.width())
			.height(element.height());
		element.data('disable-cover', cover);
	}
	
	
	cover.show();
};

scr.enableInterface = function(element, options){
	
	cover = element.data('disable-cover');
	if(cover)
	{
		cover.hide();
	}
};


})(jQuery, (function(){ return this; })());
(function($){
var filename_regex = new RegExp("([^/]+)$");
$.widget('ui.scruploadHttp', {
	options: scrupload.defaultOptions({
		button_value: 'OK'
	}),
	_create: function()
	{
		var self = this;
		
		self.element.addClass("scr_http_container");
		
		self.queue_array = [];
		scrupload.buildDefaultOptions(self.options);
		
		self._initInterface();
		self.runtime = {name: 'http', object: self.input};
		self._trigger('onInit', null, {
			element: self.element,
			runtime: self.runtime,
			options: self.options
		});
	},
	_initInterface: function()
	{
		var self = this,
			button;

		self.container = $('<span></span>').appendTo(self.element);
		self.input = $('<input type="text">').appendTo(self.container);
		button = $('<input type="submit" value="'+self.options.button_value+'">')
			.appendTo(self.container);
		
		scrupload.initButtonEvent(self, self.container);
		
		button.click(function(){
			var form = $('<form action="'+self.options.url+'" method="post" />'),
			filename = 'n/a',
			button = $(this),
			value = self.input.val()
			;
		
			self.element.addClass("scr_uploading");
			
			self.input.attr('name', self.options.file_post_name);
			
			form
				.appendTo(self.element)
				.append(self.container);
			
			if(filename_regex.exec(value))
			{
				filename = RegExp.$1;
			}
			
			scrupload.submitIframForm(form, filename, self, function(file){
				
				file.http = {uri: value};
				
				if(file.upload !== false && !value.match(/^https?:\/\//))
				{
					file.upload = false;
					file.status = scrupload.FAILED;
					self._trigger('onError', null, {
						element: self.element,
						file: file,
						error: scrupload.ERROR_HTTP,
						runtime: self.runtime,
						options: self.options
					});
				}
			});
			
			return false;
		});
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.element.removeClass("scr_http_container");
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
(function($){
$.widget('ui.scruploadHtml4', {
	options: scrupload.defaultOptions({
	}),
	_create: function()
	{
		var self = this;
		
		self.element.addClass("scr_html4_container");
		
		self.queue_array = [];
		scrupload.buildDefaultOptions(self.options);
		
		self._initInterface();
		self.runtime = {name: 'html4', object: self.input};
		self._trigger('onInit', null, {
			element: self.element,
			runtime: self.runtime,
			options: self.options
		});
	},
	_initInterface: function()
	{
		var self = this;
		self._createFormAndInput();
	},
	_createFormAndInput: function()
	{
		var self = this;
		
		self.input = $('<input type="file" />');
		self.container = $("<span />");
		self.input.appendTo(self.container.appendTo(self.element));
		scrupload.initButtonEvent(self, self.container);
		
		self.input.change(function(){
			
			var form = $('<form action="'+self.options.url+'" method="post" enctype="multipart/form-data" />'),
				filename = 'n/a',
				result,
				input = $(this)
				;
			
			self.element.addClass("scr_uploading");
			
			input.attr('name', self.options.file_post_name);
			
			form
				.appendTo(self.element)
				.append(self.container);
			
			//ブラウザによって得られる値が変わるので可能ならファイル名のみにする
			
			if(this.value)
			{
				filename = this.value;
				result = filename.match(/[\/\\]([^\/\\]+)$/i);
				if (result)
				{
					filename = result[1];
				}	
			}
			
			scrupload.submitIframForm(form, filename, self);
		});
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.element.removeClass("scr_html4_container");
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
(function($){
$.widget('ui.scruploadHtml5', {
	options: scrupload.defaultOptions({
		mutiple_select: true
	}),
	_create: function()
	{	
		var self = this;
		
		self.element.addClass("scr_html5_container");
		
		self.queue_array = [];
		scrupload.buildDefaultOptions(self.options);
		
		self._initInterface();
		self.runtime = {name: 'html5', object: self.input};
		self._trigger('onInit', null, {
			element: self.element,
			runtime: self.runtime,
			options: self.options
		});
	},
	_initInterface: function()
	{
		var self = this;
		self._createFormAndInput();		
	},
	_createFormAndInput: function()
	{
		var self = this,input_name;
		
		input_name = self.options.file_post_name;
		if(self.options.mutiple_select)
		{
			self.input = $('<input type="file" name="'+input_name+'" multiple />');
		}
		else
		{
			self.input = $('<input type="file" name="'+input_name+'" />');
		}
		
		
		self.container = $("<span />");
		self.input.appendTo(self.container.appendTo(self.element));
		scrupload.initButtonEvent(self, self.container);
		
		self.input.change(function(){
			var url,
				form,
				filename = 'n/a',
				result,
				input = $(this),
				uploaded = [],
				file,
				next
				;
			
			self.input.attr('disabled', 'disabled');
			
			self.element.addClass("scr_uploading");
			
			form = $('<form method="post" enctype="multipart/form-data" />');
			form
				.appendTo(self.element)
				.append(self.container);
			
			
			for(var i=0; i<this.files.length; i++)
			{
				file = scrupload.createFile(this.files[i], self.options);
				
				
				//postデータの作成
				fd = new FormData();
				fd.append(input_name, this.files[i]);
				fd.append('id', file.id);
				for(var key in file.post)
				{
					fd.append(key, file.post[key]);
				}
				
				//GET作成
				url = scrupload.buildUrlQuery(self.options.url, file.get);
				form.attr("action", url);
				
				file.html5 = {
					formData: fd,
					uri: url
				};
				
				//type check
				scrupload.checkTypes(self, file);
				
				//size check
				scrupload.checkSize(self, file);
				
				scrupload.onSelect(self, file);
				
				if(file.upload !== false)
				{
					self.queue_array.push(file);
				}
			}
			
			self._trigger('onStart', null, {
				element: self.element,
				runtime: self.runtime,
				files: self.queue_array,
				options: self.options
			});
			
			next = self.queue_array.shift();
			if(next)
			{
				self._onFileStart(next);
				self._upload(next, uploaded);
			}
			else
			{
				self._onComplete(uploaded);
			}
		});
	},
	_upload: function(file, uploaded)
	{
		var xhr = new XMLHttpRequest();
		
		this._setAjaxEventListener(xhr, file, uploaded);
		
		xhr.open("POST", file.html5.uri);
		xhr.send(file.html5.formData);
	},
	_onFileStart: function(file)
	{
		this._trigger('onFileStart', null, {
			element: this.element,
			runtime: this.runtime,
			file: file,
			options: this.options
		});
	},
	_setAjaxEventListener: function(xhr, file, uploaded)
	{
		var self = this;
		xhr.upload.addEventListener("progress", function(event){
			file.status = scrupload.UPLOADING;
			if (event.lengthComputable) {
				var percent = Math.round(event.loaded * 100 / event.total);
				self._trigger('onProgress', null, {
					element: self.element,
					runtime: self.runtime,
					file: file,
					options: self.options,
					progress: {
						percent: percent,
						bytes_loaded: event.loaded,
						bytes_total: event.total
					}
				});
			}
		}, false);
		xhr.addEventListener("load", function(event){
			var next;
			
			file.status = scrupload.DONE;
			self._trigger('onFileComplete', null, {
				element: self.element,
				runtime: self.runtime,
				file: file,
				response: event.target.responseText,
				options: self.options
			});
			
			uploaded.push(file);
			
			if(self.queue_array.length == 0)
			{
				self._onComplete(uploaded);
			}
			else
			{
				next = self.queue_array.shift();
				self._onFileStart(next);
				setTimeout(function(){
					self._upload(next, uploaded);
				}, self.options.interval);
			}
		}, false);
	},
	_onComplete: function(uploaded)
	{
		this._trigger('onComplete', null, {
			element: this.element,
			runtime: this.runtime,
			uploaded: uploaded,
			options: this.options
		});
		
		this._resetInterface();
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.element.removeClass("scr_html5_container");
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
(function($){
if(window.SWFUpload)
{
	$.widget('ui.scruploadSwfupload', {
		options: scrupload.defaultOptions({
			swfupload: {
				prevent_swf_caching : false,
				button_cursor : SWFUpload.CURSOR.HAND
			},
			mutiple_select: true
		}),
		_create: function()
		{
			var self = this;	
			
			self.queue_array = [];
			scrupload.buildDefaultOptions(self.options);
			
			self._initInterface();
		},/*
		_loadCookie: function()
		{
			var tmp_cookie,tmp_keyval,i;
			
			this._cookie = {};
			
			tmp_cookie = document.cookie.split('; ');
			for(i=0; i<tmp_cookie.length; i++)
			{
				tmp_keyval = tmp_cookie[i].split('=');
				this._cookie[tmp_keyval[0]] = unescape(tmp_keyval[1]);
			}
		},*/
		_initInterface: function()
		{
			var self = this,
				files = {},
				uploaded = [],
				setting,
				cookie_post = {},
				cookie_get = {},
				i,
				current_file,
				selected
			;
			
			self.swf_container = $("<div><div></div></div>").appendTo(self.element);
			self.swf_container.width(self.options.swfupload.button_width);
			self.swf_container.height(self.options.swfupload.button_height);
			
			//cookie
			if(self.options.swfupload.cookie)
			{
				if(!$.cookie)
				{
					throw 'It is require "jquery.cookie.js" to use cookie option.';
				}
				
				if((self.options.swfupload.cookie_method||'get').toLowerCase() == 'get')
				{
					for(i=0; i<self.options.swfupload.cookie.length; i++)
					{
						cookie_get[self.options.swfupload.cookie[i]] = $.cookie(self.options.swfupload.cookie[i]);
					}
				}
				else
				{
					for(i=0; i<self.options.swfupload.cookie.length; i++)
					{
						cookie_post[self.options.swfupload.cookie[i]] = $.cookie(self.options.swfupload.cookie[i]);
					}
				}
				
				delete self.options.swfupload.cookie;
				delete self.options.swfupload.cookie_method;
			}
			
			self.swfuploader = null;
			setting = $.extend(self.options.swfupload, {
				//file_upload_limit: self.options.upload_limit||0,
				file_post_name: self.options.file_post_name,
				upload_url: self.options.url,
				file_size_limit: self.options.size_limit,
				button_placeholder_id: scrupload.generateElementId(self.swf_container.find("div")),
				preserve_relative_urls: true,
				button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,
				swfupload_loaded_handler: function(){
					self.runtime = {name: "swfupload", object:self.swfuploader};
					self._trigger('onInit', null, {
						element: self.element,
						runtime: self.runtime,
						options: self.options
					});
				},
				file_dialog_start_handler: function(a1, a2, a3){
					selected = false;
				},
				file_queued_handler: function(swf_file){
					var file = scrupload.createFile(swf_file, self.options);
					
					selected = true;
					file.swfupload = {file: swf_file};
					
					//type check
					scrupload.checkTypes(self, file);
					
					//size check
					scrupload.checkSize(self, file);
					
					scrupload.onSelect(self, file);
					
					if(file.upload !== false)
					{
						self.queue_array.push(file);
						files[swf_file.id] = file;
					}
					else
					{
						this.cancelUpload(swf_file.id);
					}
					
					return file.upload;
				},
				file_dialog_complete_handler: function(num_selected, num_queued){
					
					self._trigger('onStart', null, {
						element: self.element,
						runtime: self.runtime,
						files: self.queue_array,
						options: self.options
					});
					
					if(self.queue_array.length > 0)
					{
						scrupload.disableInterface(self.element, self.options);
						
						this.startUpload();
					}
					else if(selected)
					{
						self._onComplete(uploaded);
					}
				},
				upload_start_handler: function(swf_file){
					var file = files[swf_file.id],
						url,
						swfuploader = this
					;
					
					//interval
					if(uploaded.length > 0)
					{
						
						if(current_file != file)
						{
							this.stopUpload();
							
							current_file = file;
							self._onFileStart(file, cookie_post, cookie_get);
							
							setTimeout(function(){
								self.swfuploader.startUpload();
							}, self.options.interval);
						}
					}
					else
					{
						current_file = file;
						self._onFileStart(file, cookie_post, cookie_get);
						self.swfuploader.startUpload();
					}
				},
				upload_progress_handler: function(swf_file, bytes_loaded, bytes_total){
					var file = files[swf_file.id],
						percent = Math.ceil((bytes_loaded / bytes_total) * 100)
						;
						
					file.status = scrupload.UPLOADING;
					
					self._trigger('onProgress', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						options: self.options,
						progress: {
							percent: percent,
							bytes_loaded: bytes_loaded,
							bytes_total: bytes_total
						}
					});
				},
				upload_success_handler: function(swf_file, resp){
					var file = files[swf_file.id];
					file.status = scrupload.DONE;
					uploaded.push(file);
					self._trigger('onFileComplete', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						response: resp,
						options: self.options
					});
				},
				queue_complete_handler: function(num_uploaded){
					self._onComplete(uploaded);
					
					scrupload.enableInterface(self.element, self.options);
					uploaded = [];
					files = {};
					current_file = null;
				}/*,
				file_queue_error_handler:function(file, code, message){
					self._trigger('onError', null, {
						element: self.element,
						file: null,
						error: scrupload.ERROR_QUEUE_LIMIT,
						runtime: self.runtime,
						options: self.options
					});
					
				}*/
			});
			
			if(!self.options.mutiple_select)
			{
				setting.button_action = SWFUpload.BUTTON_ACTION.SELECT_FILE;
			}
			
			scrupload.initButtonEvent(self, self.swf_container);
			
			self.swfuploader = new SWFUpload(setting);
		},
		_onComplete: function(uploaded)
		{
			this._trigger('onComplete', null, {
				element: this.element,
				runtime: this.runtime,
				uploaded: uploaded,
				options: this.options
			});
		},
		_onFileStart: function(file, cookie_post, cookie_get)
		{
			//queueの管理はswfがやっているので特に意味はないが、他と挙動を合わせるため
			this.queue_array.shift();
			
			//post
			file.post.id = file.id;
			
			this.swfuploader.setPostParams($.extend(cookie_post, file.post));
			
			//get
			url = scrupload.buildUrlQuery(this.options.url, $.extend(cookie_get, file.get));
			this.swfuploader.setUploadURL(url);

			this._trigger('onFileStart', null, {
				element: this.element,
				runtime: this.runtime,
				file: file,
				options: this.options
			});
		},
		getRuntime: function()
		{
			return this.swfuploader;
		},
		destroy: function()
		{
			
			this.swfuploader.destroy();
			this.swf_container.remove();
			this.queue_array = [];
			
			$.Widget.prototype.destroy.apply(this, arguments);
			return this;
		}
	});
}

})(jQuery);
(function($){

$.widget('ui.scrupload', {
	options: {
		runtimes:'swfupload|http|html4'
	},
	_create: function()
	{
		this.isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
		this.isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
		this.isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;
		
		var self = this,
			runtimes,
			list = self.options.runtimes.split("|"),
			target,
			i,
			check_html5
		;
		
		check_html5 = $('<input type="file" />').appendTo("body").hide();
		runtimes = {
			html5: !!check_html5[0].files,
			swfupload: self.detectFlashVer(8, 0, 0) && window.SWFUpload,
			http: true,
			html4: true
		};
		check_html5.remove();
		
		list.push("html4");
		for(i=0; i<list.length; i++)
		{
			if(runtimes[list[i]] && self.start(list[i]))
			{
				break;
			}
		}
	},
	start: function(runtime)
	{
		var target = this._getRuntimeName(runtime);
		if(this.current_runtime != runtime && this.element[target])
		{
			if(this.current_runtime)
			{
				this.element[this._getRuntimeName(this.current_runtime)]("destroy");
			}
			
			this.element[target](this.options);
			this.current_runtime = runtime;
			return true;
		}
		
		return false;
	},
	_getRuntimeName: function(runtime)
	{
		return "scrupload"+runtime.substr(0, 1).toUpperCase()+runtime.substr(1);
	},
	detectFlashVer: function(reqMajorVer, reqMinorVer, reqRevision)
	{
		var	versionStr = this._getFlashVesion(),
			versionMajor,
			versionMinor,
			versionRevision
			;
		
		
		if (versionStr == -1 )
		{
			return false;
		}
		else if (versionStr != 0)
		{
			if(this.isIE && this.isWin && !this.isOpera)
			{
				// Given "WIN 2,0,0,11"
				tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
				tempString        = tempArray[1];			// "2,0,0,11"
				versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
			}
			else
			{
				versionArray      = versionStr.split(".");
			}
			
			versionMajor      = versionArray[0];
			versionMinor      = versionArray[1];
			versionRevision   = versionArray[2];

	        // is the major.revision >= requested major.revision AND the minor version >= requested minor
			if (versionMajor > parseFloat(reqMajorVer))
			{
				return true;
			}
			else if (versionMajor == parseFloat(reqMajorVer))
			{
				if (versionMinor > parseFloat(reqMinorVer))
				{
					return true;
				}	
				else if (versionMinor == parseFloat(reqMinorVer))
				{
					if (versionRevision >= parseFloat(reqRevision))
					{
						return true;
					}
				}
			}
			return false;
		}
	},
	_getFlashVesion: function()
	{
		// NS/Opera version >= 3 check for Flash plugin in plugin array
		var flashVer = -1,
			swVer2,
			flashDescription,
			descArray,
			tempArrayMajor,	
			versionMajor,
			versionMinor,
			versionRevision
		;
		
		if (navigator.plugins != null && navigator.plugins.length > 0)
		{
			if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"])
			{
				swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
				flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
				descArray = flashDescription.split(" ");
				tempArrayMajor = descArray[2].split(".");			
				versionMajor = tempArrayMajor[0];
				versionMinor = tempArrayMajor[1];
				versionRevision = descArray[3];
				if (versionRevision == "")
				{
					versionRevision = descArray[4];
				}
				if (versionRevision[0] == "d") {
					versionRevision = versionRevision.substring(1);
				} else if (versionRevision[0] == "r") {
					versionRevision = versionRevision.substring(1);
					if (versionRevision.indexOf("d") > 0) {
						versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
					}
				}
				
				flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
			}
		}
		// MSN/WebTV 2.6 supports Flash 4
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
		// WebTV 2.5 supports Flash 3
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
		// older WebTV supports Flash 2
		else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
		else if ( this.isIE && this.isWin && !this.isOpera )
		{
			flashVer = this._getFlashVersionForIE();
		}	
		return flashVer;
	},
	_getFlashVersionForIE: function()
	{
		var version,
			axo,
			e;

		// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry

		try {
			// version will be set for 7.X or greater players
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			version = axo.GetVariable("$version");
		} catch (e) {
		}

		if (!version)
		{
			try {
				// version will be set for 6.X players only
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
				
				// installed player is some revision of 6.0
				// GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
				// so we have to be careful. 
				
				// default to the first public version
				version = "WIN 6,0,21,0";

				// throws if AllowScripAccess does not exist (introduced in 6.0r47)		
				axo.AllowScriptAccess = "always";

				// safe to call for 6.0r47 or greater
				version = axo.GetVariable("$version");

			} catch (e) {
			}
		}

		if (!version)
		{
			try {
				// version will be set for 4.X or 5.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = axo.GetVariable("$version");
			} catch (e) {
			}
		}

		if (!version)
		{
			try {
				// version will be set for 3.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = "WIN 3,0,18,0";
			} catch (e) {
			}
		}

		if (!version)
		{
			try {
				// version will be set for 2.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				version = "WIN 2,0,0,11";
			} catch (e) {
				version = -1;
			}
		}
		
		return version;
	},
	destroy: function()
	{
		this.element[this._getRuntimeName(this.current_runtime)]("destroy");
		this.current_runtime = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);