修改mcs
终端和rru的距离不一样，要修改mcs做匹配

修改操作如下
登录bbu 如ssh192.168.8.106
找到  find /-name   TR192_gNodeB_DU_Data_Model.xml
查看已存在的mcs 的上行（ul）下行（dl）值
grep InitDlMcs TR192_gNodeB_DU_Data_Model.xml
grep InitUlMcs TR192_gNodeB_DU_Data_Model.xml
根据实际情况调整mcs的值（0-28）
如北京bbu ul 24 dl 5