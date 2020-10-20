## QoS规则

主要展示以下qos规则参数：

- **qos规则名字**
- **wan线路**：wan线路名字
- **方向**：上行，下行，双向
- **内网限速**：限速值
- **TCP连接数**：最大TCP连接数
- **UDP连接数**：最大UDP连接数
- **总连接数**：总连接数
- **网关列表**：配置过的网关列表

提供一个新建QoS规则按钮：

- 新建QoS规则：绑定名字为bp_qos的蓝图文件，接受用户输入以下参数：

  **qos_rule_name**：qos规则名字，任意字符。

  **wan_line**：qos规则作用的wan线路名字。

  **direction**：qos规则作用的wan线路方向，in（下行）、out（上行）、both（双向）。

  **ip_rate**：内网限速，单位kbps。
  
  **max_tcp_session**：最大TCP连接数
  
  **max_udp_session**：最大UDP连接数
  
  **max_total_session**：最大总连接数

#### widget参数设置：

- **定时刷新**：关闭

- **分页大小**：5

- **排序**：按照QoS规则名字升序排序

  



注：新建qos规则时，部署ID为前缀qos+新建qos规则的名字

