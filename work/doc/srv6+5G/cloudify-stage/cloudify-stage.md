本地测试没有问题之后：

 step1：进入docker找到cloudify-stage目录位置关闭cloudify-stage服务

# cd /opt/cloudify-stage
# systemctl stop cloudify-stage.service
 step2：将本地cloudify-stage 打包

（local）# cd cloudfy-stage
（local）# npm run build
（local）# npm run zip
 step3：先将docker里已存在的cloudify-stage重命名或删除后，将打包文件放到docker里opt目录下解压

# tar -xvf stage.tar.gz
 step4：完成setp3会生成cloudify-stage文件夹，需做以下处理：

     4.1 权限修改：修改cloudify-stage的权限

# chown -R stage_user:stage_group /opt/cloudify-stage
     4.2 Ip修改：将conf/me.json 和 backend/consts.js 中的 ip 改为 127.0.0.1

 step5：启动cloudify-stage.service,启动完刷新ucm界面，并重置模板即可看到效果

# systemctl start cloudify-stage.service