(function($){

$.widget('ui.scrupload', {
	options: {
		runtimes:'swfupload|http|html4'
	},
	_create: function()
	{
		this.isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
		this.isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
		this.isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;
		
		var self = this,
			runtimes = {
				swfupload : self.detectFlashVer(8, 0, 0) && window.SWFUpload,
				html4: true
			},
			list = self.options.runtimes.split("|"),
			target,
			i
		;
		
		
		
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
	detectFlashVer: function(reqMajorVer, reqMinorVer, reqRevision)
	{
		var	versionStr = this._getFlashVesion(),
			versionMajor,
			versionMinor,
			versionRevision
			;
		
		
		if (versionStr == -1 )
		{
			return false;
		}
		else if (versionStr != 0)
		{
			if(this.isIE && this.isWin && !this.isOpera)
			{
				// Given "WIN 2,0,0,11"
				tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
				tempString        = tempArray[1];			// "2,0,0,11"
				versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
			}
			else
			{
				versionArray      = versionStr.split(".");
			}
			
			versionMajor      = versionArray[0];
			versionMinor      = versionArray[1];
			versionRevision   = versionArray[2];

	        // is the major.revision >= requested major.revision AND the minor version >= requested minor
			if (versionMajor > parseFloat(reqMajorVer))
			{
				return true;
			}
			else if (versionMajor == parseFloat(reqMajorVer))
			{
				if (versionMinor > parseFloat(reqMinorVer))
				{
					return true;
				}	
				else if (versionMinor == parseFloat(reqMinorVer))
				{
					if (versionRevision >= parseFloat(reqRevision))
					{
						return true;
					}
				}
			}
			return false;
		}
	},
	_getFlashVesion: function()
	{
		// NS/Opera version >= 3 check for Flash plugin in plugin array
		var flashVer = -1,
			swVer2,
			flashDescription,
			descArray,
			tempArrayMajor,	
			versionMajor,
			versionMinor,
			versionRevision
		;
		
		if (navigator.plugins != null && navigator.plugins.length > 0)
		{
			if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"])
			{
				swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
				flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
				descArray = flashDescription.split(" ");
				tempArrayMajor = descArray[2].split(".");			
				versionMajor = tempArrayMajor[0];
				versionMinor = tempArrayMajor[1];
				versionRevision = descArray[3];
				if (versionRevision == "")
				{
					versionRevision = descArray[4];
				}
				if (versionRevision[0] == "d") {
					versionRevision = versionRevision.substring(1);
				} else if (versionRevision[0] == "r") {
					versionRevision = versionRevision.substring(1);
					if (versionRevision.indexOf("d") > 0) {
						versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
					}
				}
				
				flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
			}
		}
		// MSN/WebTV 2.6 supports Flash 4
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
		// WebTV 2.5 supports Flash 3
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
		// older WebTV supports Flash 2
		else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
		else if ( this.isIE && this.isWin && !this.isOpera )
		{
			flashVer = this._getFlashVersionForIE();
		}	
		return flashVer;
	},
	_getFlashVersionForIE: function()
	{
		var version,
			axo,
			e;

		// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry

		try {
			// version will be set for 7.X or greater players
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			version = axo.GetVariable("$version");
		} catch (e) {
		}

		if (!version)
		{
			try {
				// version will be set for 6.X players only
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
				
				// installed player is some revision of 6.0
				// GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
				// so we have to be careful. 
				
				// default to the first public version
				version = "WIN 6,0,21,0";

				// throws if AllowScripAccess does not exist (introduced in 6.0r47)		
				axo.AllowScriptAccess = "always";

				// safe to call for 6.0r47 or greater
				version = axo.GetVariable("$version");

			} catch (e) {
			}
		}

		if (!version)
		{
			try {
				// version will be set for 4.X or 5.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = axo.GetVariable("$version");
			} catch (e) {
			}
		}

		if (!version)
		{
			try {
				// version will be set for 3.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = "WIN 3,0,18,0";
			} catch (e) {
			}
		}

		if (!version)
		{
			try {
				// version will be set for 2.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				version = "WIN 2,0,0,11";
			} catch (e) {
				version = -1;
			}
		}
		
		return version;
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
