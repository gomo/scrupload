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
			scrupload.buildDefaultPostParams(self.options);
			
			self._initInterface();
		},
		_initInterface: function()
		{
			var self = this,
				files = {},
				uploaded = [],
				setting
			;
			
			self.swf_container = $("<div><div></div></div>").appendTo(self.element);
			self.swf_container.width(self.options.swfupload.button_width);
			self.swf_container.height(self.options.swfupload.button_height);
			
			self.swfuploader = null;
			setting = $.extend(self.options.swfupload, {
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
				file_queued_handler: function(swf_file){
					var file = scrupload.createFile(swf_file.name, self.options);
					
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
						
						this.cancelUpload(swf_file.id);
					}
					else
					{
						self.queue_array.push(file);
						uploaded.push(file);
						files[swf_file.id] = file;
						
						self._trigger('onSelect', null, {
							element: self.element,
							runtime: self.runtime,
							file: file,
							options: self.options
						});
					}
				},
				file_dialog_complete_handler: function(num_selected, num_queued){
					this.startUpload();
				},
				upload_start_handler: function(swf_file){
					var file = files[swf_file.id],
						url
					;
					
					//post
					file.post.id = file.id;
					this.setPostParams(file.post);
					
					//get
					url = scrupload.buildUrlQuery(self.options.url, file.get);
					this.setUploadURL(url);
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
						progress: {
							percent: percent,
							bytes_loaded: bytes_loaded,
							bytes_total: bytes_total,
							options: self.options
						}
					});
				},
				upload_success_handler: function(swf_file, resp){
					var file = files[swf_file.id];
					file.status = scrupload.DONE;
					self._trigger('onFileComplete', null, {
						element: self.element,
						runtime: self.runtime,
						file: file,
						response: resp,
						options: self.options
					});
				},
				queue_complete_handler: function(num_uploaded){
					self._trigger('onComplete', null, {
						element: self.element,
						runtime: self.runtime,
						uploaded: uploaded,
						files: self.queue_array,
						options: self.options
					});
					
					uploaded = [];
					files = {};
				}
			});
			
			if(!self.options.mutiple_select)
			{
				setting.button_action = SWFUpload.BUTTON_ACTION.SELECT_FILE;
			}
			
			scrupload.initButtonEvent(self, self.swf_container);
			
			self.swfuploader = new SWFUpload(setting);
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
