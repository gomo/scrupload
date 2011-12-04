(function($){
$.widget('ui.scruploadHtml4', {
	options: scrupload.defaultOptions({
	}),
	_create: function()
	{
		var self = this;
		
		self.element.addClass("scr_html4_container");
		
		self.queue_array = [];
		scrupload.buildDefaultOptions(self.options);
		
		self._initInterface();
		self.runtime = {name: 'html4', object: self.input};
		self._trigger('onInit', null, {
			element: self.element,
			runtime: self.runtime,
			options: self.options
		});
	},
	_initInterface: function()
	{
		var self = this;
		self._createFormAndInput();
	},
	_createFormAndInput: function()
	{
		var self = this;
		
		self.input = $('<input type="file" />');
		self.container = $("<span />");
		self.input.appendTo(self.container.appendTo(self.element));
		scrupload.initButtonEvent(self, self.container);
		
		self.input.change(function(){
			
			var form = $('<form action="'+self.options.url+'" method="post" enctype="multipart/form-data" />'),
				filename = 'n/a',
				result,
				input = $(this)
				;
			
			self.element.addClass("scr_uploading");
			
			input.attr('name', self.options.file_post_name);
			
			form
				.appendTo($("body"))
				.append(self.container)
				.hide();
			
			//ブラウザによって得られる値が変わるので可能ならファイル名のみにする
			
			if(this.value)
			{
				filename = this.value;
				result = filename.match(/[\/\\]([^\/\\]+)$/i);
				if (result)
				{
					filename = result[1];
				}	
			}
			
			scrupload.submitIframForm(form, filename, self);
		});
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.element.removeClass("scr_html4_container");
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
