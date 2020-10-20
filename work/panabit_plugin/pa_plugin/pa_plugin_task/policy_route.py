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
    ctx.logger.info('............start task: start create policy route............')
    login_ip = ctx.node.properties['connection_config'].get('host')  
    login_username = ctx.node.properties['connection_config'].get('login_name') 
    login_password = ctx.node.properties['connection_config'].get('login_password')

    number = ctx.node.properties['number']
    src_if = ctx.node.properties['source_interface']
    pool_name = ctx.node.properties['pool_name']
    nat_route = ctx.node.properties['nat_route']
    action = ctx.node.properties['action']


    login_url = 'https://' + login_ip + '/login/userverify.cgi'

    login_data = {'username': login_username, 'password': login_password}
    resp=requests.post(
        login_url, verify=False,data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies

    url = 'https://' + login_ip + '/cgi-bin/cfy/Route/policy_addrule?from=policy_list'
    list_pool_url = 'https://' + login_ip + '/cgi-bin/cfy/Pppoe/ippool_list'
    resp = requests.get(
        list_pool_url, verify=False, cookies=cookie_jar
    )
    pools = json.loads(resp.text)
    for pool in pools:
        if pool['name'] == pool_name:
            pool_id = pool['id']
    post_data = {'polno': number, 'schtime': 'any', 'inifname': 'proxy.'+src_if, 'pool': pool_id, 'route_proxy': nat_route,
                 'srctype': 'any', 'dsttype': 'any', 'proto': 'any', 'appid': 'any', 'nat_proxy': nat_route,
                 'nat_nexthop': '_NULL_', 'action': action}

    resp = requests.post(
        url,verify=False,cookies=cookie_jar,data=post_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar.clear()
    ctx.logger.info('finish task: create policy route, the policy route number = '+ str(number))

@operation
def delete(**kwargs):
    ctx.logger.info('............start task: start delete policy route............')
    login_ip = ctx.node.properties['connection_config'].get('host')  
    login_username = ctx.node.properties['connection_config'].get('login_name') 
    login_password = ctx.node.properties['connection_config'].get('login_password')  

    number = ctx.node.properties['number']

    login_url = 'https://' + login_ip + '/login/userverify.cgi'

    login_data = {'username': login_username, 'password': login_password}
    resp = requests.post(
        login_url, verify=False, data=login_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))
    cookie_jar = resp.cookies
    url = 'https://' + login_ip + '/cgi-bin/Route/policy_list?action=remove&id=' + str(number)
    resp = requests.post(
        url, verify=False, cookies=cookie_jar
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar.clear()
    ctx.logger.info('finish task: delete policy route, the policy route number = '+ str(number))
