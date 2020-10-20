eval "rm -f cloudify-vsphere-plugin.tar.gz"
eval "rm -f cloudify_vsphere_plugin-2.17.0-py27-none-linux_x86_64.wgn"

eval "tar -zcvf cloudify-vsphere-plugin.tar.gz cloudify-vsphere-plugin"
eval "wagon create cloudify-vsphere-plugin.tar.gz -f"
eval "cfy plu upl -y cloudify-vsphere-plugin/plugin.yaml cloudify_vsphere_plugin-2.17.0-py27-none-linux_x86_64.wgn"
