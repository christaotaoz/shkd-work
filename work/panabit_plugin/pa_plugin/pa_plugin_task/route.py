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
    ctx.logger.info('............start task: create route............')
    login_ip = ctx.node.properties['connection_config'].get('host')  # 从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')  # 从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')  # 获取密码

    name = ctx.node.properties['route_name']
    type = ctx.node.properties['route_type']
    interface = ctx.node.properties['interface']
    route_ip = ctx.node.properties['ip']
    gateway = ctx.node.properties['gateway']
    heart_server =  ctx.node.properties['heart_server']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}

    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies
    if (type == 'outside'):
        url_wan = 'https://' + login_ip + '/cgi-bin/cfy/Route/proxy_add'
        post_data_wan = {'proxyname': name, 'ifname': interface, 'wantype': 'static',
                         'pingip': heart_server, 'proxymtu': '1500', 'proxyaddr': route_ip,
                         'proxygw': gateway, 'waitime': '6'}
        resp = requests.post(
            url_wan, verify=False, cookies=cookie_jar, data=post_data_wan
        )
        status = resp.status_code
        ctx.logger.info('POST, url= '+ url_wan)
        ctx.logger.info('status code = '+ str(status))
    elif (type == 'inside'):
        url_lan = 'https://' + login_ip + '/cgi-bin/cfy/Route/iflan_add'
        post_data_lan = {'name': name, 'ifname': interface, 'ifaddr': route_ip,
                         'netmask': '255.255.255.0', 'mtu': '1500', 'mode': 'work'}
        resp = requests.post(
            url_lan, verify=False, cookies=cookie_jar, data=post_data_lan
        )
        status = resp.status_code
        ctx.logger.info('POST, url= '+ url_lan)
        ctx.logger.info('status code = '+ str(status))
    else:
        raise NonRecoverableError(
            "Set route fail, {type} is invaild."
            "checkout {type} is between outside or inside"
            "".format(type=type)
        )
    cookie_jar.clear()
    ctx.logger.info('finish task: create route')
    

@operation
def delete(**kwargs):
    ctx.logger.info('............start task: delete route............')
    login_ip = ctx.node.properties['connection_config'].get('host')  # 从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')  # 从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')  # 获取密码

    name = ctx.node.properties['route_name']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'
    login_data = {'username': login_username, 'password': login_password}

    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))
    cookie_jar = resp.cookies

    list_url = 'https://' + login_ip + '/cgi-bin/cfy/Route/proxy_list'

    resp = requests.get(
        list_url, verify=False, cookies=cookie_jar)
    routes = json.loads(resp.text)
    for route in routes:
        if route['name'] == name:
            if route['type'] == 'proxy':
                id_wan = route['id']
                url_wan = 'https://' + login_ip + '/cgi-bin/cfy/Route/proxy_list?action=delete&pxyid=' + id_wan
                resp = requests.get(
                    url_wan, verify=False, cookies=cookie_jar)
                status = resp.status_code
                ctx.logger.info('GET, url= ', url_lan)
                ctx.logger.info('status code = ', status)
        if route['name'] == name:
            if route['type'] == 'rtif':
                id_lan = route['id']
                url_lan = 'https://' + login_ip + '/cgi-bin/cfy/Route/iflan_list?action=delete&pxyid=' + id_lan
                resp = requests.get(
                    url_lan, verify=False, cookies=cookie_jar)
                status = resp.status_code
                ctx.logger.info('GET, url= '+ url_lan)
                ctx.logger.info('status code = '+ str(status))
    cookie_jar.clear()
    ctx.logger.info('finish task: delete route,route name = '+ name)
