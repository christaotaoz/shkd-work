1. 如果没有安装panabit plugin，安装pa_plugin-1.0-py27-none-linux_x86_64.wgn和plugin.yaml
2. 上传blueprints，在目录related_blueprints中
bp_address_pool.yaml
bp_data_network.yaml
bp_kvm_panabit.yaml
bp_manager_network.yaml
bp_policy_route.yaml
bp_pppoe.yaml
bp_radius.yaml
bp_route.yaml
3. 用bp_data_network举例，上传 bp_data_network.yaml后，本地模板页面出现 bp_data_network
4. 点击 bp_data_network，创建部署，name为test_data_network_update，
application mode=1
interface为em10
type为inside
host为192.168.4.39 （panabit的host）
login name=admin
login password=panabit
输入好后，点击部署，等待部署完成，部署管理里显示绿色√号
5. 点击 bp_data_network，进入详情页面，点击执行工作流，install操作，查看日志，部署已经成功应用到panabit虚机中
21-04-2019 23:51:41.819	Info	nic1	nic1_lrs13t	install	cloudify.interfaces.lifecycle.create	status code = 200
21-04-2019 23:51:41.819	Info	nic1	nic1_lrs13t	install	cloudify.interfaces.lifecycle.create	finish task: update data network
21-04-2019 23:51:41.363	Info	nic1	nic1_lrs13t	install	cloudify.interfaces.lifecycle.create	POST, url= https://192.168.4.39/login/userverify.cgi
21-04-2019 23:51:41.363	Info	nic1	nic1_lrs13t	install	cloudify.interfaces.lifecycle.create	status code = 200
21-04-2019 23:51:41.819	Info	nic1	nic1_lrs13t	install	cloudify.interfaces.lifecycle.create	POST, url= https://192.168.4.39/cgi-bin/cfy/Setup/if_edit?ifname=em10
6. 删除部署，需要执行uninstall操作，然后delete 部署bp_data_network，如果要删除blueprint模板，进入本地模板页面，删除bp_data_network即可。




分支使用方法

查看全部分支
git branch -a 

	$ git branch -a
	* master
 	remotes/origin/HEAD -> origin/master
  	remotes/origin/master
  	remotes/origin/standard
切换到远程分支
git checkout  remotes/origin/standard

创建本地同名分支
git checkout -b standard

和远程分支建立联系
git branch --set-upstream-to=origin/standard

拉取分支
git pull


切换到主分支
git checkout master

切换到标准版分支
git checkout standard


1
