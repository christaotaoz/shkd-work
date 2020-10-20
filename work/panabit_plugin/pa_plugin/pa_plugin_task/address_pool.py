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
import psycopg2
from flow_control import generate_polno

# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml


@operation
def create(**kwargs):
    L = []
    name = ctx.node.properties['user_group_name']
    polno_int = generate_polno('gateway_user_groups', name, 4096)
    all = get_gateway_info()
    ctx.logger.info(all)
    while True:
        try:
            T = next(all)
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            ctx.logger.info('gateway_number = %s' % (gateway_number))
            address_pool_create(ctx, ip_port, login_cookie)
            L.append(gateway_number)
        except StopIteration:
            ctx.logger.info('StopIteration')
            break
        except Exception as e:
            ctx.logger.info(str(e))

    gateway_list = ",".join(L)
    ctx.logger.info('gateway_list = %s' % (gateway_list))
    db_update(ctx, gateway_list, polno_int)


@operation
def delete(**kwargs):
    L = []
    all = get_gateway_info()
    name = ctx.node.properties['user_group_name']
    while True:
        try:
            T = all.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            ctx.logger.info('gateway_number = %s' % (gateway_number))
            address_pool_delete(name, ip_port, login_cookie)
            L.append(gateway_number)
        except:
            break
    gateway_list = ",".join(L)
    db_delete(name)
    ctx.logger.info('gateway_list = %s' % (gateway_list))


def address_pool_create(ctx, login_ip, cookie_jar):
    ctx.logger.info('............start task: start create address pool............')
    
    name          = ctx.node.properties['user_group_name']
    start         = ctx.node.properties['start_ip']
    end           = ctx.node.properties['final_ip']
    rateout       = ctx.node.properties['max_uplink_rate']
    ratein        = ctx.node.properties['max_downlink_rate']
    dns           = ctx.node.properties['dns_server']
    maxonlinetime = ctx.node.properties['max_online_time']
    clntepa       = ctx.node.properties['allow_for_overdue_account']
    ifname        = ctx.node.properties['dialing_interface']

    url = 'https://' + login_ip + '/cgi-bin/Pppoe/ippool_add'
    post_data = {'name': name, 'start': start, 'end': end,
                 'dns': dns, 'ratein': ratein, 'rateout': rateout,
                 'maxonlinetime': maxonlinetime, 'clntepa': clntepa,
                 'ifname': ifname}

    resp = requests.post(
        url, data=post_data, verify=False, cookies=cookie_jar)
    status = resp.status_code
    ctx.logger.info('POST, url=%s ' % (url))
    ctx.logger.info('status code = %s' % str(status))
    ctx.logger.info('finish task: create address pool, address_pool name = %s' % (name))


def db_update(ctx, gateway_list, polno):
    group_name        = ctx.node.properties['user_group_name']
    max_uplink_rate   = ctx.node.properties['max_uplink_rate']
    max_downlink_rate = ctx.node.properties['max_downlink_rate']
    dns_server        = ctx.node.properties['dns_server']
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select id from gateway_user_groups where id='%s'" % (group_name))
    cur.execute("select id from gateway_user_groups where id='%s'" % (group_name))
    if cur.fetchall():
        ctx.logger.info("update gateway_user_groups set gatewaylist='%s' where id='%s'" % (gateway_list, group_name))
        cur.execute("update gateway_user_groups set gatewaylist='%s' where id='%s';" % (gateway_list, group_name))
    else:
        ctx.logger.info(
            "insert into gateway_user_groups (id,max_uplink_rate,max_downlink_rate,dns_server,polno,gatewaylist) "
            "values ('%s','%s','%s','%s',%d,'%s');" % (
            group_name, max_uplink_rate, max_downlink_rate, dns_server, polno, gateway_list))
        cur.execute(
            "insert into gateway_user_groups (id,max_uplink_rate,max_downlink_rate,dns_server,polno,gatewaylist) "
            "values ('%s','%s','%s','%s',%d,'%s');" % (
            group_name, max_uplink_rate, max_downlink_rate, dns_server, polno, gateway_list))
    conn.commit()
    conn.close()


def address_pool_delete(name, login_ip, cookie_jar):
    ctx.logger.info('............start task: delete address pool............')
    list_url = 'https://' + login_ip + '/cgi-bin/Pppoe/ajax_ippool_list'
    resp = requests.post(list_url, data={'action':'ippool_list'}, verify=False, cookies=cookie_jar)
    status = resp.status_code
    ctx.logger.info('status code =%s '% str(status))
    for i in range(len(eval(resp.text))):
        if (eval(resp.text))[i]['name'] == name:
            pool_id = (eval(resp.text))[i]['id']
    ctx.logger.info('pool_id = %s'% str(pool_id))
    del_url = 'https://' + login_ip + '/cgi-bin/Pppoe/ippool_list'
    resp = requests.get(
        del_url, verify=False, cookies=cookie_jar, params={'action': 'deletepool', 'id': str(pool_id)}
    )
    status = resp.status_code
    ctx.logger.info('GET, del_url=%s' % del_url)
    ctx.logger.info('status code = %s ' % str(status))
    ctx.logger.info('finish task: delete address pool, address_pool id = %s' % name)


def db_delete(id):
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select id from gateway_user_groups where id='%s'" % (id))
    cur.execute("select id from gateway_user_groups where id='%s';" % (id))
    if cur.fetchall():
        ctx.logger.info("delete from gateway_user_groups where id = '%s';" % (id))
        cur.execute("delete from gateway_user_groups where id = '%s';" % (id))
    else:
        ctx.logger.info("There is no user group named %s in the database" % (id))
    conn.commit()
    conn.close()