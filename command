#ディレクトリは任意に変更してください


cat /home/sites/www.artists-navi.com/web/scrupload/src/jquery.scrupload.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadHttp.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadHtml4.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadHtml5.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadSwfupload.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/jquery.ui.scrupload.js\
 > /home/sites/www.artists-navi.com/web/scrupload/src/jquery.ui.scrupload.all.js



cat /home/sites/www.artists-navi.com/web/scrupload/src/jquery.scrupload.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadHttp.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadHtml4.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadHtml5.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/runtimes/jquery.ui.scruploadSwfupload.js\
 /home/sites/www.artists-navi.com/web/scrupload/src/jquery.ui.scrupload.js\
 > /home/sites/www.artists-navi.com/web/scrupload/src/jquery.ui.scrupload.all.js\
&& java -jar /home/sites/yuicompressor-2.4.2.jar\
 /home/sites/www.artists-navi.com/web/scrupload/src/jquery.ui.scrupload.all.js\
 > /home/sites/sdx/js/lib/scrupload/jquery.ui.scrupload.all.min.js\
&& java -jar /home/sites/yuicompressor-2.4.2.jar\
 /home/sites/www.artists-navi.com/web/scrupload/src/widgets/jquery.ui.scropThumb.js\
 > /home/sites/sdx/js/lib/scrupload/widgets/jquery.ui.scropThumb.min.js
 