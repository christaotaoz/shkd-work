##### 版本需求：

```
x86：
    centos : CentOS Linux release 7.6.1810 (Core)
    docker: Docker version 19.03.1, build 74b1e89
```



```
arm: 
    debain : Debian Buster with Armbian Linux
    docker : Docker version 19.03.4, build 9013bf5
```



##### x86安装docker:

1. ```
   sudo yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2
   ```

2. ```
   sudo yum-config-manager \
           --add-repo \
           https://download.docker.com/linux/centos/docker-ce.repo
   ```

3. ```
   sudo yum install docker-ce docker-ce-cli containerd.io
        如果提示接受GPG密钥，请验证指纹是否匹配
            060A 61C5 1B55 8A7F 742B 77AA C52F EB6B 621E 9F35，
        如果匹配，则接受该指纹 。
   ```

4. ```
   sudo systemctl start docker
   ```

   

##### arm安装docker :

1. 更换国内Armbian源：

   ```
   vi /etc/apt/sources.list
   ```

2. 在原先的源前面加#号注释掉，并将国内源复制过去（选一）

   ```
   中科大源
   deb http://mirrors.ustc.edu.cn/debian stretch main contrib non-free
   deb http://mirrors.ustc.edu.cn/debian stretch-updates main contrib non-free
   deb http://mirrors.ustc.edu.cn/debian stretch-backports main contrib non-free
   deb http://mirrors.ustc.edu.cn/debian-security/ stretch/updates main contrib non-free
   清华源
   deb [ arch=arm64,armhf ] https://mirrors.tuna.tsinghua.edu.cn/debian/ stretch main contrib non-free
   deb [ arch=arm64,armhf ] https://mirrors.tuna.tsinghua.edu.cn/debian/ stretch-updates main contrib non-free
   deb [ arch=arm64,armhf ] https://mirrors.tuna.tsinghua.edu.cn/debian/ stretch-backports main contrib non-free
   deb [ arch=arm64,armhf ] https://mirrors.tuna.tsinghua.edu.cn/debian-security/ stretch/updates main contrib non-free
   ```

3. ```
   apt-get update
   ```

4. ```
   apt-get install \
       apt-transport-https \
       ca-certificates \
       curl \
       gnupg2 \
       software-properties-common
   ```

5. ```
   curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
   ```

6. ```
   apt-key fingerprint 0EBFCD88
   ```

7. ```
   add-apt-repository \
      "deb [arch=arm64] https://download.docker.com/linux/debian \
      $(lsb_release -cs) \
      stable"
   ```

8. ```
   apt-get update
   ```

9. ```
   apt-get install docker-ce docker-ce-cli containerd.io
   ```

   

##### 修改docker镜像仓库到本地：

```
在 /etc/docker/daemon.json 中设置编辑写入：

    {
    "insecure-registries": ["192.168.4.75:5000"]
    }

然后重启docker服务
	systemctl restart docker.service    
设置docker开机自启动
	systemctl enable docker
```



##### 分版本从本地仓库拉取ucm镜像并运行

```
x86：
	docker run --name ucm-x -d --restart unless-stopped -v /sys/fs/cgroup:/sys/fs/cgroup:ro --tmpfs /run --tmpfs /run/lock --security-opt seccomp:unconfined --cap-add SYS_ADMIN -p 80:80 -p 8000:8000 192.168.4.75:5000/ucm:1.0
```

```
arm：
	docker run --name ucm-x -d --restart unless-stopped -v /sys/fs/cgroup:/sys/fs/cgroup:ro --tmpfs /run --tmpfs /run/lock --security-opt seccomp:unconfined --cap-add SYS_ADMIN -p 80:80 -p 8000:8000 192.168.4.75:5000/ucm_arm:1.1
```

docker运行后从浏览器打开ucm界面，执行后续操作。

**进入docker环境**

```
#查看容器ID
docker ps 
docker exec -it 容器ID bash	
cd /home	
```

**克隆相关代码**

```
yum -y install git	
git clone http://192.168.4.221:30000/christaotao/doc.git
cd doc/	
```

# 按项目划分

## **srv6+4G**

1. cd srv6+4G/	#项目目录
2. **分版本上传文件**	

- x86版

  ```
  cd /home/doc/srv6+4G/x86/
  
  #上传插件
  cd srv6
  cfy plugin upload -y plugin.yaml srv6_plugin-1.0-py27-none-linux_x86_64.wgn
  cd ../vsphere/
  cfy plugin upload -y plugin.yaml cloudify_vsphere_plugin-2.17.0-py27-none-linux_x86_64.wgn
  
  #上传蓝图
  cd ../../blueprints/
  cfy blu upload create_srv6.yaml -b srv6
  cfy blu upload magma.yaml -b magma
  
  #创建部署
  cfy dep create srv6 -b srv6
  cfy dep create magma -b magma
  
  #执行工作流
  cfy exe start install -d srv6
  cfy exe start install -d magma
  ```

  

- arm版

  ```
  cd /home/doc/srv6+4G/arm/
  
  #上传插件
  cd srv6
  cfy plugin upload -y plugin.yaml srv6_plugin-1.0-py27-none-linux_aarch64.wgn
  cd ../vsphere/
  cfy plugin upload -y plugin.yaml cloudify_vsphere_plugin-2.17.0-py27-none-linux_aarch64.wgn
  
  #上传蓝图
  cd ../../blueprints/
  cfy blu upload create_srv6.yaml -b srv6
  cfy blu upload magma.yaml -b magma
  
  #创建部署
  cfy dep create srv6 -b srv6
  cfy dep create magma -b magma
  
  #执行工作流
  cfy exe start install -d srv6
  cfy exe start install -d magma
  ```

  

## **srv6+win**

1. cd srv6+win/	#项目目录
2. **分版本上传文件**	

- x86版

  ```
  cd /home/doc/srv6+win/x86/
  
  #上传插件
  cd srv6
  cfy plugin upload -y plugin.yaml srv6_plugin-1.0-py27-none-linux_x86_64.wgn
  cd ../vsphere/
  cfy plugin upload -y plugin.yaml cloudify_vsphere_plugin-2.17.0-py27-none-linux_x86_64.wgn
  
  #上传蓝图
  cd ../../blueprints/
  cfy blu upload create_srv6.yaml -b srv6
  cfy blu upload win10.yaml -b win10
  
  #创建部署
  cfy dep create srv6 -b srv6
  cfy dep create win10 -b win10
  
  #执行工作流
  cfy exe start install -d srv6
  cfy exe start install -d win10
  ```

  

- arm版

  ```
  cd /home/doc/srv6+win/arm/
  
  #上传插件
  cd srv6
  cfy plugin upload -y plugin.yaml srv6_plugin-1.0-py27-none-linux_aarch64.wgn
  cd ../vsphere/
  cfy plugin upload -y plugin.yaml cloudify_vsphere_plugin-2.17.0-py27-none-linux_aarch64.wgn
  
  #上传蓝图
  
  cd ../../blueprints/
  cfy blu upload create_srv6.yaml -b srv6
  cfy blu upload win10.yaml -b win10
  
  #创建部署
  cfy dep create srv6 -b srv6
  cfy dep create win10 -b win10
  
  #执行工作流
  cfy exe start install -d srv6
  cfy exe start install -d win10
  ```

  测试结果：
  
  ​	exsi地址 192.168.4.236  
  
  ​	exsi版本 6.7.0 Update 3 (Build 15160138)
  
  ​	arm ucm地址 192.168.4.223
  
  ​	x86 ucm地址  192.168.4.201
  
  ​	ucm用户名：admin
  
  ​	ucm密码：admin
  
  ​	vSphere地址 192.168.4.83
  
  ​	vSphere用户名：administrator@zjslab.local
  
  ​	vSphere密码: Zijinshan001&
  
  ​	模板地址：192.168.4.250 
  
  ​	模板名称：
  
  ​     				srv6：open-186
  
  ​					magma：magma-ok-1（magma版本：1.0.0）
  
  ​					win10:win10-muban
  
  ​	（arm和centos系统虚拟机安装时间以及docker安装时间不包含在内，只记录ucm运行时间）
  
  ​	srv6用户名密码root/Zijinshan001&
  
  ​	magma系统用户密码：magma
  
  ​	window系统用户密码：Zijinshan001&
  
  ​	**arm系统装srv6+magma环境用时：10分钟**
  
  ​	ip地址：192.168.16.187
  
  ​	**arm系统装srv6+win环境用时：17分钟**
  
  ​	ip地址：192.168.16.173
  
  ​	**x86系统装srv6+magma环境用时：11分钟**
  
  ​	ip地址：192.168.16.237
  
  ​	**x86系统装srv6+win环境用时：12分钟**
  
  ​    ip地址：192.168.16.135
  
  ​																																		验收人：蔡智成
  
  ​																																			2020/4/9
  
  