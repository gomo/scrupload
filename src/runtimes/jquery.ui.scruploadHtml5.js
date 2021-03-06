(function($){
$.widget('ui.scruploadHtml5', {
  options: scrupload.defaultOptions({
    mutiple_select: true
  }),
  _create: function()
  { 
    var self = this;
    
    self.element.addClass("scr_html5_container");
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
    
    self.queue_array = [];
    self.selected_array = [];
    self.uploaded_array = [];
    self._createFormAndInput();   
  },
  _createFormAndInput: function()
  {
    var self = this,input_name;
    var form;
    
    input_name = self.options.file_post_name;
    if(self.options.mutiple_select)
    {
      self.input = $('<input type="file" name="'+input_name+'" multiple />');
    }
    else
    {
      self.input = $('<input type="file" name="'+input_name+'" />');
    }

    self.container = $("<div />");
    self.container.appendTo(self.element);
    form = $('<form method="post" enctype="multipart/form-data" />');
    form
      .appendTo(self.container)
      .append(self.input);
    
    scrupload.initButtonEvent(self, self.container);
    
    self.input.change(function(){
      
      var elem = this;
      setTimeout(function(){
        var url,
        filename = 'n/a',
        result,
        input = $(elem),
        file,
        next
        ;
      
        self.input.attr('disabled', 'disabled');
        
        self.element.addClass("scr_uploading");
        
        
        for(var i=0; i<elem.files.length; i++)
        {
          file = scrupload.createFile(elem.files[i], self.options);
          
          
          //postデータの作成
          fd = new FormData();
          fd.append(input_name, elem.files[i]);
          fd.append('id', file.id);
          fd.append('post_name', input_name);
          
          file.html5 = {
            formData: fd,
            uri: self.options.url,
            form: form
          };
          
          //type check
          scrupload.checkTypes(self, file);
          
          //size check
          scrupload.checkSize(self, file);
          
          self.selected_array.push(file);
        }
        
        self._trigger('onDialogClose', null, {
          element: self.element,
          runtime: self.runtime,
          selected: self.selected_array,
          options: self.options
        });
        
        $.each(self.selected_array, function(){
          var file = this;
          scrupload.onSelect(self, file);
          
          if(file.errors.length == 0)
          {
            self.queue_array.push(file);
          }
        });
        
        var ret = self._trigger('onStartUpload', null, {
          element: self.element,
          runtime: self.runtime,
          queue: self.queue_array,
          options: self.options
        });
        
        if(ret === false)
        {
          self._onComplete();
        }
        else
        {
          self._startNext(0);
        }
      }, 0);
    });
  },
  _upload: function(file)
  {
    var ret = this._onFileStart(file);
    if(ret === false)
    {
      this._onFileCancel(file);
      
      this._startNext(0);
    }
    else
    {
      for(var key in file.post)
      {
        if($.isArray(file.post[key]))
        {
          $.each(file.post[key], function(){
            file.html5.formData.append(key, this.toString());
          });
        }
        else
        {
          file.html5.formData.append(key, file.post[key]);
        }
      }
      
      //GET作成
      file.html5.uri = scrupload.buildUrlQuery(file.html5.uri, file.get);
      file.html5.form.attr("action", file.html5.uri);
      
      var xhr = new XMLHttpRequest();
      
      this._setAjaxEventListener(xhr, file);
      
      xhr.open("POST", file.html5.uri);
      xhr.send(file.html5.formData);
    }
  },
  _onFileStart: function(file)
  {
    return this._trigger('onFileStart', null, {
      element: this.element,
      runtime: this.runtime,
      file: file,
      options: this.options
    });
  },
  _onFileCancel: function(file)
  {
    this._trigger('onFileCancel', null, {
      element: this.element,
      runtime: this.runtime,
      file: file,
      options: this.options
    });
  },
  _setAjaxEventListener: function(xhr, file)
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
      
      var resp_json;
      try{ resp_json = $.parseJSON(event.target.responseText); }catch(err){};
      
      if(resp_json && resp_json.errors.length)
      {
        file.status = scrupload.FAILED;
        file.errors = resp_json.errors;
        self._trigger('onError', null, {
          element: self.element,
          file: file,
          runtime: self.runtime,
          options: self.options
        });
      }
      else
      {
        file.status = scrupload.DONE;
        self._trigger('onFileComplete', null, {
          element: self.element,
          runtime: self.runtime,
          file: file,
          response: event.target.responseText,
          json: resp_json,
          options: self.options
        });
        
        self.uploaded_array.push(file);
      }
      
      self._startNext(self.options.interval);
      /*if(self.queue_array.length == 0)
      {
        self._onComplete();
      }
      else
      {
        self._startNext(self.options.interval);
      }*/
    }, false);
  },
  _startNext: function(interval)
  {
    var self =this;
    next = self.queue_array.shift();
    
    if(next)
    {
      setTimeout(function(){
        self._upload(next);
      }, interval);
    }
    else
    {
      self._onComplete();
    }
  },
  _onComplete: function()
  {
    this.element.removeClass("scr_uploading");

    this._trigger('onComplete', null, {
      element: this.element,
      runtime: this.runtime,
      uploaded: self.uploaded_array,
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
