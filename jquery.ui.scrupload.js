(function($){
$.widget('ui.scrupload', {
	options: {
		
	},
	_create: function()
	{
		
	},
	destroy: function()
	{
		this.container.remove();
		this.queue_array = [];
		this.button = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
