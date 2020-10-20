docker基础命令

```
#容器生命周期管理

创建并启动容器(如本地不存在镜像则去docker仓库里去拉取)
docker run
使用docker镜像nginx:latest以后台模式启动一个容器,并将容器命名为mynginx
eg: docker run --name mynginx -d nginx:latest
使用镜像nginx:latest以交互模式启动一个容器,在容器内执行/bin/bash命令
eg: docker run -it nginx:latest /bin/bash
绑定容器的 8080 端口，并将其映射到本地主机 127.0.0.1 的 80 端口上(主机端口:容器端口)
eg: docker run -p 127.0.0.1:80:8080/tcp ubuntu bash
启动镜像ucm3.0
eg: sudo docker run --name ucm3.0 -d --restart unless-stopped -v /sys/fs/cgroup:/sys/fs/cgroup:ro --tmpfs /run --tmpfs /run/lock --security-opt seccomp:unconfined --cap-add SYS_ADMIN -p 80:80 -p 8000:8000 ucm3.0:3.0

创建新容器
docker create

重命名容器
docker rename  old_name new_name

启动/停止/重启 已存在的容器
docker start/stop/restart 

删除容器
docker rm 

查看所有容器信息
docker ps
eg: docker ps -a

进入容器
docker exec 
eg: docker exec -it 容器ID /bin/bash

#镜像操作

从docker仓库拉取镜像
docker pull 


#镜像容器实用操作

从容器创建一个新的镜像
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
eg: docker commit -a "author" -m "message" a404c6c174a2  mymysql:v1


镜像导出
docker save
eg: docker save -o my_ubuntu_v3.tar runoob/ubuntu:v3

镜像导入
docker load
eg: docker load < busybox.tar.gz
eg: docker load --input fedora.tar


参考文档https://www.runoob.com/docker/docker-run-command.html

```



FAQ

```
#docker run 和 docker start 的区别？

docker start 是启动已存在的容器
docker run 是创建并启动容器(如本地不存在镜像则去docker仓库里去拉取)
```

