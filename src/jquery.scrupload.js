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
