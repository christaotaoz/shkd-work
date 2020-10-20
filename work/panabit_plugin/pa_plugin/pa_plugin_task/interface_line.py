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

# from bs4 import BeautifulSoup
# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml


######################################################
# 配置PA的接口线路
######################################################
def interface_line_update(ctx, login_ip, cookie_jar):
    ctx.logger.info('............start task:update interface line Settings............')

    wan_mtu = ctx.node.properties['wan_mtu']
    lan_mtu = ctx.node.properties['lan_mtu']
    lan_interface_update(login_ip, cookie_jar, lan_mtu)
    wan_interface_update(login_ip, cookie_jar, wan_mtu)

def lan_interface_update(login_ip, cookie_jar,lan_mtu):

    url = 'https://' + login_ip + '/cgi-bin/Route/iflan_list'
    ctx.logger.info("start LAN interface line update and Get url= %s " % (url))
    resp = requests.get(url, verify=False, cookies=cookie_jar)
    if (resp.status_code != 200):
        raise ValueError(
            "failed to get interface line configuration."
        )
    html = resp.text
    pattern = '<tr id=row.*?>(.*?)</tr>'
    rowlist = re.findall(pattern, html, flags=re.S)
    if not rowlist:
        raise ValueError(
        "failed to get interface line configuration."
        )

    for i in rowlist:
        Value = lan_single_get(i)
        url = 'https://' + login_ip +'/cgi-bin/Route/iflan_edit'
        ctx.logger.info("post url= %s" % (url))
        post_data ={'newname': Value[1],'ifname': Value[2],'addr': Value[4],'netmask': Value[5],
                   'vlan':Value[7],'mtu':lan_mtu,'name':Value[1]}
        resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar)
        ctx.logger.info("status = %s" % (resp.status_code))

def lan_single_get(input):
    # 清洗数据
    # 去换行
    pattern_br = '\n|\n\t'
    # 去 a 标签
    pattern_a = '<a.*?>|</a>'
    # 去 &nbsp;
    pattern_nbsp = '&nbsp;'
    # 去 标签
    pattern_span = '<span.*?>|</span>'
    # 去 右侧标题
    pattern_right = '<td align=right>.*?</td>'

    input = re.sub(pattern_br, '', input, flags=re.S)
    input = re.sub(pattern_a, '', input)
    input = re.sub(pattern_nbsp, '', input)
    input = re.sub(pattern_span, '', input)
    input = re.sub(pattern_right, '', input, flags=re.S)
    print input

    pattern = '<td.*?>(.*?)</td>'
    Value = re.findall(pattern, input, flags=re.S)
    print Value
    return Value

def wan_interface_update(login_ip, cookie_jar,wan_mtu):
    #get wan interface line configuration
    url = 'https://' + login_ip + '/cgi-bin/Route/proxy_list'
    ctx.logger.info("start WAN interface line update and Get url= %s " % (url))
    resp = requests.get(url, verify=False, cookies=cookie_jar)
    if (resp.status_code != 200):
        raise ValueError(
            "failed to get interface line configuration."
        )
    html = resp.text
    pattern = '<tr id=row.*?>(.*?)</tr>'
    rowlist = re.findall(pattern, html, flags=re.S)
    if not rowlist:
        raise ValueError(
            "No configuration exists."
        )
    for i in rowlist:
        Value = wan_single_get(i)
        vlan_out = re.findall('(\d)/', Value[6])[0]
        vlan_in = re.findall('/(\d)', Value[6])[0]

        url = 'https://' + login_ip +'/cgi-bin/Route/proxy_edit'
        ctx.logger.info("post url= %s " % (url))
        post_data ={'newname': Value[0],'ifname': Value[1],'mtu': wan_mtu,'vlan': vlan_out,
                    'vlan1':vlan_in,'proxyname':Value[0],'type': 'dhcpwan'}
        resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar)
        ctx.logger.info("status = %s" % (resp.status_code))

def wan_single_get(input):
    # 清洗数据
    # 去换行
    pattern_br = '\n|\n\t'
    # 去 a 标签
    pattern_a = '<a.*?>|</a>'
    # 去 &nbsp;
    pattern_nbsp = '&nbsp;'
    # 去 标签
    pattern_span = '<span.*?>|</span>'
    # 去 右侧标题
    pattern_right = '<td align=right>.*?</td>'
    #去左侧标题
    pattern_left  = '<td align=left>.*?</td>'

    input = re.sub(pattern_br, '', input, flags=re.S)
    input = re.sub(pattern_a, '', input)
    input = re.sub(pattern_nbsp, '', input)
    input = re.sub(pattern_span, '', input)
    input = re.sub(pattern_right, '', input, flags=re.S)
    input = re.sub(pattern_left, '', input, flags=re.S)

    pattern = '<td.*?>(.*?)</td>'
    Value = re.findall(pattern, input, flags=re.S)
    return Value

def update(**kwargs):
    L=[]
    gateway_info = get_gateway_info()
    while True:
        try:
            T = gateway_info.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            interface_line_update(ctx, ip_port, login_cookie)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break

    #   insert into DB
    gateway_list = ",".join(L)
    ctx.logger.info("gateway_list = %s " % (gateway_list))
    list = gateway_list.split(',')
    db_update_lan(list)
    db_update_wan(list)

def db_update_lan(gateway_list):

    lan_mtu = ctx.node.properties['lan_mtu']

    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select count(1) from lan_interface")
    cur.execute("select count(1) from lan_interface")
    countlist = cur.fetchone()
    count = int(countlist[0])
    if (count)>0:
        for gateway in gateway_list:
            ctx.logger.info("update lan_interface set mtu='%s' where licence_id='%s';" % (lan_mtu,gateway))
            cur.execute("update lan_interface set mtu='%s' where licence_id='%s';"% (lan_mtu,gateway))
            conn.commit()

    conn.close()

def db_update_wan(gateway_list):

    wan_mtu = ctx.node.properties['wan_mtu']

    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select count(1) from wan_interface")
    cur.execute("select count(1) from wan_interface")
    countlist = cur.fetchone()
    count = int(countlist[0])
    if (count)>0:
        for gateway in gateway_list:
            ctx.logger.info("update wan_interface set mtu='%s' where licence_id='%s';" % (wan_mtu,gateway))
            cur.execute("update wan_interface set mtu='%s' where licence_id='%s';" % (wan_mtu,gateway))
            conn.commit()

    conn.close()
