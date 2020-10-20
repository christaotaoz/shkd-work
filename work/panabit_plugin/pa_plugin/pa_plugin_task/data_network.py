#-*- coding:utf-8 -*-
########
# Copyright (c) 2014 GigaSpaces Technologies Ltd. All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
#    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    * See the License for the specific language governing permissions and
#    * limitations under the License.
# ctx is imported and used in operations
#网络接口的修改代码
import os
import json
from cloudify import ctx
import requests
# put the operation decorator on any function that is a task
from cloudify.decorators import operation


# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml

@operation
def update(**kwargs):
    ctx.logger.info('............start task: update data network............')
    login_ip = ctx.node.properties['connection_config'].get('host')                    #从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')        #从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')    #获取密码
    mode = ctx.node.properties['application_mode']                  #获取网卡的引用模式‘0’表示监控模式，“1,2,3,4”表示对应的网桥模式
    interface= ctx.node.properties['interface']                     #表示对应的网卡名称 'em0' 或者 “le0”
    type=ctx.node.properties['type']                                #表示接入位置 “inside”表示内网，“outside”“表示外网”


    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= ' + login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    if type == 'outside':
    	url_wan = 'https://' + login_ip +'/cgi-bin/Setup/if_edit?ifname=' + interface
    	post_data = {'mode': mode, 'zone': 'outside', 'peer': 'none', 'ifname': interface}
    	resp = requests.post(
            url_wan, verify=False, cookies=cookie_jar, data=post_data
    	)
    	status = resp.status_code
    	ctx.logger.info('POST, url= '+ url_wan)
    	ctx.logger.info('status code = '+ str(status))
    elif type == 'inside':
        url_lan = 'https://' + login_ip +'/cgi-bin/Setup/if_edit?ifname=' + interface
        post_data = {'mode': mode, 'zone': 'inside', 'peer': 'none', 'ifname': interface}
        resp = requests.post(
    	    url_lan,verify=False,cookies=cookie_jar,data=post_data
        )
        status = resp.status_code
        ctx.logger.info('POST, url= '+ url_lan)
        ctx.logger.info('status code = '+ str(status))
    else:
        raise NonRecoverableError(
            "Set data network fail, {type} is invaild."
            "checkout {type} is between outside or inside"
            "".format(type=type)
        )

    cookie_jar.clear()
    ctx.logger.info('finish task: update data network')

