(function($){
$.widget('ui.scruploadHtml4', {
	options: {
		html4_use_input: false,
		post_params: {},
		get_params: {}
	},
	_create: function()
	{
		var self = this;
		
		self.queue_array = [];
		
		self.button = self.element.children();
		if(self.button.length < 1)
		{
			throw 'More than one element in target.';
		}
		
		//chromeが画像のサイズを取得できなかった。
		$(window).bind('load', function() {
			self._initInterface();
			self._trigger('onInit', null, {button: self.element});
		});
	},
	_initInterface: function()
	{
		var self = this;
		if(self.options.html4_use_input)
		{
			var form = self._createFormAndInput();
			form.appendTo(self.element);
			self.button.hide();
		}
		else
		{
			self._initFormForButton(self.button);
		}
	},
	_initFormForButton: function(button)
	{
		var self = this;
		
		var form = self._createFormAndInput()
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
	},
	_createFormAndInput: function()
	{
		var self = this;
		
		self.form = $('<form action="'+self.options.url+'" method="post" enctype="multipart/form-data" />');
		self.form.appendTo(self.element);
		
		var input = $('<input type="file" name="file" />');
		self.form.append(input);
		
		input.change(function(){
			
			//ブラウザによって得られる値が変わるので可能ならファイル名のみにする
			var filename = 'n/a';
			if(this.value)
			{
				var filename = this.value;
				var result = filename.match(/[\/\\]([^\/\\]+)$/i);
				if (result)
				{
					filename = result[1];
				}	
			}
			
			var file = {
				id : scrupload.uniqid(),
				time: new Date(),
				filename: filename,
				status: scrupload.SELECTED
			};
			
			self.queue_array.push(file);
			
			var get = $.extend({}, self.options.get_params);
			var post = $.extend({}, self.options.post_params);
			self._trigger('onSelect', null, {
				button: self.element,
				file: file,
				get: get,
				post: post
			});
			
			self.form.submit(function(){
				self._trigger('onStart', null, {
					button: self.element,
					file: file,
					get: get,
					post: post
				});
				
				$.each(post, function(key){
					self.form.append('<input type="hidden" name="'+key+'" value="'+this+'" />');
				});
				
				var url = self.form.attr("action");
				url = scrupload.buildUrlQuery(url, get);
				self.form.attr('action', url);
			});
			
			//upload
			self.form.attr('target', file.id);
			self.form.find('input[name=id]').val(file.id);
			$('<iframe src="about:blank" name="' + file.id + '">')
				.appendTo(document.body)
				.css({width: '1px', height: '1px', position: 'absolute', left: '-10000px', top: '-10000px'})
				.load(function(){
					var iframe = $(this);
					var resp = $(this.contentWindow.document.body).text();
					if (resp)
					{
						self._trigger('onProgress', null, {
							button: self.element,
							file: file,
							progress: {loaded_bytes:'n/a', total_bytes: 'n/a', percent: 100}
						});
						
						file.status = scrupload.DONE;
						self._trigger('onComplete', null, {
							button: self.element,
							file: file,
							response: resp
						});
					}
					
					setTimeout(function(){
						iframe.remove();
						self._initInterface();
					}, 0);
				});
			
			self.form.submit().remove();
			file.status = scrupload.UPLOADING;
			self._trigger('onProgress', null, {
				button: self.element,
				file: file,
				progress: {loaded_bytes:'n/a', total_bytes: 'n/a', percent: 0}
			});
		});
		
		return self.form;
	},
	destroy: function()
	{
		this._form.remove();
		this._button.show();
		this._queue_array = [];
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
