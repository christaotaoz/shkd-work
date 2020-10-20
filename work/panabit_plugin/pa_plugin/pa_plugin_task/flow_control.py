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


######################################################
#配置PA的流量控制
######################################################operation
def flow_control_create(ctx, login_ip, cookie_jar,polno):
    ctx.logger.info('............start task:creating flow control Settings............')
    inipnet=''
    iniprng=''    
    outipnet=''
    outiprng=''

    #获取策略调度的默认策略组，第一次需要新增，后续使用即可
    url = 'https://' + login_ip +'/cgi-bin/Setup/policy_listtime'
    ctx.logger.info('GET, url= '+ url)
    resp = requests.get(url,verify=False,cookies=cookie_jar)
    if(resp.status_code == 200):
        L = re.findall('<select name=defgrp value="(\d)"',resp.text)
        if L:
            policygrp = L[0]
            if policygrp == '0':
                policygrp = add_policy_group(login_ip,cookie_jar)
        else:
            policygrp = add_policy_group(login_ip,cookie_jar)

    if policygrp == '0':
        raise ValueError(
            "policy group not invalid."
        )

    desc = ctx.node.properties['desc']
    bridge = ctx.node.properties['bridge']
    # 流向
    direction = ctx.node.properties['dir']
    vlan      = ctx.node.properties['vlan']     #内网IP
    iniptbl   = ctx.node.properties['iniptbl']
    inport = ctx.node.properties['inport']
    outtype = ctx.node.properties['outtype']
    outiptbl  = ctx.node.properties['outiptbl']
    outport = ctx.node.properties['outport']
    proto = ctx.node.properties['proto']
    appid     = ctx.node.properties['appid']
    natip     = ctx.node.properties['natip']
    hasms     = ctx.node.properties['hasms']
    qqcnt     = ctx.node.properties['qqcnt']
    #动作
    action = ctx.node.properties['action']

    iprate    = ctx.node.properties['iprate']
    tos       = ctx.node.properties['tos']
    matchact  = ctx.node.properties['matchact']
#用户输入IP的情况要先获取输入IP的格式，用户输入用户组的情况要获取对应的组编号
    inproperty = ctx.node.properties['intype'].get('data_sources')
    intype     = ctx.node.properties['intype'].get('data_value')
    if inproperty == 0:
       intype_n    = Get_address_format(intype)
       if intype_n == 'error':
           raise ValueError(
            "address input format not correct."
            )
       elif intype_n == 'net':
           inipnet = intype
       elif intype_n == 'range':
           iniprng = intype
    else:
        list_url = 'https://' + login_ip + '/cgi-bin/Pppoe/ajax_ippool_list'
        resp = requests.post(list_url, data={'action':'ippool_list'}, verify=False, cookies=cookie_jar)
        status = resp.status_code
        ctx.logger.info('status code =%s '%str(status))
        for i in range(len(eval(resp.text))):
            if (eval(resp.text))[i]['name'] == intype:
                pool_id = (eval(resp.text))[i]['id']
        ctx.logger.info('intype = %s,pool_id = %s'%(intype,str(pool_id)))
        intype_n = 'pppoe.' + str(pool_id)
    
    outtype_n    = Get_address_format(outtype)
    if outtype_n == 'error':
        raise ValueError(
            "address input format not correct."
            )
    elif outtype_n == 'net':
        outipnet = outtype
    elif outtype_n == 'range':
        outiprng = outtype
    
    post_data = {'polno': polno, 'desc': desc, 'bridge': bridge,'dir': direction,'vlan': vlan,
                 'intype':intype_n,'inipnet':inipnet,'iniprng':iniprng,'iniptbl':iniptbl,'inport': inport,
                 'outtype': outtype_n,'outipnet':outipnet,'outiprng':outiprng,'outiptbl':outiptbl,'outport': outport,
                 'proto': proto, 'appid':appid, 'natip':natip, 'hasms':hasms, 'qqcnt':qqcnt,'action': action, 
                 'iprate':iprate, 'tos':tos,'matchact': matchact,'policy':policygrp
                }
    ctx.logger.info('policy group= '+ str(policygrp))
    url = 'https://' + login_ip + '/cgi-bin/Setup/policy_addrule'

    resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar )
    status = resp.status_code
    ctx.logger.info('post url= '+ url)
    ctx.logger.info('status code = '+ str(status))


def add_policy_group(login_ip,cookie_jar):

    ctx.logger.info('............add policy group............')    
        #增加策略组

    url = 'https://' + login_ip + '/cgi-bin/Setup/policy_addgrp'
    ctx.logger.info('POST, url= '+ url)
    post_data = {'grpname': 'firewall'}
    resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar)

    url = 'https://' + login_ip + '/cgi-bin/Setup/policy_getgrp'
    ctx.logger.info('GET, url= '+ url)
    resp = requests.get(url, verify=False, cookies=cookie_jar)
    if (resp.status_code == 200):
        L = re.findall('<option value=(\d+).*>firewall', resp.text)
        if L:
            policygrp = L[0]
        else:
            return '0'
    #策略调度增加
    url = 'https://' + login_ip + '/cgi-bin/Setup/policy_listtime'
    ctx.logger.info('POST, url= '+ url)
    post_data = {'defgrp': policygrp,'action':'defgrp'}
    resp = requests.post(url, verify=False, data=post_data, cookies=cookie_jar)
    return policygrp

# 输入IPV4的格式为xxx.xxx.xxx.xxx/mn 或者 xxx.xxx.xxx.xxx-xxx.xxx.xxx.xxx
def Get_address_format(input):
#    ctx.logger.info('address input= ' + input)
    if input == 'any':
        return input
    seprate = re.findall('/', input);
    if seprate:
        address_list = re.findall('.*/', input)
        if not address_list:
            return 'error'

        address = address_list[0][0:-1]
        ret = validate_ipv4(address)
        if ret == False:
            return 'error'
        numlist = re.findall('/.*', input)
        if not numlist:
            return 'error'
        num = numlist[0][1:]
        if int(num)>31 or int(num) == 0:
            return 'error'
        else:
            return 'net'
    else:
        seprate = re.findall('-', input)
        if not seprate:
            return 'error'
        address_start_list = re.findall('.*-', input)
        if not address_start_list:
            return 'error'
        address_start = address_start_list[0][0:-1]
        ret = validate_ipv4(address_start)
        if ret == False:
            return 'error'
        address_end_list = re.findall('-.*', input)
        if not address_end_list:
            return 'error'
        address_end = address_end_list[0][1:]
        ret = validate_ipv4(address_end)
        if ret == False:
            return 'error'
        else:
            return 'range'

def validate_ipv4(ip_str):
    seprate = ip_str.split('.')
    if len(seprate) != 4:
        return False
    for i, x in enumerate(seprate):
        try:
            int_x = int(x)
            if int_x < 0 or int_x > 255:
                return False
        except ValueError, e:
            return False
    return True


def create(**kwargs):
    L = []
    ctx.logger.info('............start task: start create firewall policy............')
    polno = ctx.node.properties['policy_number']
    if int(polno) > 1000 or int(polno) == 0:
        raise ValueError(
            "range of policy_number is 1-1000."
        )
    gateway_policy_num = str(32767 + int(polno))
    gateway_info = get_gateway_info()
    while True:
        try:
            T = gateway_info.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            flow_control_create(ctx, ip_port, login_cookie, gateway_policy_num)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break

    #   insert into DB
    gateway_list = ",".join(L)
    ctx.logger.info('gateway_list = %s and policy_number=%s ' % (gateway_list, polno))
    db_update(ctx, gateway_list, polno)


def db_update(ctx, gateway_list, polno):
    intype = ctx.node.properties['intype'].get('data_value')
    inport = ctx.node.properties['inport']
    outtype = ctx.node.properties['outtype']
    outport = ctx.node.properties['outport']
    direction = ctx.node.properties['dir']
    proto = ctx.node.properties['proto']
    action = ctx.node.properties['action']

    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select policy_number from firewall where policy_number=%d" % int(polno))
    cur.execute("select policy_number from firewall where policy_number=%d" % int(polno))
    if cur.fetchall():
        ctx.logger.info("update firewall set gateway_list='%s',policy_number=%d,internal_ip='%s',internal_port=%s, "
                        "internet_ip ='%s',internet_port='%s',direction='%s',protocol='%s',actions='%s'where policy_number=%d;"
                        % (gateway_list, int(polno), intype, inport, outtype, outport, direction, proto, action))
        cur.execute("update firewall set gateway_list='%s',policy_number=%d,internal_ip='%s',internal_port=%s, "
                    "internet_ip ='%s',internet_port='%s',direction='%s',protocol='%s',actions='%s'where policy_number=%d;"
                    % (gateway_list, int(polno), intype, inport, outtype, outport, direction, proto, action))
    else:
        ctx.logger.info(
            "insert into firewall (gateway_list,policy_number,internal_ip,internal_port,internet_ip,internet_port,direction,protocol,actions) values ('%s',%d,'%s','%s','%s','%s','%s','%s','%s');" % (
            gateway_list, int(polno), intype, inport, outtype, outport, direction, proto, action))
        cur.execute(
            "insert into firewall (gateway_list,policy_number,internal_ip,internal_port,internet_ip,internet_port,direction,protocol,actions) ""values ('%s',%d,'%s','%s','%s','%s','%s','%s','%s');" % (
            gateway_list, int(polno), intype, inport, outtype, outport, direction, proto, action))
    conn.commit()
    conn.close()


def delete(**kwargs):
    L = []
    ctx.logger.info('............start task: start delete firewall policy............')
    polno = ctx.node.properties['policy_number']
    if int(polno) > 1000 or int(polno) == 0:
        raise ValueError(
            "range of policy_number is 1-1000."
        )
    gateway_policy_num = str(32767 + int(polno))
    gateway_info = get_gateway_info()
    while True:
        try:
            T = gateway_info.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            ctx.logger.info('ip_port = %s login_cookie=%s gateway_number=%s' % (ip_port,login_cookie,gateway_number))
            flow_control_delete(ip_port, login_cookie, gateway_policy_num)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break

    #   delete from DB
    gateway_list = ",".join(L)
    ctx.logger.info('gateway_list = %s and polno =%s ' % (gateway_list,polno))
    db_delete(polno)

def db_delete(polno):
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select policy_number from firewall where policy_number=%d" % int(polno))
    cur.execute("select policy_number from firewall where policy_number=%d" % int(polno))
    if cur.fetchall():
        ctx.logger.info("delete from firewall where policy_number=%d;" % (int(polno)))
        cur.execute("delete from firewall where policy_number=%d;" % (int(polno)))
        conn.commit()
    else:
        ctx.logger.info("The policy number not exists.")
    conn.close()

def flow_control_delete(login_ip, cookie_jar, policy_number):
    ctx.logger.info('............delete flow control............')
    ctx.logger.info('policy_number = %s' %str(policy_number))
    url = 'https://' + login_ip + '/cgi-bin/Setup/policy_listtime'
    ctx.logger.info('GET, url= %s' % (url))
    resp = requests.get(url, verify=False, cookies=cookie_jar)
    if (resp.status_code == 200):
        L = re.findall('<select name=defgrp value="(\d)"', resp.text)
        if L:
            policygrp = L[0]
            ctx.logger.info('policygrp = %s' % str(policygrp)) 
            if policygrp == '0':
                raise ValueError(
                    "policy group not exists."
                )
        else:
            raise ValueError(
                "policy group not exists."
            )

    if policygrp == '0':
        raise ValueError(
            "policy group not invalid."
        )
    url = 'https://' + login_ip + '/cgi-bin/Setup/policy_getgrp'
    ctx.logger.info('GET, url= %s' %(url))
    queryparams = {'action': 'rmvrule', 'policy': int(policygrp), 'ruleid': int(policy_number)}
    resp = requests.get(url, verify=False, params=queryparams, cookies=cookie_jar)
    ctx.logger.info('status = %s' % (resp.status_code))


def generate_polno(table, id, polno_start):
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select _storage_id from %s order by _storage_id desc limit 1;"% (table))
    cur.execute("select _storage_id from %s order by _storage_id desc limit 1;"% (table))
    all = cur.fetchall()
    if all:
        ctx.logger.info("select polno from %s where id = '%s';" % (table, id))
        cur.execute("select polno from %s where id = '%s';" % (table, id))
        result = cur.fetchall()
        if result:
            ctx.logger.info(result[0][0])
            polno = result[0][0]
        else:
            ctx.logger.info("select polno from %s where _storage_id = %d;" % (table, all[0][0]))
            cur.execute("select polno from %s where _storage_id = %d;" % (table, all[0][0]))
            pre = cur.fetchall()
            if pre:
                polno = pre[0][0] + 1
    else:
        polno = polno_start
    conn.close()
    return polno


def get_policy_num(table ,id):
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select polno from %s where id='%s';" % (table ,id))
    cur.execute("select polno from %s where id='%s';" % (table,id))
    result = cur.fetchall()
    ctx.logger.info(result)
    conn.close()
    if result :
        polno = result[0][0]
        return polno
    else:
        raise ValueError("get polno num error.")


