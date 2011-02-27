(function($){
$.widget('ui.scruploadHtml4', {
	options: scrupload.defaultOptions({
		html4_use_input: false
	}),
	_create: function()
	{
		var self = this;
		
		self.button = self.element.children();
		scrupload.checkElement(self.button);
		
		self.queue_array = [];
		self.post = scrupload.buildDefaultPostParams(self.options);
		
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
			.css("position", "absolute")
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
		
		scrupload.initButtonEvent(self, form);
	},
	_createFormAndInput: function()
	{
		var self = this;
		
		self.form = $('<form action="'+self.options.url+'" method="post" enctype="multipart/form-data" />');
		//ここをappendToにするとfirefoxで（cssの組み方次第ですが）ボタンが少しずれます。
		self.form.prependTo(document.body);
		
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
				status: scrupload.SELECTED,
				get: $.extend({}, self.options.get_params),
				post: $.extend({}, self.post)
			};
			
			//file typeのチェック
			if(self.options.types && filename != 'n/a')
			{
				if(!scrupload.checkTypes(self.options.types, filename))
				{
					file.status = scrupload.FAILED;
					self._trigger('onError', null, {
						button: self.element,
						file: file,
						error: scrupload.ERROR_TYPE,
						options: self.options
					});
					self._resetInterface();
					
					return;
				}
			}
			
			//queue_limitのチェック
			if(self.options.queue_limit && self.queue_array.length == self.options.queue_limit)
			{
				file.status = scrupload.FAILED;
				self._trigger('onError', null, {
					button: self.element,
					file: file,
					error: scrupload.ERROR_QUEUE_LIMIT,
					options: self.options
				});
				self._resetInterface();
				
				return;
			}
			
			self.queue_array.push(file);
			
			self._trigger('onSelect', null, {
				button: self.element,
				file: file
			});
			
			self.form.submit(function(){
				//post params
				file.post.id = file.id;
				$.each(file.post, function(key){
					self.form.append('<input type="hidden" name="'+key+'" value="'+this+'" />');
				});
				
				//get params
				var url = self.form.attr("action");
				url = scrupload.buildUrlQuery(url, file.get);
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
							progress: {percent: 100}
						});
						
						file.status = scrupload.DONE;
						self._trigger('onFileComplete', null, {
							button: self.element,
							file: file,
							response: resp
						});
						
						//html4は一個しかアップロードできないので同義
						self._trigger('onComplete', null, {
							button: self.element,
							files: self.queue_array
						});
					}
					
					setTimeout(function(){
						iframe.remove();
						self._resetInterface();
					}, 0);
				});
			
			self.form.submit();
			file.status = scrupload.UPLOADING;
			self._trigger('onProgress', null, {
				button: self.element,
				file: file,
				progress: {percent: 0}
			});
		});
		
		return self.form;
	},
	_resetInterface:function()
	{
		this.form.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.form.remove();
		this.button.show();
		this.queue_array = [];
		this.self.post = {};
		self.button = undefined;
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
