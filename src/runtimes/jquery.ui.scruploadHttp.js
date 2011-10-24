(function($){
var filename_regex = new RegExp("([^/]+)$");
$.widget('ui.scruploadHttp', {
	options: scrupload.defaultOptions({
		button_value: 'OK'
	}),
	_create: function()
	{
		var self = this;
		
		self.element.addClass("scr_http_container");
		
		self.queue_array = [];
		scrupload.buildDefaultOptions(self.options);
		
		self._initInterface();
		self.runtime = {name: 'http', object: self.input};
		self._trigger('onInit', null, {
			element: self.element,
			runtime: self.runtime,
			options: self.options
		});
	},
	_initInterface: function()
	{
		var self = this,
			button;

		self.container = $('<span></span>').appendTo(self.element);
		self.input = $('<input type="text">').appendTo(self.container);
		button = $('<input type="submit" value="'+self.options.button_value+'">')
			.appendTo(self.container);
		
		scrupload.initButtonEvent(self, self.container);
		
		button.click(function(){
			var form = $('<form action="'+self.options.url+'" method="post" />'),
			filename = 'n/a',
			button = $(this),
			value = self.input.val()
			;
		
			self.element.addClass("scr_uploading");
			
			self.input.attr('name', self.options.file_post_name);
			
			form
				.appendTo(self.element)
				.append(self.container);
			
			if(filename_regex.exec(value))
			{
				filename = RegExp.$1;
			}
			
			scrupload.submitIframForm(form, filename, self, function(file){
				
				file.http = {uri: value};
				
				if(file.upload !== false && !value.match(/^https?:\/\//))
				{
					file.upload = false;
					file.status = scrupload.FAILED;
					self._trigger('onError', null, {
						element: self.element,
						file: file,
						error: scrupload.ERROR_HTTP,
						runtime: self.runtime,
						options: self.options
					});
				}
			});
			
			return false;
		});
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.element.removeClass("scr_http_container");
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
