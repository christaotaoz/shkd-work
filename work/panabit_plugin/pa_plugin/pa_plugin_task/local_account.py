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
from cloudify.exceptions import NonRecoverableError
import requests
# put the operation decorator on any function that is a task
from cloudify.decorators import operation


# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml

@operation
def create(**kwargs):
    ctx.logger.info('............start task: create local account............')
    login_ip = ctx.node.properties['connection_config'].get('host')  # 从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')  # 从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')  # 获取密码

    pool_name =  ctx.node.properties['address_pool_name']
    account_name = ctx.node.properties['username']
    account_password = ctx.node.properties['password']
    start_time =  ctx.node.properties['start_time']
    end_time =  ctx.node.properties['end_time']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    list_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/ippool_list'
    resp = requests.get(
        list_url, verify=False, cookies=cookie_jar
    )
    pools = json.loads(resp.text)
    for pool in pools:
        if pool['name'] == pool_name:
            pool_id = pool['id']

    url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/pppoe_addacct'
    post_data = {'poolid': pool_id, 'account': account_name, 'passwd1': account_password, 'start': start_time,
                 'expire': end_time,'bindmac': '00-00-00-00-00-00', 'bindip': '0.0.0.0', 'maxonline': '1'}
    resp = requests.post(
        url, verify=False, cookies=cookie_jar, data=post_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar.clear()
    ctx.looger.info('finish task: create local account, the account name = '+ account_name)

@operation
def delete():
    ctx.logger.info('............start task: delete local account............')
    login_ip = ctx.node.properties['connection_config'].get('host')  # 从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')  # 从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')  # 获取密码

    account_name = ctx.node.properties['username']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/pppoe_account?action=delete&accounts=' + account_name
    resp = requests.get(
        url, verify=False, cookies=cookie_jar
    )
    status = resp.status_code
    ctx.logger.info('GET, url= '+ url)
    ctx.logger.info('status code = '+ str(status))
    cookie_jar.clear()
    ctx.looger.info('finish task: delete local account, the account name = '+ account_name)
