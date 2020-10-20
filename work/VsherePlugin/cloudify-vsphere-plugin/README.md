vSphere插件使用说明

1.创建虚机蓝图

```
#创建SRV6虚机
  SRV6:
    type: cloudify.vsphere.nodes.Server	//虚机的节点类型
    properties:
      use_external_resource: false	//是否用外部资源
      connection_config: *connection_config	//读取蓝图的配置属性
      agent_config:	//客户端配置
        install_method: none	//默认安装方式为none
      server:	//虚机节点
        name: srv6	//虚机名称
        template: { get_input: vcenter_template_name }	//使用指定模板
        cpus: 1	//cpu个数
        memory: 256	//内存大小，默认单位为M
      networking:	//网络节点
        connect_networks:	
          - name: { get_property: [ P-lan, network, name ] }	//LAN连接
            management: true	//管理口
          - name: { get_property: [ P-wan, network, name ] }	//WAN连接
            management: false
```

2.创建虚拟交换机，端口组

```
 nic3:	
    type: cloudify.vsphere.nodes.NIC	//网卡类型节点
    properties:
      connection_config: *connection_config
      name: { get_property: [ P-wan, network, name ] }	//获取P-wan节点的network属性的name的值
      switch_distributed: false	//默认为false
      #adapter_type: E1000
      adapter_type: Vmxnet3	//网卡类型，一般是Vmxnet3
      start_connected: true	//设置虚机开始自动连接端口组
      network_configuration:
        use_dhcp: true	//默认使用dhcp
    relationships:
      - type: cloudify.relationships.vsphere.nic_connected_to_network
        target: P-wan
 
 P-wan:
    type: cloudify.vsphere.nodes.Network	//网络节点类型
    properties:
      connection_config: *connection_config
      network:	//设置网络属性
        name: port_srv6_wan		//虚拟端口组名称
        vlan_id: 0	//选择vlan_id 默认为0
        vswitch_name: vswitch_srv6_wan	//虚拟交换机名称
        nicdevice: { get_input: srv6_wan_vmnic }	//网卡名称,注意该网卡上不能被占用，否则会创建失败
        switch_distributed: false	//分布式交换机，默认为否

```

3.vcenter添加ESXI

```
esxi:
    type: cloudify.vsphere.nodes.Host	//ESXI节点类型
    properties:	
      name: { get_input: esxi_ip }	//获取蓝图输入
      use_existing_resource: false	//是否使用已存在资源，默认为否
      use_external_resource: false	//是否使用外部资源,默认为否
      connection_config: *connection_config
```

4.配置节点

```
 dsl_definitions:
     connection_config: &connection_config
        esxi_ip: { get_input: vcenter_esxi_ip }	//获取蓝图输入	esxi ip地址
        esxi_username: root	//esxi 用户名
        esxi_password: Zijinshan001&	//esxi 密码
        host: { get_input: vcenter_ip }	//	vcenter ip地址
        username: { get_input: vcenter_username }	//获取蓝图输入	vcenter的用户名
        password: Zijinshan001&	//vcenter的密码
        datacenter_name: { get_input: vcenter_datacenter_name }	//指定数据中心,如果该数据中心不存在,则会新建
        resource_pool_name: { get_input: vcenter_resource_pool_name }	//指定资源池,如该资源池不存在,则会新建
        auto_placement: true	//默认为true
        allow_insecure: true	//默认为true
```

