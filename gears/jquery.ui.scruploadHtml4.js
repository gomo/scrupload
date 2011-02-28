(function($){
$.widget('ui.scruploadHtml4', {
	options: scrupload.defaultOptions({
		//html4_use_input: false
	}),
	_create: function()
	{
		var self = this;
		
		//self.button = self.element.children();
		//scrupload.checkElement(self.button);
		
		self.queue_array = [];
		scrupload.buildDefaultPostParams(self.options);
		
		//chromeが画像のサイズを取得できなかった。
		$(window).bind('load', function() {
			self._initInterface();
			self._trigger('onInit', null, {
				element: self.element,
				gear: 'html4',
				options: self.options
			});
		});
	},
	_initInterface: function()
	{
		var self = this;
		if(true/*self.options.html4_use_input*/)
		{
			var form = self._createFormAndInput();
			var span = $("<span />");
			form.find("input[type=file]").appendTo(span.appendTo(self.element));
			scrupload.initButtonEvent(self, span);
			//self.button.hide();
		}
		/*else
		{
			//html4はブラウザ間の挙動の問題&アフォーダンスの問題で画像やHTMLで
			//を起動ボタンにできないようにしました。
			self._initFormForButton(self.button);
			scrupload.initButtonEvent(self, self.form);
		}*/
	},
	/*_initFormForButton: function(button)
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
		
		$(window).resize(function(){self.replace();});
	},*/
	_createFormAndInput: function()
	{
		var self = this;
		
		self.form = $('<form action="'+self.options.url+'" method="post" enctype="multipart/form-data" />');
		//ここをappendToにするとfirefoxで（cssの組み方次第ですが）ボタンが少しずれます。
		self.form.prependTo(document.body);
		
		var input = $('<input type="file" name="'+self.options.file_post_name+'" />');
		self.form.append(input);
		
		input.change(function(){
			
			$(this).appendTo(self.form);
			
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
			
			var file = scrupload.createFile(filename, self.options);
			
			//file typeのチェック
			if(self.options.types && filename != 'n/a')
			{
				if(!scrupload.checkTypes(self.options.types, filename))
				{
					file.status = scrupload.FAILED;
					self._trigger('onError', null, {
						element: self.element,
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
					element: self.element,
					file: file,
					error: scrupload.ERROR_QUEUE_LIMIT,
					options: self.options
				});
				self._resetInterface();
				
				return;
			}
			
			self.queue_array.push(file);
			
			self._trigger('onSelect', null, {
				element: self.element,
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
				
				file.status = scrupload.UPLOADING;
				self._trigger('onProgress', null, {
					element: self.element,
					file: file,
					progress: {percent: 0}
				});
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
							element: self.element,
							file: file,
							progress: {percent: 100}
						});
						
						file.status = scrupload.DONE;
						self._trigger('onFileComplete', null, {
							element: self.element,
							file: file,
							response: resp
						});
						
						//html4は一個しかアップロードできないので同義
						self._trigger('onComplete', null, {
							element: self.element,
							uploaded: [file],
							files: self.queue_array
						});
					}
					
					setTimeout(function(){
						iframe.remove();
						self._resetInterface();
					}, 0);
				});
			
			self.form.submit();
		});
		
		return self.form;
	},
	/*replace: function()
	{
		if(this.form)
		{
			this.form.offset(this.element.offset());
		}
	},*/
	_resetInterface:function()
	{
		this.form.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.form.remove();
		//this.button.show();
		this.queue_array = [];
		this.button = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
