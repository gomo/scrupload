(function($){
$.widget('ui.scruploadHtml5', {
	options: scrupload.defaultOptions({
		mutiple_select: true
	}),
	_create: function()
	{	
		var self = this;
		
		self.element.addClass("scr_html5_container");
		
		self.queue_array = [];
		scrupload.buildDefaultOptions(self.options);
		
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
		if(self.options.mutiple_select)
		{
			self.input = $('<input type="file" name="'+input_name+'" multiple />');
		}
		else
		{
			self.input = $('<input type="file" name="'+input_name+'" />');
		}
		
		
		self.container = $("<span />");
		self.input.appendTo(self.container.appendTo(self.element));
		scrupload.initButtonEvent(self, self.container);
		
		self.input.change(function(){
			var url,
				form,
				filename = 'n/a',
				result,
				input = $(this),
				uploaded = [],
				file,
				next
				;
			
			self.input.attr('disabled', 'disabled');
			
			self.element.addClass("scr_uploading");
			
			form = $('<form method="post" enctype="multipart/form-data" />');
			form
				.appendTo(self.element)
				.append(self.container);
			
			
			for(var i=0; i<this.files.length; i++)
			{
				file = scrupload.createFile(this.files[i], self.options);
				
				
				//postデータの作成
				fd = new FormData();
				fd.append(input_name, this.files[i]);
				fd.append('id', file.id);
				for(var key in file.post)
				{
					fd.append(key, file.post[key]);
				}
				
				//GET作成
				url = scrupload.buildUrlQuery(self.options.url, file.get);
				form.attr("action", url);
				
				file.html5 = {
					formData: fd,
					uri: url
				};
				
				//type check
				scrupload.checkTypes(self, file);
				
				//size check
				scrupload.checkSize(self, file);
				
				scrupload.onSelect(self, file);
				
				if(file.upload !== false)
				{
					self.queue_array.push(file);
				}
			}
			
			self._trigger('onStart', null, {
				element: self.element,
				runtime: self.runtime,
				files: self.queue_array,
				options: self.options
			});
			
			next = self.queue_array.shift();
			if(next)
			{
				self._onFileStart(next);
				self._upload(next, uploaded);
			}
			else
			{
				self._onComplete(uploaded);
			}
		});
	},
	_upload: function(file, uploaded)
	{
		var xhr = new XMLHttpRequest();
		
		this._setAjaxEventListener(xhr, file, uploaded);
		
		xhr.open("POST", file.html5.uri);
		xhr.send(file.html5.formData);
	},
	_onFileStart: function(file)
	{
		this._trigger('onFileStart', null, {
			element: this.element,
			runtime: this.runtime,
			file: file,
			options: this.options
		});
	},
	_setAjaxEventListener: function(xhr, file, uploaded)
	{
		var self = this;
		xhr.upload.addEventListener("progress", function(event){
			file.status = scrupload.UPLOADING;
			if (event.lengthComputable) {
				var percent = Math.round(event.loaded * 100 / event.total);
				self._trigger('onProgress', null, {
					element: self.element,
					runtime: self.runtime,
					file: file,
					options: self.options,
					progress: {
						percent: percent,
						bytes_loaded: event.loaded,
						bytes_total: event.total
					}
				});
			}
		}, false);
		xhr.addEventListener("load", function(event){
			var next;
			
			file.status = scrupload.DONE;
			self._trigger('onFileComplete', null, {
				element: self.element,
				runtime: self.runtime,
				file: file,
				response: event.target.responseText,
				options: self.options
			});
			
			uploaded.push(file);
			
			if(self.queue_array.length == 0)
			{
				self._onComplete(uploaded);
			}
			else
			{
				next = self.queue_array.shift();
				self._onFileStart(next);
				setTimeout(function(){
					self._upload(next, uploaded);
				}, self.options.interval);
			}
		}, false);
	},
	_onComplete: function(uploaded)
	{
		this._trigger('onComplete', null, {
			element: this.element,
			runtime: this.runtime,
			uploaded: uploaded,
			options: this.options
		});
		
		this._resetInterface();
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
