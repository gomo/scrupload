#ディレクトリは任意に変更してください



cat /home/sites/sdx/js/lib/scrupload/jquery.scrupload.js\
 /home/sites/sdx/js/lib/scrupload/runtimes/jquery.ui.scruploadHtml4.js\
 /home/sites/sdx/js/lib/scrupload/runtimes/jquery.ui.scruploadSwfupload.js\
 /home/sites/sdx/js/lib/scrupload/jquery.ui.scrupload.js\
 > /home/sites/sdx/js/lib/scrupload/jquery.ui.scrupload.all.js
 
 
java -jar /home/sites/yuicompressor-2.4.2.jar /home/sites/sdx/js/lib/scrupload/jquery.ui.scrupload.all.js > /home/sites/sdx/js/lib/scrupload/jquery.ui.scrupload.all.min.js
 