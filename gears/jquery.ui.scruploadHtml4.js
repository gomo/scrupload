(function($){
$.widget('ui.scruploadHtml4', {
	options: {
		
	},
	_create: function()
	{
		var self = this;
		
		//chromeが画像のサイズを取得できなかった。
		$(window).bind('load', function() {
			self._form = $('<form action="" method="post" enctype="multipart/form-data" />');
			var os = self.element.offset();
			console.info(os);
			self._form.appendTo("body")
				.css("overflow", "hidden")
				.css("cursor", "pointer")
				//.css("position", "absolute")
				.width(self.element.width())
				.height(self.element.height())
				.offset({top: os.top, left: os.left})
				;
			
			var input = $('<input type="file" name="file" />');
			input.appendTo(self._form)
				.attr("size", 1)
				.css("font-size", self.element.height())
				.css("cursor", "pointer")
				.width("100%")
				.height("100%")
				//.css("filter", "alpha(opacity=0)")
				//.css("-moz-opacity", "0")
				//.css("opacity", "0")
				.change(function(e){
					console.info(this.value);
				})
				;
			
			var default_os = input.offset();
			var offset_top = input.height() / 2;
			var offset_left = (input.width() / 4) * 3;
			self._form.mousemove(function(e){
				input.offset({top: e.clientY - offset_top, left: e.clientX - offset_left});
			}).mouseout(function(){
				input.offset({top: default_os.top, left: default_os.left});
			});
			
			self._trigger('onInit', null, {button: self.element});
		});
	},
	destroy: function()
	{
		this._form.remove();
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
