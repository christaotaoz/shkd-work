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
from flow_control import flow_control_create,flow_control_delete,generate_polno,get_policy_num
from connection_control import connection_control_create,connection_control_delete
import psycopg2
# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml
            
@operation
def create(**kwargs):
    L =[]
    qos_rule_name = ctx.node.properties['qos_rule_name']
    polno_int = generate_polno('qos',qos_rule_name,2048)
    polno = str(polno_int)
    all = get_gateway_info()
    while True:
        try:
            T = all.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            flow_control_create(ctx, ip_port, login_cookie,polno)
            connection_control_create(ctx, ip_port, login_cookie,polno)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break
    gateway_list = ",".join(L)
    ctx.logger.info('gateway_list = %s'%(gateway_list))
    db_update(ctx, gateway_list,polno_int)

@operation
def delete(**kwargs):
    L =[]
    name = ctx.node.properties['qos_rule_name']
    polno = get_policy_num('qos',name)
    all = get_gateway_info()
    while True:
        try:
            T = all.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            flow_control_delete(ip_port, login_cookie,polno)
            connection_control_delete(ip_port, login_cookie,polno)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break
    gateway_list = ",".join(L)
    ctx.logger.info('gateway_list = %s'%(gateway_list))
    db_delete(name)
    


def db_update(ctx, gateway_list, polno):
    qos_rule_name   = ctx.node.properties['qos_rule_name']
    wan_line        = ctx.node.properties['bridge']
    direction       = ctx.node.properties['dir']
    ip_rate         = ctx.node.properties['iprate']
    max_tcp_session = ctx.node.properties['maxtflow']
    max_udp_session = ctx.node.properties['maxuflow']
    max_total_session = ctx.node.properties['maxflow']

    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select id from qos where id='%s'" % (qos_rule_name))
    cur.execute("select id from qos where id='%s'" % (qos_rule_name))
    if cur.fetchall():
        ctx.logger.info("update qos set gatewaylist='%s'where id='%s'"%(gateway_list,qos_rule_name))
        cur.execute("update qos set gatewaylist='%s'where id='%s';"%(gateway_list,qos_rule_name))
    else:
        ctx.logger.info("insert into qos (id,wan_line,direction,ip_rate,max_tcp_session,max_udp_session,max_total_session,polno,gatewaylist) "
                        "values ('%s','%s','%s',%d, %d, %d, %d,%d,'%s');"%(qos_rule_name,wan_line,direction,ip_rate,max_tcp_session,max_udp_session,max_total_session,polno,gateway_list))
        cur.execute("insert into qos (id,wan_line,direction,ip_rate,max_tcp_session,max_udp_session,max_total_session,polno,gatewaylist) "
                        "values ('%s','%s','%s',%d, %d, %d, %d, %d,'%s');"%(qos_rule_name,wan_line,direction,ip_rate,max_tcp_session,max_udp_session,max_total_session,polno,gateway_list))
    conn.commit()
    conn.close()

def db_delete(id):
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select id from qos where id='%s'" % (id))
    cur.execute("select id from qos where id='%s';" % (id))
    if cur.fetchall():
        ctx.logger.info("delete from qos where id = '%s';" % (id))
        cur.execute("delete from qos where id = '%s';"%(id))
    else:
        ctx.logger.info("There is qos rule named %s in the database"%(id))
    conn.commit()
    conn.close()
