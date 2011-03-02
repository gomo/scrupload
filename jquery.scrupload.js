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
	return q.indexOf("?") != -1 ? url+"&"+q : url+"?"+q;
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


})(jQuery, (function(){ return this; })());
