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
import re
from public_gateway_interface import get_gateway_info
from address_pool import address_pool_create, db_update, address_pool_delete,db_delete
from protocol_group import protocol_group_create,protocol_group_delete
from flow_control import flow_control_create,flow_control_delete,get_policy_num
from flow_control import generate_polno


# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml

@operation
def create(**kwargs):
    L =[]
    name = ctx.node.properties['user_group_name']
    polno_int = generate_polno('gateway_user_groups',name,4096)
    polno = str(polno_int)
    all = get_gateway_info()
    while True:
        try:
            T = all.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            address_pool_create(ctx, ip_port, login_cookie)
            protocol_group_create(ctx, ip_port, login_cookie)
            flow_control_create(ctx, ip_port, login_cookie,polno)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break
    gateway_list = ",".join(L)
    ctx.logger.info('gateway_list = %s'%(gateway_list))
    db_update(ctx,gateway_list,polno_int)


@operation
def delete(**kwargs):
    L =[]
    name = ctx.node.properties['user_group_name']
    ctx.logger.info('Deleting user group named %s'%(name))
    polno = get_policy_num('gateway_user_groups',name)
    all = get_gateway_info()
    while True:
        try:
            T = all.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            address_pool_delete(name ,ip_port, login_cookie)
            protocol_group_delete(name ,ip_port, login_cookie)
            flow_control_delete(ip_port, login_cookie,polno)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break
    gateway_list = ",".join(L)
    db_delete(name)
    print ('gateway_list = %s'%(gateway_list))
