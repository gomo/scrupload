(function($, g){

if(g.scrupload )
{
	return;
}
	
var scr = g.scrupload = g.scrupload||{},
	uid_count = 0;
;

scr.SELECTED = 1;
scr.UPLOADING = 2;
scr.FAILED = 3;
scr.DONE = 4;

scr.ERROR_TYPE = 10;
scr.ERROR_SIZE_LIMIT = 11;
scr.ERROR_QUEUE_LIMIT = 12;

scr.uniqid = function(prefix)
{
	var uid = new Date().getTime().toString(32), i;

	for (i = 0; i < 5; i++) 
	{
		uid += Math.floor(Math.random() * 65535).toString(32);
	}

	return (prefix || 's') + uid + (uid_count++).toString(32);
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
scr.buildDefaultPostParams = function(options){
	
	if(options.types)
	{
		options.post_params.types = options.types;
	}
	
	
	if(options.size_limit)
	{
		options.post_params.size_limit = options.size_limit;
	}
};

/**
 * 拡張子をチェックする
 * @param types
 * @param filename
 * @returns {Boolean}
 */
scr.checkTypes = function(types, filename){
	
	var list = types.split("|"), i;
	for(i=0; i<list.length; i++)
	{
		if(filename.toLowerCase().lastIndexOf(list[i].toLowerCase()) == filename.length - list[i].length)
		{
			return true;
		}
	}
	
	return false;
};

scr.defaultOptions = function(options){
	return $.extend({}, {
		file_post_name: 'file',
		post_params: {},
		get_params: {}
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

scr.createFile = function(filename, options){
	
	return {
		id : this.uniqid(options.file_id_prefix),
		time: new Date(),
		filename: filename,
		status: this.SELECTED,
		user: {},
		get: $.extend({}, options.get_params),
		post: $.extend({}, options.post_params)
	};
};

scr.submitIframForm = function(form, filename, widget){
	var self = widget,
		file,
		retOnSelect;
	
	file = scrupload.createFile(filename, self.options);
	
	//file typeのチェック
	if(self.options.types && filename != 'n/a')
	{
		if(!scrupload.checkTypes(self.options.types, filename))
		{
			file.status = scrupload.FAILED;
			self._trigger('onError', null, {
				element: self.element,
				file: file,
				error: scrupload.ERROR_TYPE,
				runtime: self.runtime,
				options: self.options
			});
			self._resetInterface();
			
			return;
		}
	}
	
	/*//queue_limitのチェック
	if(self.options.queue_limit && self.queue_array.length == self.options.queue_limit)
	{
		file.status = scrupload.FAILED;
		self._trigger('onError', null, {
			element: self.element,
			file: file,
			error: scrupload.ERROR_QUEUE_LIMIT,
			runtime: self.runtime,
			options: self.options
		});
		self._resetInterface();
		
		return;
	}*/
	
	retOnSelect = self._trigger('onSelect', null, {
		element: self.element,
		runtime: self.runtime,
		file: file,
		options: self.options
	});
	
	if(retOnSelect !== false)
	{
		self.queue_array.push(file);
		
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
						files: self.queue_array,
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
			files: self.queue_array,
			options: self.options
		});
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
		scrupload.buildDefaultPostParams(self.options);
		
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
			button = $(this)
			;
		
			self.element.addClass("scr_uploading");
			
			self.input.attr('name', self.options.file_post_name);
			
			form
				.appendTo(self.element)
				.append(self.container);
			
			if(filename_regex.exec(self.input.val()))
			{
				filename = RegExp.$1;
			}
			
			scrupload.submitIframForm(form, filename, self);
			
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
		scrupload.buildDefaultPostParams(self.options);
		
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
		scrupload.buildDefaultPostParams(self.options);
		
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
			/*//queue_limitのチェック
			if(self.options.queue_limit && this.files.length > self.options.queue_limit)
			{
				self._trigger('onError', null, {
					element: self.element,
					file: null,
					error: scrupload.ERROR_QUEUE_LIMIT,
					runtime: self.runtime,
					options: self.options
				});
				self._resetInterface();
				
				return;
			}*/
			
			var url,
				form,
				filename = 'n/a',
				result,
				input = $(this),
				fd,
				xhr,
				check_interval,
				selected_count = this.files.length,
				uploaded = [],
				file,
				retOnSelect
				;
			
			self.element.addClass("scr_uploading");
			
			form = $('<form method="post" enctype="multipart/form-data" />');
			form
				.appendTo(self.element)
				.append(self.container);
			
			
			for(var i=0; i<this.files.length; i++)
			{
				file = scrupload.createFile(this.files[i].fileName, self.options);
				self.queue_array.push(file);
				
				//postデータの作成
				fd = new FormData();
				fd.append(input_name, this.files[i]);
				
				for(var key in file.post)
				{
					fd.append(key, file.post[key]);
				}
				
				//GET作成
				url = scrupload.buildUrlQuery(self.options.url, file.get);
				form.attr("action", url);
				
				retOnSelect = self._trigger('onSelect', null, {
					element: self.element,
					runtime: self.runtime,
					file: file,
					options: self.options
				});
				
				if(retOnSelect !== false)
				{
					xhr = new XMLHttpRequest();
					
					self._setAjaxEventListener(xhr, file, uploaded);
					
					xhr.open("POST", url);
					xhr.send(fd);
				}
				else
				{
					--selected_count;
				}
			}
			
			self._resetInterface();
			
			check_interval = setInterval(function(){
				if(selected_count == uploaded.length)
				{
					clearInterval(check_interval);
					self._trigger('onComplete', null, {
						element: self.element,
						runtime: self.runtime,
						uploaded: uploaded,
						files: self.queue_array,
						options: self.options
					});
					
					input.val("");
					uploaded = [];
				}
			}, 80);
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
					progress: {
						percent: percent,
						bytes_loaded: event.loaded,
						bytes_total: event.total,
						options: self.options
					}
				});
			}
		}, false);
		xhr.addEventListener("load", function(event){
			
			file.status = scrupload.DONE;
			self._trigger('onFileComplete', null, {
				element: self.element,
				runtime: self.runtime,
				file: file,
				response: event.target.responseText,
				options: self.options
			});
			
			uploaded.push(file);
			
		}, false);
		//xhr.addEventListener("error", uploadFailed, false);
		//xhr.addEventListener("abort", uploadCanceled, false);
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
			scrupload.buildDefaultPostParams(self.options);
			
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
				i
			;
			
			self.swf_container = $("<div><div></div></div>").appendTo(self.element);
			self.swf_container.width(self.options.swfupload.button_width);
			self.swf_container.height(self.options.swfupload.button_height);
			
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
				file_upload_limit: self.options.upload_limit||0,
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
				file_queued_handler: function(swf_file){
					var file = scrupload.createFile(swf_file.name, self.options);
					
					/*//queue_limitのチェック
					if(self.options.queue_limit && self.queue_array.length == self.options.queue_limit)
					{
						file.status = scrupload.FAILED;
						self._trigger('onError', null, {
							element: self.element,
							file: file,
							error: scrupload.ERROR_QUEUE_LIMIT,
							runtime: self.runtime,
							options: self.options
						});
						
						this.cancelUpload(swf_file.id);
					}
					else
					{
						self.queue_array.push(file);
						uploaded.push(file);
						files[swf_file.id] = file;
						
						self._trigger('onSelect', null, {
							element: self.element,
							runtime: self.runtime,
							file: file,
							options: self.options
						});
					}*/
					
					retOnSelect = self._trigger('onSelect', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						options: self.options
					});
					
					if(retOnSelect !== false)
					{
						self.queue_array.push(file);
						uploaded.push(file);
						files[swf_file.id] = file;
					}
					else
					{
						this.cancelUpload(swf_file.id);
					}
					
					return retOnSelect;
				},
				file_dialog_complete_handler: function(num_selected, num_queued){
					this.startUpload();
				},
				upload_start_handler: function(swf_file){
					var file = files[swf_file.id],
						url
					;
					
					//post
					file.post.id = file.id;
					
					this.setPostParams($.extend(cookie_post, file.post));
					
					//get
					url = scrupload.buildUrlQuery(self.options.url, $.extend(cookie_get, file.get));
					this.setUploadURL(url);
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
						progress: {
							percent: percent,
							bytes_loaded: bytes_loaded,
							bytes_total: bytes_total,
							options: self.options
						}
					});
				},
				upload_success_handler: function(swf_file, resp){
					var file = files[swf_file.id];
					file.status = scrupload.DONE;
					self._trigger('onFileComplete', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						response: resp,
						options: self.options
					});
				},
				queue_complete_handler: function(num_uploaded){
					self._trigger('onComplete', null, {
						element: self.element,
						runtime: self.runtime,
						uploaded: uploaded,
						files: self.queue_array,
						options: self.options
					});
					
					uploaded = [];
					files = {};
				},
				file_queue_error_handler:function(file, code, message){
					self._trigger('onError', null, {
						element: self.element,
						file: null,
						error: scrupload.ERROR_QUEUE_LIMIT,
						runtime: self.runtime,
						options: self.options
					});
					
				}
			});
			
			if(!self.options.mutiple_select)
			{
				setting.button_action = SWFUpload.BUTTON_ACTION.SELECT_FILE;
			}
			
			scrupload.initButtonEvent(self, self.swf_container);
			
			self.swfuploader = new SWFUpload(setting);
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
