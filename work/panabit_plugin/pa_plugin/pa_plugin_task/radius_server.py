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
def link(**kwargs):
    ctx.logger.info('............start task: link radius server............')
    login_ip = ctx.node.properties['connection_config'].get('host')  
    login_username = ctx.node.properties['connection_config'].get('login_name')  
    login_password = ctx.node.properties['connection_config'].get('login_password')  

    name = ctx.node.properties['name']
    radius_ip = ctx.node.properties['radius_ip']
    secret_key = ctx.node.properties['secret_key']
    nas = ctx.node.properties['nas']
    route_name =  ctx.node.properties['route_name']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    enable_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/radsvr_config'
    enable_data = {'rad_enable': '1', 'rad_nasidentifier': nas, 'rad_acctinternal': '300', 'rad_ttl': '30'}
    resp = requests.get(
        enable_url, verify=False, cookies=cookie_jar
    )
    ctx.logger.info('POST, url= '+ enable_url)
    ctx.logger.info('status code = '+ str(status))
    rets = json.loads(resp.text)
    for ret in rets:
        if ret['enable'] != '1':
            resp = requests.post(
                enable_url, verify=False, cookies=cookie_jar, data=enable_data)
            status = resp.status_code
            ctx.logger.info('POST, url= '+ enable_url)
            ctx.logger.info('status code = '+ str(status))

    url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/radsvr_add'
    post_data = {'desc': name, 'ip': radius_ip, 'authport': '1812', 'acctport': '1813',
                 'secret': secret_key, 'proxy': route_name, 'proxy2': route_name}
    resp = requests.post(
        url, verify=False, cookies=cookie_jar, data=post_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar.clear()
    ctx.logger.info('finish task: link to radius,radius ip = '+ radius_ip)

@operation
def unlink(**kwargs):
    ctx.logger.info('............start task: link radius server............')
    login_ip = ctx.node.properties['connection_config'].get('host')  
    login_username = ctx.node.properties['connection_config'].get('login_name')  
    login_password = ctx.node.properties['connection_config'].get('login_password')  

    name = ctx.node.properties['name']
    radius_ip = ctx.node.properties['radius_ip']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    list_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/radsvr_list'
    resp = requests.get(
        list_url, verify=False, cookies=cookie_jar
    )
    rets = json.loads(resp.text)
    for ret in rets:
        if ret['name'] == name:
            radius_id = ret['id']
	    url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/radsvr_list?action=delete&id=' + radius_id
    resp = requests.get(
        url, verify=False, cookies=cookie_jar
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar.clear()
    ctx.logger.info('finish task: unlink to radius,radius ip = '+ radius_ip)
