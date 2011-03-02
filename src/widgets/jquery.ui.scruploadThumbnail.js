(function($){
$.widget('ui.scruploadThumbnail', {
	options: {
		scrupload: {}
	},
	_create: function()
	{
		var self = this;
		
		self.element.scrupload($.extend(self.options.scrupload, {
			onFileComplete: function(event, ui)
			{
				var resp = $.parseJSON(ui.response),
					img,
					preview
				;
				
				//ダイアログ準備
				self.dialog = $("<div />")
					.appendTo(document.body)
					.append(self.options.dialog_template.html())
					.dialog($.extend(self.options.dialog, {
						
					}));
				
				//メイン画像
				img = $('<img src="'+resp.path+'" />');
				self.dialog.find(".scr_thumb_image").append(img);
				
				//プレビュー
				preview = $('<img src="'+resp.path+'" />');
				self.dialog.find(".scr_thumb_preview")
					.append(preview)
					.width(self.options.width)
					.height(self.options.height)
					.css('overflow', 'hidden');
				
				self.dialog.find("*").disableSelection();
				
				img.bind('load', function(){
					var size = {width: img.width(), height: img.height()},
						disable_selection = false,
						showPreview
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
				});
			}
		}));
	},
	destroy: function()
	{
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
