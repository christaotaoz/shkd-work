安装anbile

```
yum install ansible

#使用密钥连接

#ssh-keygen -t rsa

#ssh-copy-id -i ~/.ssh/id_rsa.pub root@192.168.4.82

vi /etc/ansible/hosts

​	[node-1]

​	192.168.4.82 ansible_ssh_user=root

#检测ansible单个命令是否生效

ansible node-1 -m ping 
```



ansible的使用

下载源码

```
git clone https://github.com/cloudify-cosmo/cloudify-ansible-plugin.git

cd cloudify-ansible-plugin

mkdir myplaybooks

cd  myplaybooks
```

playbook

```
vi myplaybook.yaml

- hosts: 192.168.10.109
  tasks:
    - name: bbu2.6
      shell: cd /root/;source bbu26d;
      async: 300
      poll: 0
```

blueprint

```
cd ..

vi myblueprint.yaml

tosca_definitions_version: cloudify_dsl_1_3

imports:
  - types.yaml
  - plugin:cloudify-ansible-plugin

node_templates:
  my_node:
    type: cloudify.nodes.Root
    interfaces:
      cloudify.interfaces.lifecycle:
        create:
          implementation: ansible.cloudify_ansible.tasks.run
          inputs:
            site_yaml_path: myplaybooks/myplaybook.yaml
            sources: hosts
```

hosts

```
vi hosts

192.168.4.63 ansible_ssh_user=root ansible_ssh_pass=123456
```



上传蓝图插件

```
cfy dep del bbu26d -f
cfy blu del bbu26 -f
cfy blu upload mytest.yaml -b bbu26
cfy dep create bbu26d -b bbu26
cfy exe start install -d bbu26d
```



