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
    ctx.logger.info('............start task: create pppoe server............')
    login_ip = ctx.node.properties['connection_config'].get('host')  
    login_username = ctx.node.properties['connection_config'].get('login_name')  
    login_password = ctx.node.properties['connection_config'].get('login_password') 

    name =  ctx.node.properties['name']
    interface = ctx.node.properties['interface']
    gateway =  ctx.node.properties['gateway']
    first_dns =  ctx.node.properties['first_dns']
    second_dns =  ctx.node.properties['second_dns']
    auth_mode =  ctx.node.properties['authentication_mode']
    pool_name =  ctx.node.properties['address_pool_name']
    radius_name = ctx.node.properties['radius_name']

    login_url = 'https://' + login_ip +'/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    enable_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/pppoesvr_config'
    resp = requests.get(
        enable_url, verify=False, cookies=cookie_jar)
    ctx.logger.info('resp text = '+ resp.text)
    rets = json.loads(resp.text)
    for ret in rets:
        if ret['enable'] != '1':
            resp = requests.post(
                enable_url, verify=False, cookies=cookie_jar, data={'enable': '1'}
            )

    list_pool_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/ippool_list'
    resp = requests.get(
        list_pool_url, verify=False, cookies=cookie_jar)
    pools = json.loads(resp.text)
    for pool in pools:
        if pool['name'] == pool_name:
            pool_id = pool['id']
    if radius_name != "":
        list_radius_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/radsvr_list'
        resp = requests.get(
            list_radius_url, verify=False, cookies=cookie_jar
        )
        radius = json.loads(resp.text)
        for rad in radius:
            if rad['name'] == radius_name:
                radius_id = rad['id']
    post_data = {'svrname': name, 'ifname': interface, 'addr': gateway, 'vlan': '0', 'mtu': '1492',
                 'dns0': first_dns, 'dns1': second_dns, 'auth': auth_mode, 'radsvr': radius_id,
                 'pool': pool_id, 'maxclnt': '0'}
    url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/pppoesvr_add'
    resp = requests.post(
        url, verify=False, cookies=cookie_jar, data=post_data
    )
    cookie_jar.clear()
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    ctx.logger.info('finish task: create ppppoe server, the pppoe server name = '+ name)
    cookie_jar.clear()

@operation
def delete(**kwargs):
    ctx.logger.info('............start task: delete pppoe server............')
    login_ip = ctx.node.properties['connection_config'].get('host')  
    login_username = ctx.node.properties['connection_config'].get('login_name')  
    login_password = ctx.node.properties['connection_config'].get('login_password')  

    name = ctx.node.properties['name']


    login_url = 'https://' + login_ip +'/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/pppoesvr_list?action=delete&name=' + name
    resp = requests.get(
        url, verify=False, cookies=cookie_jar
    )
    cookie_jar.clear()
    status = resp.status_code
    ctx.logger.info('GET, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    ctx.logger.info('finish task: delete ppppoe server, the pppoe server name = '+ name)
    cookie_jar.clear()
