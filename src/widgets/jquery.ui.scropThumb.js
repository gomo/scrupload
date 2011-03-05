(function($){
$.widget('ui.scropThumb', {
	options: {
		scrupload: {},
		additional_width: 50,
		path_key_name: 'path'
	},
	_create: function()
	{
		var self = this;
		
		self.element.scrupload($.extend(self.options.scrupload, {
			onSelect: function(event, ui)
			{
				self._trigger('onImageSelect', null, {
					element: self.element,
					scrupload: ui,
					options: self.options
				});
			},
			onFileComplete: function(event, ui)
			{
				var resp = $.parseJSON(ui.response),
					img,
					preview,
					tmp_div,
					event_return
					;
				
				//responseにerrorがあったら終了
				if(resp.error)
				{
					self._trigger('onUploadError', null, {
						element: self.element,
						response: resp,
						options: self.options
					});
					
					return;
				}
				
				event_return = self._trigger('onLoadImage', null, {
					element: self.element,
					response: resp,
					options: self.options
				});
				
				//onLoadImageがfalseを返したら終了
				if(event_return === false)
				{
					return;
				}
				
				self.image_path = resp[self.options.path_key_name];
				
				//サイズを取るためにappendした画像が画面に出ないように
				var tmp_div = $('<div />')
					.appendTo(document.body)
					.css('position', 'absolute')
					.css('top' ,'-10000px')
					.css('left', '-10000px');
				
				//メイン画像
				img = $('<img src="'+self.image_path+'" />').appendTo(tmp_div);
				//プレビュー
				preview = $('<img src="'+self.image_path+'" />').appendTo(tmp_div);
				
				img.load(function(){
					var size = {width: img.width(), height: img.height()}
						;
					
					//ダイアログdiv
					self.dialog = $("<div />")
						.appendTo(document.body)
						.append(self.options.dialog_template.html());
					
					self.dialog.find(".scr_thumb_image")
						.append(img)
						.width(size.width)
						.height(size.height)
						;
					
					self.dialog.find(".scr_thumb_preview")
						.width(self.options.width)
						.height(self.options.height)
						.css('overflow', 'hidden')
						.append(preview);
					
					tmp_div.remove();
					delete tmp_div;
					
					self.dialog.dialog($.extend(self.options.dialog, {
						width: size.width + self.options.width + self.options.additional_width,
						close:function(event, ui)
						{
							self._closeDialog();
						}
					}));
					
					//決定ボタンのイベント
					self.dialog.find(".sdx_thumb_button").click(function(){
						$.ajax({
							type: "POST",
							url: self.options.url,
							data: {
								path: self.image_path,
								coords: self.coords,
								size: {w: self.options.width, h: self.options.height}
							},
							success: function(data){
								self._trigger('onCropSuccess', null, {
									dialog: self.dialog,
									response: data
								});
								
								self._closeDialog();
							},
							error: function(XMLHttpRequest, textStatus, errorThrown)
							{
								self._trigger('onCropError', null, {
									element: self.element,
									xml_http_request: XMLHttpRequest,
									text_status: textStatus,
									error_thrown: errorThrown,
									options: self.options
								});
								
								if(window['console'])
								{
									console.info('Ajax error', XMLHttpRequest);
								}
								
								self._closeDialog();
							}
						});
						return false;
					});
					
					self.dialog.find("*").disableSelection();
					self._initJcrop(img, preview, size);
				});
			}
		}));
	},
	_closeDialog: function()
	{
		this._trigger('onDialogClose', null, {
			element: this.element,
			dialog: this.dialog,
			options: this.options
		});
		this.dialog.dialog('destroy');
		this.dialog.remove();
		this.dialog = null;
	},
	_initJcrop: function(img, preview, size)
	{
		var disable_selection = false,
			showPreview,
			self = this
		;
		
		showPreview = function(coords){
			
			if(!disable_selection)
			{
				self.dialog.find(".jcrop-holder *").disableSelection();
				disable_selection = true;
			}
			
			self.coords = coords;
			var rx = size.width / coords.w;
			var ry = size.height / coords.h;
			
			var prew = Math.round(rx * self.options.width);
			var preh = Math.round(ry * self.options.height);
			
			preview.css({
			    width: prew + 'px',
			    height: preh + 'px',
			    marginLeft: '-' + Math.round(coords.x * (prew / size.width)) + 'px',
				marginTop: '-' + Math.round(coords.y * (preh / size.height)) + 'px'
			});
		};
		
		img.Jcrop({
			onChange: showPreview,
			onSelect: showPreview,
			aspectRatio: self.options.width / self.options.height,
			minSize: [self.options.width, self.options.height],
			setSelect: [0, 0, self.options.width, self.options.height]
		});
	},
	destroy: function()
	{
		if(this.dialog)
		{
			this.dialog.dialog('destroy');
			this.dialog.remove();
		}
		
		this.image_path = undefined;
		this.coords = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
