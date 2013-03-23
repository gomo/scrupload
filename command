cat src/jquery.scrupload.js\
 src/runtimes/jquery.ui.scruploadHttp.js\
 src/runtimes/jquery.ui.scruploadHtml4.js\
 src/runtimes/jquery.ui.scruploadHtml5.js\
 src/runtimes/jquery.ui.scruploadSwfupload.js\
 src/jquery.ui.scrupload.js\
 > /home/sites/sdx/js/lib/scrupload/jquery.ui.scrupload.all.js

cat src/jquery.scrupload.js\
 src/runtimes/jquery.ui.scruploadHttp.js\
 src/runtimes/jquery.ui.scruploadHtml4.js\
 src/runtimes/jquery.ui.scruploadHtml5.js\
 src/jquery.ui.scrupload.js\
 > js/jquery.ui.scrupload.all.js



cat src/jquery.scrupload.js\
 src/runtimes/jquery.ui.scruploadHttp.js\
 src/runtimes/jquery.ui.scruploadHtml4.js\
 src/runtimes/jquery.ui.scruploadHtml5.js\
 src/jquery.ui.scrupload.js\
 > js/jquery.ui.scrupload.all.js\
&& java -jar lib/yuicompressor-2.4.7.jar\
 js/jquery.ui.scrupload.all.js\
 > js/jquery.ui.scrupload.all.min.js\
&& java -jar lib/yuicompressor-2.4.7.jar\
 src/widgets/jquery.ui.scropThumb.js\
 > js/widgets/jquery.ui.scropThumb.min.js
 