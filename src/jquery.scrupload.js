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
