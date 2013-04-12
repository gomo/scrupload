#!/bin/sh

repo_dir=$(cd $(dirname $0);pwd)
rm ${repo_dir}/js/jquery.ui.scrupload.all.js
rm ${repo_dir}/js/jquery.ui.scrupload.all.min.js
rm ${repo_dir}/js/widgets/jquery.ui.scropThumb.min.js

cat ${repo_dir}/src/jquery.scrupload.js\
 ${repo_dir}/src/runtimes/jquery.ui.scruploadHttp.js\
 ${repo_dir}/src/runtimes/jquery.ui.scruploadHtml4.js\
 ${repo_dir}/src/runtimes/jquery.ui.scruploadHtml5.js\
 ${repo_dir}/src/jquery.ui.scrupload.js\
 > ${repo_dir}/js/jquery.ui.scrupload.all.js\
&& java -jar ~/lib/yuicompressor-2.4.7.jar\
 ${repo_dir}/js/jquery.ui.scrupload.all.js\
 > ${repo_dir}/js/jquery.ui.scrupload.all.min.js\
&& java -jar ~/lib/yuicompressor-2.4.7.jar\
 ${repo_dir}/src/widgets/jquery.ui.scropThumb.js\
 > ${repo_dir}/js/widgets/jquery.ui.scropThumb.min.js 