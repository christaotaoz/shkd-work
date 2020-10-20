需求描述:
    1.需要通过vSphere插件自动启一台Pa
    2.通过在vShere插件,自动在ESXI中创建端口组，虚拟交换机
    
    
问题描述:
    1.通过蓝图获取输入参数指定模板名称,vSphere的用户名、密码、主机地址、端口号、数据中心，Pa的ip地址、lan口地址、登录名、密码；

​	在蓝图中创建vr_man,vr_wan,vr_lan,VR,VR_conf共5个节点；其中vr_man,vr_man,vr_lan分别对应端口组vr_man,vr_man,vr_lan，其中vr_lan连接虚拟交换机vSwitch1,vr_man和vr_wan连接虚拟交换机vSwitch0,目前这两个虚拟交换机vSwitch0和vSwitch1以及端口组vr_man,vr_man,vr_lan必须先在ESXi中手动创建成功，否则不能正常运行。需要使用vSphere插件自动启端口组和虚拟交换机。

```
vr_man:
    type: cloudify.vsphere.nodes.Network
    properties:
      network:
        name: 'vr_man'
        vswitch_name: vSwitch0
vr_wan:
    type: cloudify.vsphere.nodes.Network
    properties:
      network:
        name: 'vr_wan'
        vswitch_name: vSwitch0
vr_lan:
    type: cloudify.vsphere.nodes.Network
    properties:
      network:
        name: 'vr_lan'
        vswitch_name: vSwitch1
```



​	2.在蓝图的VR节点中指定网络连接的顺序是vr_man,vr_wan,vr_lan,自动化启pa的实际网络连接顺序为vr_wan,vr_man,vr_lan

```
 vR:
    type: cloudify.vsphere.nodes.Server
    properties:
    	networking:
    	connect_networks:
          - name: vr_man
            switch_distributed: false
            use_dhcp: true
          - name: vr_wan
            switch_distributed: false
            use_dhcp: true
          - name: vr_lan
            switch_distributed: false
            use_dhcp: true
```

