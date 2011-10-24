(function($){
$.widget('ui.scruploadTemplate', {
	options: scrupload.defaultOptions({
		
	}),
	_create: function()
	{
		var self = this;
	},
	destroy: function()
	{
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
