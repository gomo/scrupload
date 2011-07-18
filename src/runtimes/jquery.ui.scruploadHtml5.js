(function($){
$.widget('ui.scruploadHtml5', {
	options: scrupload.defaultOptions({
	}),
	_create: function()
	{	
		var self = this;
		
		self.element.addClass("scr_html5_container");
		
		self.queue_array = [];
		scrupload.buildDefaultPostParams(self.options);
		
		self._initInterface();
		self.runtime = {name: 'html5', object: self.input};
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
		var self = this,input_name;
		
		input_name = self.options.file_post_name;
		if(self.options.queue_limit > 1)
		{
			//input_name = self.options.file_post_name+'[]';
			self.input = $('<input type="file" name="'+input_name+'" multiple />');
		}
		else
		{
			//input_name = self.options.file_post_name;
			self.input = $('<input type="file" name="'+input_name+'" />');
		}
		
		
		self.container = $("<span />");
		self.input.appendTo(self.container.appendTo(self.element));
		scrupload.initButtonEvent(self, self.container);
		
		self.input.change(function(){
			
			//queue_limitのチェック
			if(self.options.upload_limit && this.files.length > self.options.upload_limit)
			{
				self._trigger('onError', null, {
					element: self.element,
					file: null,
					error: scrupload.ERROR_QUEUE_LIMIT,
					runtime: self.runtime,
					options: self.options
				});
				self._resetInterface();
				
				return;
			}
			
			var url = self.options.url,
				form,
				filename = 'n/a',
				result,
				input = $(this),
				fd,
				xhr,
				check_interval,
				selected_count = this.files.length,
				uploaded = []
				;
			
			self.element.addClass("scr_uploading");
			
			form = $('<form method="post" enctype="multipart/form-data" />');
			form
				.appendTo(self.element)
				.append(self.container);
			
			
			for(var i=0; i<this.files.length; i++)
			{
				file = scrupload.createFile(this.files[i].fileName, self.options);
				self.queue_array.push(file);
				fd = new FormData();
				fd.append(input_name, this.files[i]);
				
				for(var key in file.post)
				{
					fd.append(key, file.post[key]);
				}
				
				url = scrupload.buildUrlQuery(url, file.get);
				form.attr("action", url);
				
				self._trigger('onSelect', null, {
					element: self.element,
					runtime: self.runtime,
					file: file,
					options: self.options
				});
				
				xhr = new XMLHttpRequest();
				//TODO post getの送信
				xhr.upload.addEventListener("progress", function(event){
					file.status = scrupload.UPLOADING;
					if (event.lengthComputable) {
						var percent = Math.round(event.loaded * 100 / event.total);
						self._trigger('onProgress', null, {
							element: self.element,
							runtime: self.runtime,
							file: file,
							progress: {
								percent: percent,
								bytes_loaded: event.loaded,
								bytes_total: event.total,
								options: self.options
							}
						});
					}
				}, false);
				xhr.addEventListener("load", function(event){
					file.status = scrupload.DONE;
					self._trigger('onFileComplete', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						response: event.target.responseText,
						options: self.options
					});
					
					uploaded.push(file);
					
				}, false);
				//xhr.addEventListener("error", uploadFailed, false);
				//xhr.addEventListener("abort", uploadCanceled, false);
				
				xhr.open("POST", url);
				xhr.send(fd);
			}
			
			check_interval = setInterval(function(){
				if(selected_count == uploaded.length)
				{
					clearInterval(check_interval);
					self._trigger('onComplete', null, {
						element: self.element,
						runtime: self.runtime,
						uploaded: uploaded,
						files: self.queue_array,
						options: self.options
					});
					
					input.val("");
					uploaded = [];
				}
			}, 80);
		});
	},
	_resetInterface:function()
	{
		this.container.remove();
		this._initInterface();
	},
	destroy: function()
	{
		this.element.removeClass("scr_html5_container");
		this.container.remove();
		this.queue_array = [];
		this.input = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
