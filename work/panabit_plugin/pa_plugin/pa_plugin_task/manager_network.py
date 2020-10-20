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
    ctx.logger.info('............start task:Initializing Settings............')
    login_ip = ctx.node.properties['connection_config'].get('host')  # 从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')  # 从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')  # 获取密码
    new_login_name = ctx.node.properties['new_login_name']  # 获取新登录账户
    new_login_password = ctx.node.properties['new_login_password']  # 获取新密码
    ipaddr = ctx.node.properties['ip']                  #获取管理网ip
    netmask = ctx.node.properties['netmask']            #管理网掩码
    gateway = ctx.node.properties['gateway']            #管理网网关

    login_url = 'https://' + login_ip + '/login/userverify.cgi'    #登录url
    login_data = {'username': login_username, 'password': login_password}                #登录提交的数据
    resp = requests.post(                            #转到登录操作
        login_url, verify=False, data=login_data     #获取新的cookie文件
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies                        #用新的cookie文件重新请求url

    ctx.logger.info('............Modifying the admin network entry...........')
    url = 'https://' + login_ip + '/cgi-bin/Setup/if_admin'  # 修改管理网的url
    post_data = {'ipaddr': ipaddr, 'netmask': netmask, 'gateway': gateway}  # 修改管理网ip所提交的数据
    resp = requests.post(
        url, verify=False, cookies=cookie_jar,data=post_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    ctx.logger.info('............Changing account password............')

    cookie_jar.clear()
    ctx.logger.info('finish task: update manager network')




