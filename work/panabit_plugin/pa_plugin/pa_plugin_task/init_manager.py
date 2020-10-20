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

# this file is used by cloudify plugin interface implement
# which is defined in plugin.yaml

######################################################
#    这个文件用于初始化定义，初始管理网入口为192.168.4.xxx,
#    2个网卡，一个内网接口，一个网卡为外网接口，初始为监控模式
#    接口线路中前一网卡接lan口，初始名为lan1，一个网卡接wan口，初始名为wan1
######################################################operation
def update(**kwargs):
    ctx.logger.info('............start task:Initializing Settings............')
    login_ip = ctx.node.properties['connection_config'].get('host')  # 从节点读取ip
    login_username = ctx.node.properties['connection_config'].get('login_name')  # 从节点读取登录账号
    login_password = ctx.node.properties['connection_config'].get('login_password')  # 获取密码
    # new_login_password = ctx.node.properties['new_login_password']  # 获取新密码

    ipaddr = ctx.node.properties['ip']                  #获取管理网ip
    lanaddr = ctx.node.properties['lan']
    ctx.logger.info('+++++++++++++++ipaddr is= ' + ipaddr)
    netmask = ctx.node.properties['netmask']            #管理网掩码
    gateway = ctx.node.properties['gateway']            #管理网网关

    # lanaddr= "192.168.100.1"				#配置lan口ip

    login_url = 'https://' + login_ip + '/login/userverify.cgi'    #登录url
    login_data = {'username': login_username, 'password': login_password}                #登录提交的数据
    resp = requests.post(                            #转到登录操作
        login_url, verify=False, data=login_data     #获取新的cookie文件
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ login_url)
    ctx.logger.info('status code = '+ str(status))

    cookie_jar = resp.cookies                        #用新的cookie文件重新请求url


    #改第一块网卡接内网
    interface="em"+str(1)
    url = 'https://' + login_ip +'/cgi-bin/Setup/if_edit?ifname=' + interface
    post_data = {'mode': 0, 'zone': 'inside', 'peer': 'none', 'ifname': interface}
    resp = requests.post(
                url, verify=False, cookies=cookie_jar, data=post_data
            )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

   
    #改第二块网卡接外网
    interface="em"+str(2)
    url = 'https://' + login_ip +'/cgi-bin/Setup/if_edit?ifname=' + interface
    post_data = {'mode': 0, 'zone': 'outside', 'peer': 'none', 'ifname': interface}
    resp = requests.post(
        url, verify=False, cookies=cookie_jar, data=post_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    #配置接口线路wan和lan线路，
    # wan线路，默认dhcp，线路名称wan1
    url_add_wan = 'https://' + login_ip + '/cgi-bin/Route/proxy_add'
    url_add_lan = 'https://' + login_ip + '/cgi-bin/Route/iflan_add'

    proxyname = 'wan'+str(1)
    ifname = 'em' + str(2)
    post_data = {'proxyname': proxyname , 'wantype': 'dhcp', 'ifname': ifname,
                 'mtu' : 1500 , 'vlan' : 0 , 'vlan1' : 0,'pingip':'114.114.114.114', 'pingip2':'8.8.8.8',
                 'proxydns':'114.114.114','waitime':5,
        }
    resp = requests.post(
        url_add_wan,verify=False,cookies=cookie_jar,data=post_data
    )
    status = resp.status_code
    ctx.logger.info('POST, url= ' +url_add_wan)
    ctx.logger.info('status code = ' + str(status))


    # lan线路，线路名称lan1
    name = 'lan' + str(1)
    ifname = 'em' + str(1)
    # ifaddr = '192.168.' + str( 110+ i ) + '.0'
    ifaddr=str(lanaddr)
    post_data = {'name':name,'ifname':ifname,'ifaddr':ifaddr,'netmask':'255.255.255.0',
                 'vlan':0,'mtu':1500,'clonemac':'','mode':'work'
        }
    resp = requests.post(
        url_add_lan,verify=False,cookies=cookie_jar,data=post_data
        )
    status = resp.status_code
    ctx.logger.info('POST, url= ' + url_add_lan)
    ctx.logger.info('status code = ' + str(status))


    #lan开DHCP服务
    dhcp_url='https://' + login_ip + '/cgi-bin/Route/dhcpsvr_edit'
    lanaddr = lanaddr.encode('utf-8')
    lis = lanaddr.split('.')
    lis2 = copy.copy(lis)
    # print(lis)
    lis[-1] = '254'
    lis2[-1] = '2'
    lanaddr_start = '.'.join(lis2)
    lanaddr_end = ".".join(lis)
    # print(lanaddr)
    dhcp_pool = '{}-{}'.format(lanaddr_start, lanaddr_end)
    post_data = {
                "dhcp_enable":1,"dhcp_pool":dhcp_pool,"dhcp_gateway": lanaddr,
                "dhcp_mask": "255.255.255.0","dns0": "114.114.114.114","dns1":"8.8.8.8","dhcp_acaddr":"0.0.0.0",
                "leasettl":3600,"id":"lan1"
            }
    resp = requests.post(
                dhcp_url, verify=False, cookies=cookie_jar, data=post_data
            )





    #配置一条策略路由
    url_policy_addrule = 'https://' + login_ip + '/cgi-bin/Route/policy_addrule'
    inifname = 'proxy.lan' + str(1)
    nat_proxy = 'wan' + str(1)
    post_data = {
                'polno': 10, 'desc': 'router', 'inifname': inifname, 'pool': 0,
                'srctype': 'any', 'srcport': 0, 'dsttype': 'any', 'dstipnet': '',
                'dstiprng': '', 'dstport': 0, 'proto': 'any', 'appid': 'any', 'dscp': 0, 'usrtype': 'any',
                'action': 'nat', 'nat_proxy': nat_proxy, 'nat_nexthop': '_NULL_',
                'route_proxy': 'dhcp', 'route_nexthop': '0.0.0.0',
            }
    resp = requests.post(
                url_policy_addrule, verify=False, cookies=cookie_jar, data=post_data
            )
    ctx.logger.info('POST, url= ' + url_policy_addrule)
    ctx.logger.info('status code = ' + str(status))

    ctx.logger.info("配置管理ip")
    url = 'https://' + login_ip + '/cgi-bin/Setup/if_admin'  # 修改管理网的url
    post_data = {'ipaddr': ipaddr, 'netmask': netmask, 'gateway': gateway}  # 修改管理网ip所提交的数据
    try:
        resp = requests.post(
            url, verify=False, cookies=cookie_jar, data=post_data, timeout=15
        )
        ctx.logger.info("配置管理ip结束")
    except:
        pass
    status = resp.status_code
    ctx.logger.info('POST, url= ' + url)
    ctx.logger.info('status code = ' + str(status))
