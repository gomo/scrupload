(function($){
$.widget('ui.scruploadSWFUpload', {
	options: scrupload.defaultOptions({
		
	}),
	_create: function()
	{
		var self = this;
		var button_id = scrupload.getElementId(self.element);
		console.info(button_id);
	},
	destroy: function()
	{
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
