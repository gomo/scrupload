(function($){

$.widget('ui.scrupload', {
	options: {
		runtimes:'html5|html4'
	},
	_create: function()
	{	
		var self = this,
			runtimes,
			list = self.options.runtimes.split("|"),
			target,
			i,
			check_html5
		;
		
		check_html5 = $('<input type="file" />').appendTo("body").hide();
		runtimes = {
			html5: !!check_html5[0].files,
			//swfupload: self.detectFlashVer(8, 0, 0) && window.SWFUpload,
			http: true,
			html4: true
		};
		check_html5.remove();
		
		list.push("html4");
		for(i=0; i<list.length; i++)
		{
			if(runtimes[list[i]] && self.start(list[i]))
			{
				break;
			}
		}
	},
	start: function(runtime)
	{
		var target = this._getRuntimeName(runtime);
		if(this.current_runtime != runtime && this.element[target])
		{
			if(this.current_runtime)
			{
				this.element[this._getRuntimeName(this.current_runtime)]("destroy");
			}
			
			this.element[target](this.options);
			this.current_runtime = runtime;
			return true;
		}
		
		return false;
	},
	_getRuntimeName: function(runtime)
	{
		return "scrupload"+runtime.substr(0, 1).toUpperCase()+runtime.substr(1);
	},
	destroy: function()
	{
		this.element[this._getRuntimeName(this.current_runtime)]("destroy");
		this.current_runtime = undefined;
		
		$.Widget.prototype.destroy.apply(this, arguments);
		return this;
	}
});

})(jQuery);
