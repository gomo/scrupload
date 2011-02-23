(function($){
$.widget('ui.scruploadHtml4', {
	options: {
		
	},
	_create: function()
	{
		var self = this;
		var img = $('<img src="'+self.options.button_image+'">');
		img.appendTo(self.element);
		
		var form = $('<form action="" method="post" enctype="multipart/form-data" />');
		form.appendTo(self.element)
			.css("overflow", "hidden")
			.css("position", "absolute")
			.width(img.width())
			.height(img.height())
			.offset(img.offset())
			;
		
		var input = $('<input type="file" name="file" />');
		input.appendTo(form)
			.attr("size", 1)
			.css("font-size", img.height())
			.width("100%")
			.height("100%")
			//.css("filter", "alpha(opacity=0)")
			//.css("-moz-opacity", "0")
			//.css("opacity", "0")
			;
		
	},
	destroy: function()
	{
		$.Widget.prototype.destroy.apply(self, arguments);
		return self;
	}
});

})(jQuery);
