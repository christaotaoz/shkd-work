## 防火墙

主要展示以下防火墙参数：

- **策略编号**
- **内网IP**
- **内网端口**
- **外网IP**
- **外网端口**
- **协议**
- **方向**
- **操作**
- **网关列表**：配置过的网关列表

根据需求需要提供新增、删除、更新按钮，绑定名字为bp_firewall的蓝图文件：

- **新增**：以firewall+policy_id作为部署名称，新建的时候执行创建部署和执行install工作流两步操作，新建输入参数名称如下：

  **action**：输入permit（允许）或者deny（阻止）

  **external_ip**:外网IP，支持格式xxx.xxx.xxx.xxx/n和xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx，不区分IP的时候输入any

  **external_port:**外网端口

  **internal_ip:**内网IP，支持格式xxx.xxx.xxx.xxx/n和xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx，不区分IP的时候输入any

  **internal_port:**内网端口

  **policy_id**:策略编号，参数范围1-1000

  **protocol**:协议，支持UDP、TCP和PPP，不区分协议填写any

  **direction:**方向，支持输入out（上行）、in（下行）和both（双向）

  **关闭弹窗**：输入true（是）或者false（否）分别表示关闭弹窗和不关闭弹窗

- **更新**：修改除“policy_id”外的所有输入参数，policy_id只支持删除后新增

- **删除**：执行uninstall工作流并删除部署

  


#### widget参数设置：

- **定时刷新**：关闭

- **分页大小**：5

- **排序**：按照策略编号升序排列

  





