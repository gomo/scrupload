(function($){
$.widget('ui.scruploadHtml4', {
	options: {
		
	},
	_create: function()
	{
		var self = this;
		var button = self.element.find(':first-child');
		button.css("cursor", "pointer");
		
		$(window).bind('load', function() {
			var form = $('<form action="" method="post" enctype="multipart/form-data" />');
			form.appendTo("body")
				.css("overflow", "hidden")
				.css("position", "absolute")
				.css("cursor", "pointer")
				.width(button.width())
				.height(button.height())
				.offset(button.offset())
				;
			
			var input = $('<input type="file" name="file" />');
			input.appendTo(form)
				.attr("size", 1)
				.css("font-size", button.height())
				.css("cursor", "pointer")
				.width("100%")
				.height("100%")
				//.css("filter", "alpha(opacity=0)")
				//.css("-moz-opacity", "0")
				//.css("opacity", "0")
				;
			var default_os = input.offset();
			var offset_top = input.height() / 2;
			var offset_left = (input.width() / 4) * 3;
			form.mousemove(function(event){
				input.offset({top: event.clientY - offset_top, left: event.clientX - offset_left});
			}).mouseout(function(){
				input.offset(default_os);
			});
		});
	},
	destroy: function()
	{
		$.Widget.prototype.destroy.apply(self, arguments);
		return self;
	}
});

})(jQuery);
