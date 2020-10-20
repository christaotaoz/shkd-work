代码说明文档(按逻辑顺序，以深圳问答为例，上海问答同理)

#获取深圳问答

```
get_SZ_Ask_Answer
参数：page 控制页面的页数
重要数据: 
		#原始网站地址
		base_url = http://irm.cninfo.com.cn/ircs/index/	
		#这是通过搜索关键字"股东人数"后筛选的并携带参数的网站地址
		url = http://irm.cninfo.com.cn/ircs/index/search?pageNo={}&pageSize=1000&searchTypes=11%2C&keyWord=%E8%82%A1%E4%B8%9C%E4%BA%BA%E6%95%B0&market=&industry=&stockCode=	注:获取url的方式，可通过在浏览器页面F12筛选后获取
		#股票码
        strComCodeArr = []
        #答
        strAnswerArr = []
        #问
        strAskArr = []
        #时间戳
        pubDateArr = []
        #时间戳
        updateDateArr = []
```

#初步筛选

```
writeShareholderCount
参数：strAskArr,strAnswerArr,strComCodeArr,pubDateArr,updateDateArr
作用:循环筛选，首先去除"答"为空的数据，然后去除如年份，月份，日分不合法数据，把经过格式化数据写入文件中。
```

#具体筛选

```
getFullTime
参数：strAskArr,strAnswerArr,strComCodeArr,pubDateArr,updateDateArr
说明：在此函数通过re模块制定筛选替换规则，最终返回格式化数据如 “时间”+"股票码"+“股东人数”
```

#去重

```
removeDuplicate
参数：无
作用：将写好的文件进行去重后重写
```

#排序

```
order
参数：无
作用：将去重后的文件进行排序后重写，并打印有效数据的个数
```

#发送邮件

```
AutoEmail
参数：无
作用:使用SMTP服务器发送邮件，可指定发件人，收件人，添加附件，邮件正文，邮件头 等信息
```

#日志处理

```
log
参数：message #合法数据
说明：将合法数据的原始问答记录在 '时间' + '-log.txt'中以备使用
```

#错误日志处理

```
参数：message #非法数据
说明：将非法数据的原始问答记录在 '时间' + '-error.txt'中以备使用
```



