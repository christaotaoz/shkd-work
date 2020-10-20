app/szshareholders.py

这是一个Python的脚本，配置运行后可以爬取深圳上海证券交易所里面的股东人数信息最后将爬取的数据并以一定的格式写入本地XX.txt文本保存,原始问题保存在本地的XX_log.txt文件中已备查看

**环境需求:**

```
Linux ,python3
```

**环境安装：**

安装python3

```
1.安装gcc编译器(gcc --version查看是否安装)
yum -y install gcc

2.安装依赖包(python3.7.0以下可不装libffi-devel)
yum -y install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel libffi-devel

3.下载源码(3.6.5)
wget https://www.python.org/ftp/python/3.6.5/Python-3.6.5.tar.xz

4.解压安装包
tar -xvf Python-3.6.5.tar.xz

5.创建文件夹
mkdir /usr/local/python3

6.执行配置文件，编译，编译安装
cd Python-3.6.5
./configure --prefix=/usr/local/python3
make && make install
安装完成不报错即安装成功

7.创建软链接
ln -s /usr/local/python3/bin/python3.6 /usr/bin/python3
ln -s /usr/local/python3/bin/pip3.6 /usr/bin/pip3

8.测试Python3是否可用
python3

```



安装python库

	本项目使用的是Python3.6.7版本(请确保在python3的环境下运行本文件！)
	基本库urllib, re，json,time(内置无需安装)
	urllib用来抓取网页内容：
	from urllib import request
	​		 	req = request.Request(url,data={},headers={},method='POST'）	
	​			 response = request.urlopen(req,timeout=10)
	
	由于部分抓取的json文件是压缩的，需要安装zlib解压：
	$ pip3 install zlib
	​			import zlib
	​			html = zlib.decompress(response,16+zlib.Max_WBITS)
	
	解析库Xpath安装使用方式：
	$ pip3 install lxml
	​			from lxml import etree
	​			hmtl = etree.HTML('从网页上抓取的数据')
	​			'Xpath匹配的内容' = html.xpath('正则表达式')




用法：

	Linux环境下打开终端，切换到app目录下，输入命令：
	$ python3 szshareholders.py
	
	即可爬取深圳上海最新10000+条数据，并打印有效数据的个数，可在main函数里设置循环次数
	可直接在命令行输入最后截止年份(默认为2018)以及月份(默认是1月)，年份参数为2017~2050,月份参数为1~12，如：
	$ python3 szshareholders.py 2019 1

​			

定时任务的设置

```
# crontab -l
//设置每周二上午8点执行一次代码
0 8 * * 2 python3 /doc/stock/szshareholders.py 2019
更多定时任务的用法参考本目录下的crontab.md
```



发送邮件的异常处理

```
未设置客户端授权密码出现的报错： SMTPAuthenticationError: (550, b’User has no permission’)
该问题是由于未设置授权密码出错，具体解决办法如下
登录邮箱，开启SMTP服务并将授权码传入代码中
  # 登录邮箱
  mailServer.login(Sender, passwd)  # 需要的是，邮箱的地址和授权密码
```
