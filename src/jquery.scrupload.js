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
scr.ERROR_USER = 'USER';
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
			options.size_limit_byte = result[1] * 1024 * 1024;
		}
		else if(result = limit.match(/^([0-9]+)KB$/i))
		{
			options.size_limit_byte = result[1] * 1024;
		}
		else if(result = limit.match(/^([0-9]+)B?$/i))
		{
			options.size_limit_byte = result[1];
		}
		else
		{
			throw options.size_limit+' is illegal size_limit value.';
		}
		
		options.post_params.size_limit = options.size_limit;
		options.post_params.size_limit_byte = options.size_limit_byte;
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
			file.errors.push({
				type:scrupload.ERROR_TYPE,
				params: {file_types: list.join(",")}
			});
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
	if(widget.options.size_limit_byte && file.size)
	{
		if(file.size > widget.options.size_limit_byte)
		{
			file.errors.push({
				type:scrupload.ERROR_CAPACITY,
				params:{
					capacity: widget.options.size_limit
				}
			});
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
	
	var completeProccess = function(){
		form.remove();
		self._resetInterface();
		self.element.removeClass("scr_uploading");
		
		self._trigger('onComplete', null, {
			element: self.element,
			uploaded: [file],
			runtime: self.runtime,
			options: self.options
		});
	};
	
	var ret = self._trigger('onStartUpload', null, {
		element: self.element,
		runtime: self.runtime,
		queue: file.errors.length === 0 ? [file] : [],
		options: self.options
	});
	
	if(ret === false)
	{
		completeProccess();
		return;
	}
	
	if(file.errors.length == 0)
	{
		var ret = self._trigger('onFileStart', null, {
			element: self.element,
			runtime: self.runtime,
			file: file,
			options: self.options
		});
		
		
		
		if(ret === false)
		{
			self._trigger('onFileCancel', null, {
				element: this.element,
				runtime: this.runtime,
				file: file,
				options: this.options
			});
			
			completeProccess();
			return;
		}
		
		
		
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
				}
				
				setTimeout(function(){
					iframe.remove();
					completeProccess();
				}, 0);
			});
		
		form.submit();
	}
	else
	{
		completeProccess();
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
