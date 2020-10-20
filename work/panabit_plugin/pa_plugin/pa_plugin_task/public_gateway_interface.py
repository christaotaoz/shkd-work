# -*- coding: utf-8 -*-

from cloudify import ctx
import requests
import json
cloud_ip='192.168.4.71'

def get_gateway_info():
    # #禁止警告(python3 才有)
    requests.packages.urllib3.disable_warnings()

    #登录云平台,获取登录的cookie
    res1 = requests.post('https://%s/Maintain/cloud_login.php'%cloud_ip,data={'user':'admin','pass':'panabit'},verify=False, timeout=5)
    cookie1 = res1.cookies

    #获取所有网关信息
    all_gateway_data = {
        'type': 'cloud_devlist','grpid': '0','sch':'','sort': 'license_id12','g_ascdesc': 'asc','page': '1','limit': '20','expire': '0'
    }
    gateway_all_list = requests.post('https://%s/Maintain/system_handle.php'%cloud_ip,data=all_gateway_data,cookies=cookie1,verify=False, timeout=5)
    gateway_dict = json.loads(gateway_all_list.text)
    gateway_list = gateway_dict['rows']
    ctx.logger.info('共查询到 %d 个网关信息'%len(gateway_list)+'\n')

    # 遍历网关信息
    for i in range(len(gateway_list)):
        ip_port = cloud_ip +':'+ gateway_list[i]['webport']
        try:
            # 获取panabit的验证接口
            res2 = requests.post('https://%s/Maintain/system_handle.php' % cloud_ip,
                                 data={'type': 'openssh_m', 'licenseid': '%s' % gateway_list[i]['license_id12'], 'webenable': '1', 'sshenable': '0'},
                                 cookies=cookie1, verify=False, timeout=10)
            gateway_number = gateway_list[i]['license_id12']
            # 将json转换为字典
            d = json.loads(res2.text)
            data = d['str'].split('-')
            surl = '/login/userverify.cgi?pakey=' + data[2] + '&username=admin'

            # 获取用户验证 的cookies
            res3 = requests.get("https://" + '%s' % cloud_ip + ":" + data[0] + surl, verify=False, timeout=10)
            cookie3 = dict(res3.cookies)

            # 字典合并
            valid_cookie = dict(cookie1, **cookie3)
            ctx.logger.info(str(i) + ':' + str(ip_port))
            yield ip_port, valid_cookie, gateway_number
        except Exception as e:
            ctx.logger.info(str(e))
            pass