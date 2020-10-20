#!/bin/bash 

eval "rm -f pa_plugin.tar.gz"
eval "rm -f pa_plugin-1.0-py27-none*.wgn"
eval "tar -zcvf pa_plugin.tar.gz pa_plugin/"
eval "wagon create pa_plugin.tar.gz"
#eval "cfy plugins upload -y pa_plugin/plugin.yaml pa_plugin-1.0-py27-none-linux_x86_64.wgn"



