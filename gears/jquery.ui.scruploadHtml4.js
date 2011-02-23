(function($){
$.widget('ui.scruploadHtml4', {
	options: {
		html4_use_input: false
	},
	_create: function()
	{
		var self = this;
		
		self._queue_array = [];
		self._queue_obj = {};
		
		self._button = self.element.children();
		if(self._button.length > 1)
		{
			throw 'More than one element in target.';
		}
		
		if(self.options.html4_use_input)
		{
			var form = self._createForm();
			form.appendTo(self.element);
			self._button.hide();
		}
		else
		{
			self._initButton(self._button);
		}
	},
	_initButton: function(button)
	{
		var self = this;
		
		//chromeが画像のサイズを取得できなかった。
		$(window).bind('load', function() {
			var form = self._createForm()
				.css("overflow", "hidden")
				.css("cursor", "pointer")
				.width(button.width())
				.height(button.height())
				.offset(button.offset())
				;
			
			var input = form.find("input[type=file]");
			input
				.attr("size", 1)
				.css("font-size", button.height())
				.css("cursor", "pointer")
				.width("100%")
				.height("100%")
				.css("filter", "alpha(opacity=0)")
				.css("-moz-opacity", "0")
				.css("opacity", "0")
				;
			
			//マウスがキャレットにならないように、ボタンの上にくるようにinputを動かす
			var default_os = input.offset();
			var offset_top = input.height() / 2;
			var offset_left = (input.width() / 4) * 3;
			form.mousemove(function(event){
				input.offset({top: event.clientY - offset_top, left: event.clientX - offset_left});
			}).mouseout(function(){
				input.offset(default_os);
			});
			
			self._trigger('onInit', null, {button: self.element});
		});
	},
	_createForm: function()
	{
		var self = this;
		self._form = $('<form action="" method="post" enctype="multipart/form-data" />');
		
		var input = $('<input type="file" name="file" />');
		self._form
			.appendTo("body")
			.append(input);
		
		input.change(function(){
			
			//ブラウザによって得られる値が変わるので可能ならファイル名のみにする
			var filename = this.value, f = filename.match(/[\/\\]([^\/\\]+)$/i);
			if (f) filename = f[1];
			
			var file = {
				id : scrupload.uniqid(),
				time: new Date(),
				filename: filename,
				status: scrupload.QUEUED
			};
			
			self._queue_array.push(file);
			self._queue_obj[file.id] = file;
			
			self._trigger('onSelect', null, {button: self.element, file: file});
		});
		
		return this._form;
	},
	destroy: function()
	{
		this._form.remove();
		this._button.show();
		this._queue_array = [];
		this._queue_obj = {};
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
