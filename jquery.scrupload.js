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

})(jQuery, (function(){ return this; })());
