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
import psycopg2
from public_gateway_interface import get_gateway_info
# put the operation decorator on any function that is a task


# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml



######################################################
# 配置PA的弹窗控制
######################################################operation
def waf_create(ctx,login_ip,cookie_jar):
    ctx.logger.info("............start task:creating web app firewall Settings............")
    url = ctx.node.properties['url']
    close_popup_windows = ctx.node.properties['close_popup_windows']
    ctx.logger.info("success and url=%s close_popup_windows =%s " % (url,close_popup_windows))

def waf_delete(ctx,login_ip,cookie_jar):
    ctx.logger.info("............delete task:creating web app firewall Settings............")
    url = ctx.node.properties['url']
    ctx.logger.info("success and url=%s  " % (url))

def create(**kwargs):
    L = []

    gateway_info = get_gateway_info()
    while True:
        try:
            T = gateway_info.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            waf_create(ctx,ip_port,login_cookie)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break

    #   insert into DB
    gateway_list = ",".join(L)
    ctx.logger.info("gateway_list = %s" % (gateway_list))
    db_update(ctx,gateway_list)

def delete(**kwargs):
    L = []

    gateway_info = get_gateway_info()
    while True:
        try:
            T = gateway_info.next()
            ip_port = T[0]
            login_cookie = T[1]
            gateway_number = T[2]
            waf_delete(ctx,ip_port,login_cookie)
            login_cookie.clear()
            L.append(gateway_number)
        except:
            break

    #   insert into DB
    gateway_list = ",".join(L)
    ctx.logger.info("gateway_list = %s" % (gateway_list))
    db_delete(ctx)

def db_update(ctx,gateway_list):

    url = ctx.node.properties['url']
    close_popup_windows = ctx.node.properties['close_popup_windows']

    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select url from web_app_firewall where url='%s'" % (url))
    cur.execute("select url from web_app_firewall where url='%s'" % (url))
    if cur.fetchall():
        ctx.logger.info("update web_app_firewall set gateway_list='%s',url='%s',close_popup_windows=%s, where url='%s';"
                        % (gateway_list, url, close_popup_windows))
        cur.execute("update web_app_firewall set gateway_list='%s',url='%s',close_popup_windows=%s, where url='%s';"
                        % (gateway_list, url, close_popup_windows))
    else:
        ctx.logger.info("insert into web_app_firewall (gateway_list,url,close_popup_windows) values ('%s','%s','%s');" % (
            gateway_list, url, close_popup_windows))
        cur.execute("insert into web_app_firewall (gateway_list,url,close_popup_windows) values ('%s','%s','%s');" % (
            gateway_list, url, close_popup_windows))
    conn.commit()
    conn.close()

def db_delete(ctx):

    url = ctx.node.properties['url']

    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    ctx.logger.info("select url from web_app_firewall where url='%s'" % url)
    cur.execute("select url from web_app_firewall where url='%s'" % url)
    if cur.fetchall():
        ctx.logger.info("delete from web_app_firewall where url='%s';" % (url))
        cur.execute("delete from web_app_firewall where url='%s';" % (url))
        conn.commit()
    else:
        ctx.logger.info("data not exists.")
    conn.close()

