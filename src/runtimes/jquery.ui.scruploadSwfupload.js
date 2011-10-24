(function($){
if(window.SWFUpload)
{
	$.widget('ui.scruploadSwfupload', {
		options: scrupload.defaultOptions({
			swfupload: {
				prevent_swf_caching : false,
				button_cursor : SWFUpload.CURSOR.HAND
			},
			mutiple_select: true
		}),
		_create: function()
		{
			var self = this;	
			
			self.queue_array = [];
			scrupload.buildDefaultOptions(self.options);
			
			self._initInterface();
		},/*
		_loadCookie: function()
		{
			var tmp_cookie,tmp_keyval,i;
			
			this._cookie = {};
			
			tmp_cookie = document.cookie.split('; ');
			for(i=0; i<tmp_cookie.length; i++)
			{
				tmp_keyval = tmp_cookie[i].split('=');
				this._cookie[tmp_keyval[0]] = unescape(tmp_keyval[1]);
			}
		},*/
		_initInterface: function()
		{
			var self = this,
				files = {},
				uploaded = [],
				setting,
				cookie_post = {},
				cookie_get = {},
				i,
				current_file,
				selected
			;
			
			self.swf_container = $("<div><div></div></div>").appendTo(self.element);
			self.swf_container.width(self.options.swfupload.button_width);
			self.swf_container.height(self.options.swfupload.button_height);
			
			//cookie
			if(self.options.swfupload.cookie)
			{
				if(!$.cookie)
				{
					throw 'It is require "jquery.cookie.js" to use cookie option.';
				}
				
				if((self.options.swfupload.cookie_method||'get').toLowerCase() == 'get')
				{
					for(i=0; i<self.options.swfupload.cookie.length; i++)
					{
						cookie_get[self.options.swfupload.cookie[i]] = $.cookie(self.options.swfupload.cookie[i]);
					}
				}
				else
				{
					for(i=0; i<self.options.swfupload.cookie.length; i++)
					{
						cookie_post[self.options.swfupload.cookie[i]] = $.cookie(self.options.swfupload.cookie[i]);
					}
				}
				
				delete self.options.swfupload.cookie;
				delete self.options.swfupload.cookie_method;
			}
			
			self.swfuploader = null;
			setting = $.extend(self.options.swfupload, {
				//file_upload_limit: self.options.upload_limit||0,
				file_post_name: self.options.file_post_name,
				upload_url: self.options.url,
				file_size_limit: self.options.size_limit,
				button_placeholder_id: scrupload.generateElementId(self.swf_container.find("div")),
				preserve_relative_urls: true,
				button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,
				swfupload_loaded_handler: function(){
					self.runtime = {name: "swfupload", object:self.swfuploader};
					self._trigger('onInit', null, {
						element: self.element,
						runtime: self.runtime,
						options: self.options
					});
				},
				file_dialog_start_handler: function(a1, a2, a3){
					selected = false;
				},
				file_queued_handler: function(swf_file){
					var file = scrupload.createFile(swf_file, self.options);
					
					selected = true;
					file.swfupload = {file: swf_file};
					
					//type check
					scrupload.checkTypes(self, file);
					
					//size check
					scrupload.checkSize(self, file);
					
					scrupload.onSelect(self, file);
					
					if(file.errors.length == 0)
					{
						self.queue_array.push(file);
						files[swf_file.id] = file;
					}
					else
					{
						this.cancelUpload(swf_file.id);
					}
					
					//return file.upload;
				},
				file_dialog_complete_handler: function(num_selected, num_queued){
					
					self._trigger('onStart', null, {
						element: self.element,
						runtime: self.runtime,
						files: self.queue_array,
						options: self.options
					});
					
					if(self.queue_array.length > 0)
					{
						scrupload.disableInterface(self.element, self.options);
						
						this.startUpload();
					}
					else if(selected)
					{
						self._onComplete(uploaded);
					}
				},
				upload_start_handler: function(swf_file){
					var file = files[swf_file.id],
						url,
						swfuploader = this
					;
					
					//interval
					if(uploaded.length > 0)
					{
						
						if(current_file != file)
						{
							this.stopUpload();
							
							current_file = file;
							self._onFileStart(file, cookie_post, cookie_get);
							
							setTimeout(function(){
								self.swfuploader.startUpload();
							}, self.options.interval);
						}
					}
					else
					{
						current_file = file;
						self._onFileStart(file, cookie_post, cookie_get);
						self.swfuploader.startUpload();
					}
				},
				upload_progress_handler: function(swf_file, bytes_loaded, bytes_total){
					var file = files[swf_file.id],
						percent = Math.ceil((bytes_loaded / bytes_total) * 100)
						;
						
					file.status = scrupload.UPLOADING;
					
					self._trigger('onProgress', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						options: self.options,
						progress: {
							percent: percent,
							bytes_loaded: bytes_loaded,
							bytes_total: bytes_total
						}
					});
				},
				upload_success_handler: function(swf_file, resp){
					var file = files[swf_file.id];
					file.status = scrupload.DONE;
					uploaded.push(file);
					self._trigger('onFileComplete', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						response: resp,
						options: self.options
					});
				},
				queue_complete_handler: function(num_uploaded){
					self._onComplete(uploaded);
					
					scrupload.enableInterface(self.element, self.options);
					uploaded = [];
					files = {};
					current_file = null;
				}/*,
				file_queue_error_handler:function(file, code, message){
					self._trigger('onError', null, {
						element: self.element,
						file: null,
						error: scrupload.ERROR_QUEUE_LIMIT,
						runtime: self.runtime,
						options: self.options
					});
					
				}*/
			});
			
			if(!self.options.mutiple_select)
			{
				setting.button_action = SWFUpload.BUTTON_ACTION.SELECT_FILE;
			}
			
			scrupload.initButtonEvent(self, self.swf_container);
			
			self.swfuploader = new SWFUpload(setting);
		},
		_onComplete: function(uploaded)
		{
			this._trigger('onComplete', null, {
				element: this.element,
				runtime: this.runtime,
				uploaded: uploaded,
				options: this.options
			});
		},
		_onFileStart: function(file, cookie_post, cookie_get)
		{
			//queueの管理はswfがやっているので特に意味はないが、他と挙動を合わせるため
			this.queue_array.shift();
			
			//post
			file.post.id = file.id;
			
			this.swfuploader.setPostParams($.extend(cookie_post, file.post));
			
			//get
			url = scrupload.buildUrlQuery(this.options.url, $.extend(cookie_get, file.get));
			this.swfuploader.setUploadURL(url);

			this._trigger('onFileStart', null, {
				element: this.element,
				runtime: this.runtime,
				file: file,
				options: this.options
			});
		},
		getRuntime: function()
		{
			return this.swfuploader;
		},
		destroy: function()
		{
			
			this.swfuploader.destroy();
			this.swf_container.remove();
			this.queue_array = [];
			
			$.Widget.prototype.destroy.apply(this, arguments);
			return this;
		}
	});
}

})(jQuery);