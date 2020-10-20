#-*- coding: UTF-8 –*-
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
import copy
import re
from public_gateway_interface import get_gateway_info
import psycopg2

# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml


def connection_control_create(ctx, login_ip, cookie_jar,polno):
    ctx.logger.info('............start task:creating connection control Settings............')

    maxtflow = ctx.node.properties['maxtflow']
    maxuflow = ctx.node.properties['maxuflow']
    maxflow = ctx.node.properties['maxflow']

    url = 'https://' + login_ip +'/cgi-bin/Setup/conlimit_listime'
    ctx.logger.info('GET, url= '+ url)
    resp = requests.get(url,verify=False,cookies=cookie_jar)
    if(resp.status_code == 200):
        L = re.findall('<select name=defgrp value="(\d)"',resp.text)
        if L:
            policygrp = L[0]
            if policygrp == '0':
                policygrp = add_strategy_group(login_ip,cookie_jar)
        else:
            policygrp = add_strategy_group(login_ip,cookie_jar)
    ctx.logger.info('policy group= ' + str(policygrp))
    if policygrp == '0':
        raise ValueError(
            "policy group not invalid."
        )
    post_data = {'polno': polno, 'bridge': '0','intype':'any','inipnet':'','iniprng':'',
                 'inport': '0','outtype': 'any','outipnet':'','outiprng':'','outport': '0',
                 'appid':'any', 'maxtflow':maxtflow, 'maxuflow':maxuflow,'maxflow':maxflow,
                 'policy':policygrp
    }

    url = 'https://' + login_ip + '/cgi-bin/Setup/conlimit_addrule'
    print url

    resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar )
    status = resp.status_code
    ctx.logger.info('post url= '+ url)
    ctx.logger.info('status code = '+ str(status))


def add_strategy_group(login_ip,cookie_jar):
    ctx.logger.info('............add strategy group............')
    url = 'https://' + login_ip + '/cgi-bin/Setup/conlimit_addgrp'
    ctx.logger.info('POST, url= '+ url)
    post_data = {'grpname': 'qos'}
    resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar)

    url = 'https://' + login_ip + '/cgi-bin/Setup/conlimit_getgrp'
    ctx.logger.info('GET, url= '+ url)
    resp = requests.get(url, verify=False, cookies=cookie_jar)
    if (resp.status_code == 200):
        L = re.findall('<option value=(\d+).*>qos', resp.text)
        if L:
            policygrp = L[0]
        else:
            return 0

    url = 'https://' + login_ip + '/cgi-bin/Setup/conlimit_listime'
    ctx.logger.info('POST, url= '+ url)
    post_data = {'defgrp': policygrp,'action':'defgrp'}
    resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar)
    return policygrp

def connection_control_delete(login_ip, cookie_jar, policy_num):

    list_url = 'https://' + login_ip +'/cgi-bin/Setup/conlimit_listime'
    ctx.logger.info('GET, list_url= %s'%(list_url))
    resp = requests.get(list_url,verify=False,cookies=cookie_jar)
    if(resp.status_code == 200):
        L = re.findall('<select name=defgrp value="(\d)"',resp.text)
        if L:
            policygrp = L[0]
            ctx.logger.info('policy group=%s ' %(policygrp))
            if policygrp == '0':
                raise ValueError("policy group not exists.")
        else:
            raise ValueError("policy group not exists.")
            
    url = 'https://' + login_ip +'/cgi-bin/Setup/conlimit_getgrp'

    params_data = {'action': 'rmvrule', 'group':int(policygrp), 'ruleid': policy_num}
    resp = requests.get(
        url, verify=False, cookies=cookie_jar, params= params_data
    )
    status = resp.status_code
    ctx.logger.info('GET, url= %s' %(url))
    ctx.logger.info('status code = %s'% str(status))
    ctx.logger.info('finish task: delete connection control, policy_num = %d'%(policy_num))


