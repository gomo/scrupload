(function($, g){

var scr = g.scrupload = g.scrupload||{};

scr.QUEUED = 1;
scr.UPLOADING = 2;
scr.FAILED = 3;
scr.DONE = 4;

scr.uniqid = function()
{
	var char = 'abcdefghijklmnopqrstuvwxyz';
	var result = [];
	var len = char.length;
	for (var i = 0; i < 8; ++i)
	{
		result.push(char.charAt(Math.floor(len*Math.random())));
	}
	return result.join('') + new Date().getTime();
};

scr.buildUrlQuery = function(url, params)
{
	var q = $.param(params);
	return q.indexOf("?") != -1 ? url+"&"+q : url+"?"+q;
};

scr.getElementId = function(element)
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

scr.buildDefaultPostParams = function(options){
	var post = $.extend({}, options.post_params);
	post.types = options.types;
	
	if(options.size_limit)
	{
		post.size_limit = options.size_limit;
	}

	return post;
};

scr.checkTypes = function(types, filename){
	return true;
};

scr.defaultOptions = function(options){
	return $.extend({}, {
		post_params: {},
		get_params: {},
		types: ["*.*"]
	}, options||{});
};


})(jQuery, (function(){ return this; })());
