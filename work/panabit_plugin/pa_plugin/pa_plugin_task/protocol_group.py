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


def protocol_group_create(ctx, login_ip, cookie_jar):
    ctx.logger.info('............start task: start create protocol group............')

    agpname = ctx.node.properties['group_en_name']
    agpcname = ctx.node.properties['group_cn_name']
    applist = ctx.node.properties['applist']
    L = []
    
    if agpname == 'high_speed_user' or agpname == 'low_speed_user':
        applist_final = applist
    elif applist:
        applist = applist.split(',')
        if 'game' in applist:
            L.append("webgame,gameweihu,youxijiasu,131wanwan,youxiguantou,kuaikuaiyouxi,yunyouxi,douyouyouxi,game")
        if 'video' in applist:
            L.append("webvideo,nettv,stream")
        if 'mobile' in applist:
            L.append("voip,qqvidchat,weixinvoicevideo,qtyuyin,sinaucvideo,baiduyuyin,aixiuyuyin,vvshipin,kangfushiping,liaoliaoyuyin,waiwaiyuyin,shengdayuyin,9158shiping")
        if 'webmail' in applist:
            L.append("email,webmail")
        applist_final = ",".join(L)
        ctx.logger.info('final applist is ' + applist_final)

    url = 'https://' + login_ip + '/cgi-bin/Protocol/usragp_add'
    post_data = {'agpname': agpname, 'agpcname': agpcname}
    resp = requests.post(
        url, data=post_data, verify=False, cookies=cookie_jar
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    url = 'https://' + login_ip + '/cgi-bin/Protocol/usragp_edit'
    post_data = {'action': 'load', 'agpid': agpname, 'applist': applist_final}
    resp = requests.post(
        url, data=post_data, verify=False, cookies=cookie_jar
    )
    status = resp.status_code
    ctx.logger.info('POST, url= '+ url)
    ctx.logger.info('status code = '+ str(status))

    ctx.logger.info('finish task: create protocol group, protocol group name = '+ agpcname )


def protocol_group_delete(agpid , login_ip, cookie_jar):
    ctx.logger.info('............start task: delete protocol group............')

    list_url = 'https://' + login_ip + '/cgi-bin/Protocol/usragp_list'
    resp = requests.get(
        list_url, verify=False, cookies=cookie_jar, params={'action' : 'delete', 'agpid' : agpid}
    )
    status = resp.status_code
    ctx.logger.info ('status code = '+ str(status))
    ctx.logger.info('finish task: delete protocol group, protocol group name = '+ agpid)


