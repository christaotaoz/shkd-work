## 新增用户

#### 主要展示新增用户账号按钮

#### 根据需求需要创建一个名为add_user的部署：

- **新增用户账号**：该按钮绑定名字为add_user_with_att.yaml的蓝图文件，接受用户输入

  **groupname**     				   ：	用户组名字，需要网关已经存在该用户组

  **password**        				    ：	用户密码，任意字符

  **user_name**					 ：	用户名，作为登录账号，不可重复，避免特殊词汇

  **Max-Mouthly-Session-Value** 	: 	 每月最大时间，单位为小时

  **Max_Monthly_Traffic_value**          ：	每月最大流量，单位为MB

  **Max_all_session_value** 		   :	  最大上网时长，单位为小时

  **login_time_value**      		        ：       允许登录时间段，工作日时间段/周末时间段，										示例：（07:00-19:00/03:00-23:00）

#### widget参数设置：

- **定时刷新**：关闭

- **页面位置**：业务运营

  





