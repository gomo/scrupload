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
scr.ERROR_CAPACITY = 'CAPACITY';
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
	
	//size_limitをバイトにするしてpostにセット
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
		
		options.post_params.size_limit = options.size_limit;
	}
};

/**
 * 拡張子をチェックする
 * @param widget
 * @param file
 */
scr.checkTypes = function(widget, file)
{
	if(widget.options.types && file.type)
	{
		var list = widget.options.types.split("|"), i;
		if($.inArray(file.type, list) == -1)
		{
			file.errors.push({type:scrupload.ERROR_TYPE});
			file.status = scrupload.FAILED;
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
	if(widget.options.size_limit && file.size)
	{
		if(file.size > widget.options.size_limit)
		{
			file.errors.push({type:scrupload.ERROR_CAPACITY});
			file.status = scrupload.FAILED;
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
	
	element.bind('mouseout.scr', function(){
		if(mouseover)
		{
			widget._trigger('onButtonOut', null, {
				element: widget.element,
				runtime: widget.runtime,
				options: widget.options
			});
			mouseover = false;
		}
	}).bind('mouseover.scr', function(){
		if(!mouseover)
		{
			widget._trigger('onButtonOver', null, {
				element: widget.element,
				runtime: widget.runtime,
				options: widget.options
			});
			mouseover = true;
		}
	}).bind('mousedown.scr', function(){
		widget._trigger('onButtonDown', null, {
			element: widget.element,
			runtime: widget.runtime,
			options: widget.options
		});
	});
};

scr.removeButtonEvent = function(element){
	element
		.unbind('mouseout.scr')
		.unbind('mouseover.scr')
		.unbind('mousedown.scr');
};

scr.createFile = function(file, options){
	
	return {
		id : (options.file_id_prefix||'scrfile-'+(++file_count)),
		time: new Date(),
		filename: file.name||file.fileName,
		size: file.size,
		type: scr.detectFileType(file),
		status: this.SELECTED,
		errors: [],
		get: $.extend({}, options.get_params),
		post: $.extend({}, options.post_params)
	};
};

scr.detectFileType = function(file)
{
	var type, name, i;
	if(file.type)
	{
		if(file.type.indexOf('/') == -1)
		{
			type = file.type.substr(1).toLowerCase();
		}
	}

	if(!type)
	{
		name = file.name||file.fileName;
		i = name.lastIndexOf('.');
		if(i == -1)
		{
			type = false;
		}
		else
		{
			type = name.substr(i + 1).toLowerCase();
		}
	}
	
	
	
	return type;
};

scr.onSelect = function(widget, file)
{
	widget._trigger('onSelect', null, {
		element: widget.element,
		runtime: widget.runtime,
		file: file,
		options: widget.options
	});
	
	if(file.errors.length > 0)
	{
		widget._trigger('onError', null, {
			element: widget.element,
			file: file,
			runtime: widget.runtime,
			options: widget.options
		});
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
	
	self._trigger('onDialogClose', null, {
		element: self.element,
		runtime: self.runtime,
		selected: [file],
		options: self.options
	});
	
	scrupload.onSelect(self, file);
	
	self._trigger('onStartUpload', null, {
		element: self.element,
		runtime: self.runtime,
		queue: file.errors.length === 0 ? [file] : [],
		options: self.options
	});
	
	if(file.errors.length == 0)
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
			file.post.post_name = self.options.file_post_name;
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
					var resp_json;
					try{ resp_json = $.parseJSON(resp); }catch(err){};
					
					if(resp_json && resp_json.errors.length)
					{
						file.status = scr.FAILED;
						file.errors = resp_json.errors;
						self._trigger('onError', null, {
							element: self.element,
							file: file,
							runtime: self.runtime,
							options: self.options
						});
					}
					else
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
							json: resp_json,
							options: self.options
						});
					}
					
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
var filename_regex = new RegExp("([^/?]+)\\??[^/]*$");
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
				.appendTo($("body"))
				.append(self.container)
				.hide();
			
			if(filename_regex.exec(value))
			{
				filename = RegExp.$1;
			}
			
			
			
			scrupload.submitIframForm(form, filename, self, function(file){
				
				file.post.filename = filename;
				file.http = {uri: value};
				
				if(!value.match(/^https?:\/\//))
				{
					file.errors.push({type:scrupload.ERROR_HTTP});
					file.status = scrupload.FAILED;
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
				.appendTo($("body"))
				.append(self.container)
				.hide();
			
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
		
		self.selected_array = [];
		self.uploaded_array = [];
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
		self.container.appendTo(self.element);
		self.input.appendTo(self.container);
		
		scrupload.initButtonEvent(self, self.container);
		
		self.input.change(function(){
			var url,
				form,
				filename = 'n/a',
				result,
				input = $(this),
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
				fd.append('post_name', input_name);
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
				
				self.selected_array.push(file);
			}
			
			self._trigger('onDialogClose', null, {
				element: self.element,
				runtime: self.runtime,
				selected: self.selected_array,
				options: self.options
			});
			
			$.each(self.selected_array, function(){
				var file = this;
				scrupload.onSelect(self, file);
				
				if(file.errors.length == 0)
				{
					self.queue_array.push(file);
				}
			});
			
			self._trigger('onStartUpload', null, {
				element: self.element,
				runtime: self.runtime,
				queue: self.queue_array,
				options: self.options
			});
			
			next = self.queue_array.shift();
			if(next)
			{
				self._onFileStart(next);
				self._upload(next);
			}
			else
			{
				self._onComplete();
			}
		});
	},
	_upload: function(file)
	{
		var xhr = new XMLHttpRequest();
		
		this._setAjaxEventListener(xhr, file);
		
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
	_setAjaxEventListener: function(xhr, file)
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
			
			var resp_json;
			try{ resp_json = $.parseJSON(event.target.responseText); }catch(err){};
			
			if(resp_json && resp_json.errors.length)
			{
				file.status = scrupload.FAILED;
				file.errors = resp_json.errors;
				self._trigger('onError', null, {
					element: self.element,
					file: file,
					runtime: self.runtime,
					options: self.options
				});
			}
			else
			{
				file.status = scrupload.DONE;
				self._trigger('onFileComplete', null, {
					element: self.element,
					runtime: self.runtime,
					file: file,
					response: event.target.responseText,
					json: resp_json,
					options: self.options
				});
				
				self.uploaded_array.push(file);
			}
			
			
			if(self.queue_array.length == 0)
			{
				self._onComplete();
			}
			else
			{
				next = self.queue_array.shift();
				self._onFileStart(next);
				setTimeout(function(){
					self._upload(next);
				}, self.options.interval);
			}
		}, false);
	},
	_onComplete: function()
	{
		this._trigger('onComplete', null, {
			element: this.element,
			runtime: this.runtime,
			uploaded: self.uploaded_array,
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
