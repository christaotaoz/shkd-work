#MongoDB的增删改查代码都存放在tasks文件中，本文档针对此文件做详细说明



函数

#增 add

```
参数：IMSI,UE_NUMS,APN
	IMSI 是用户的唯一标识，该参数不为空，是长度为14的整形值
	UE_NUMS 是新增用户的总个数，默认是1
	APN 默认是“Internet”
    ip  目标5GC的管理地址
返回值：无
函数用法:在蓝图中，指定implementation: mongo.mongo_task.tasks.add,通过蓝图创建一个名为add的部署，并在cloudify-stage的widget代码中指定部署为add,通过绑定该部署的页面接口即可调用此函数
函数描述：该函数通过ctx.node.properties方式取出页面上传的参数，并进行参数校验，主要调用python的pymongo库,通过pymongo的MongoClient方法连接目标主机的MongoDB数据库,通过bson库的ObjectID方法生成MongoDB数据库的Id并写入数据库，通过数据表对象myset的insert方法插入数据

```

#删 delete

```
参数：IMSI_1,IMSI_2
	IMSI_1 用户的唯一标识，该参数不为空，是长度为14的整形值
	IMSI_2 默认为空
    ip  目标5GC的管理地址
返回值：无
函数用法:在蓝图中，指定implementation: mongo.mongo_task.tasks.delete,通过蓝图创建一个名为delete的部署，并在cloudify-stage的widget代码中指定部署为delete,通过绑定该部署的页面接口即可调用此函数
函数描述：该函数通过ctx.node.properties方式取出页面上传的参数，并进行参数校验，会根据IMSI_2的值进行删除操作,如果IMSI_2为空，IMSI_1不为空且合法则仅删除IMSI为IMSI_1值的数据;若IMSI2不为空且合法,IMSI_1空且合法,则会删除IMSI的值在IMSI_1到IMSI_2之间的所有数据，通过数据表对象myset的delete_one方法删除数据
```

#改 update

```
参数：IMSI,APN,ip
	IMSI 是用户的唯一标识，该参数不为空，是长度为14的整形值
	APN 默认是“Internet”
    ip  目标5GC的管理地址
返回值：无
函数用法:在蓝图中，指定implementation: mongo.mongo_task.tasks.update,通过蓝图创建一个名为update的部署，并在cloudify-stage的widget代码中指定部署为update,通过绑定该部署的页面接口即可调用此函数
函数描述：该函数通过ctx.node.properties方式取出页面上传的参数，并进行参数校验，主要调用python的pymongo库,通过pymongo的MongoClient类实例化对象并通过数据表对象myset的update_one方法进行更新数据
```

#查  read

```
参数：ip
	ip 目标交换机的管理地址
返回值：无
函数用法:在蓝图中，指定implementation: mongo.mongo_task.tasks.read,通过蓝图创建一个名为read的部署，并在cloudify-stage的widget代码中指定部署为read,通过绑定该部署的页面接口即可调用此函数
函数描述：该函数通过ctx.node.properties方式取出页面上传的参数，通过python的re模块匹配合法的ip,根据输入的ip进行查询，首先会清空postgres的user_account_status表，然后将查询到的结果显示在UCM界面上。
```

#huaweiSwitch

```
参数：ip
	ip 目标交换机的管理地址
返回值：无
函数用法:在蓝图中，指定implementation: mongo.mongo_task.tasks.huaweiSwitch,通过蓝图创建一个名为huaweiSwitch的部署，并在cloudify-stage的widget代码中指定部署为huaweiSwitch,通过绑定该部署的页面接口即可调用此函数
函数描述：该函数通过ctx.node.properties方式取出页面上传的参数，通过python的re模块匹配合法的ip,通过napalm模块对华为交换机进行一键配置操作,注意配置文件的路径要和实际路径匹配
```

