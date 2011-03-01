(function($){
$.widget('ui.scruploadHtml4', {
	options: scrupload.defaultOptions({
	}),
	_create: function()
	{
		var self = this;
		
		self.queue_array = [];
		scrupload.buildDefaultPostParams(self.options);
		
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
				file,
				input = $(this)
				;
			
			input.attr('name', self.options.file_post_name);
			
			form
				.appendTo(self.element)
				.append(input);
			
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
			
			file = scrupload.createFile(filename, self.options);
			
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
						runtime: self.runtime,
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
					runtime: self.runtime,
					options: self.options
				});
				self._resetInterface();
				
				return;
			}
			
			self.queue_array.push(file);
			
			self._trigger('onSelect', null, {
				element: self.element,
				runtime: self.runtime,
				file: file,
				options: self.options
			});
			
			form.submit(function(){
				//post params
				file.post.id = file.id;
				$.each(file.post, function(key){
					form.append('<input type="hidden" name="'+key+'" value="'+this+'" />');
				});
				
				//get params
				var url = form.attr("action");
				url = scrupload.buildUrlQuery(url, file.get);
				form.attr('action', url);
				
				file.status = scrupload.UPLOADING;
				self._trigger('onProgress', null, {
					element: self.element,
					runtime: self.runtime,
					file: file,
					progress: {percent: 0},
					options: self.options
				});
			});
			
			//upload
			form.attr('target', file.id);
			form.find('input[name=id]').val(file.id);
			$('<iframe src="about:blank" name="' + file.id + '">')
				.appendTo(document.body)
				.css({width: '1px', height: '1px', position: 'absolute', left: '-10000px', top: '-10000px'})
				.load(function(){
					var iframe = $(this),
						resp = $(this.contentWindow.document.body).text()
						;
					
					if (resp)
					{
						self._trigger('onProgress', null, {
							element: self.element,
							file: file,
							runtime: self.runtime,
							progress: {percent: 100},
							options: self.options
						});
						
						file.status = scrupload.DONE;
						self._trigger('onFileComplete', null, {
							element: self.element,
							file: file,
							runtime: self.runtime,
							response: resp,
							options: self.options
						});
						
						//html4は一個しかアップロードできないので同義
						self._trigger('onComplete', null, {
							element: self.element,
							uploaded: [file],
							runtime: self.runtime,
							files: self.queue_array,
							options: self.options
						});
					}
					
					setTimeout(function(){
						iframe.remove();
						form.remove();
						self._resetInterface();
					}, 0);
				});
			
			form.submit();
		});
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
