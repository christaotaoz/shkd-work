# -*- coding: utf-8 -*-

from cloudify import ctx
import requests
import json
import re
import psycopg2
from public_gateway_interface import get_gateway_info


# def get_gateway_info(cloud_ip):
#     # #禁止警告(python3 才有)
#  #   requests.packages.urllib3.disable_warnings()
#
#     #登录云平台,获取登录的cookie
#     res1 = requests.post('https://%s/Maintain/cloud_login.php'%cloud_ip,data={'user':'admin','pass':'panabit'},verify=False, timeout=5)
#     cookie1 = res1.cookies
#
#     #获取所有网关信息
#     all_gateway_data = {
#         'type': 'cloud_devlist','grpid': '0','sch':'','sort': 'license_id12','g_ascdesc': 'asc','page': '1','limit': '20','expire': '0'
#     }
#     gateway_all_list = requests.post('https://%s/Maintain/system_handle.php'%cloud_ip,data=all_gateway_data,cookies=cookie1,verify=False, timeout=5)
#     gateway_dict = json.loads(gateway_all_list.text)
#     gateway_list = gateway_dict['rows']
#     ctx.logger.info(u'共查询到 %d 个网关信息'%len(gateway_list)+'\n')
#
#     # 遍历网关信息
#     for i in range(len(gateway_list)):
#         ip_port = cloud_ip +'$$'+ gateway_list[i]['webport']
#         license_id = gateway_list[i]['license_id12']
#         yield ip_port + '$$' + license_id + '$$' + str(dict(cookie1))

# 专业版查询策略路由
def policy_route_search(cloud_ip, port, lic_id, cookies):
    # 获取panabit的验证接口
    res2 = requests.post('https://%s/Maintain/system_handle.php' % cloud_ip,
                         data={'type': 'openssh_m', 'licenseid': '%s' % lic_id, 'webenable': '1', 'sshenable': '0'},
                         cookies=cookies, verify=False, timeout=5)

    # 将json转换为字典
    d = json.loads(res2.text)
    data = d['str'].split('-')
    surl = '/login/userverify.cgi?pakey=' + data[2] + '&username=admin'

    # 获取用户验证 的cookies
    res3 = requests.get("https://" + '%s' % cloud_ip + ":" + data[0] + surl, verify=False, timeout=5)
    cookie3 = dict(res3.cookies)
    ctx.logger.info(str(cookie3))

    # 字典合并
    valid_cookie = dict(cookies, **cookie3)
    ctx.logger.info(str(valid_cookie))

    # 获取策略路由列表
    res4 = requests.get('https://{}:{}/cgi-bin/Route/policy_list'.format(cloud_ip, port), cookies=valid_cookie,verify=False, timeout=5)
    # ctx.logger.info(res4.text)

    # 判断是否有数据
    num_pattern = '<td.*?>.*?(\d+).*?</td>'
    num_L = re.findall(num_pattern, res4.text)
    ctx.logger.info('ok')

    if not num_L:
        ctx.logger.info(u'网关%s:%s没有策略路由！！' % (cloud_ip, port))
    else:
        ctx.logger.info('re matching ok')
        # 正则匹配数据
        pattern = '<td.*?>(.*?)</td>'
        L = re.findall(pattern, res4.text)
        re_L = list()
        for i in L:
            # # 去除空格(html）
            i = re.sub('&nbsp;', ' ', i)
            # # 去除a标签或者span标签
            a = re.findall('>(.*?)<', i)
            # ctx.logger.info(a)
            if a:
                i = a[0]
            # i为Unicode编码格式 + 去空格
            i = i.strip()

            re_L.append(i)

        # # 将utf-8编码的格式 解码为 Unicode
        index_of_add_policy = re_L.index(u'添加策略')
        del re_L[index_of_add_policy]
        re_L.insert(1, u'当前')
        re_L.insert(17, u'state')

        # 获取状态信息和源接口字段
        res5 = requests.post('https://%s:%s/cgi-bin/Route/ajax_policy_stat' % (cloud_ip, port),cookies=valid_cookie, verify=False, timeout=10)
        iniftype_and_state_list = re.findall("inifname:'(.*?)',.*?standby.*?state:'(.*)'}", res5.text)
        ctx.logger.info('get state and source interface ok')

        # 插入状态信息和源接口字段
        try:
            for i in range(int(len(re_L) // 18)):
                re_L[18 + i * 18 + 3] = iniftype_and_state_list[i][0]
                re_L.insert(18 + i * 18 + 17, iniftype_and_state_list[i][1])
        except:
            pass
        #如果有数据则写入数据库
        conn = psycopg2.connect(database='cloudify_db',user='cloudify',password='cloudify', host='127.0.0.1', port='5432')
        cur = conn.cursor()
        cur.execute('select number from policyroutes;')
        L = cur.fetchall()
        L = [x[0] for x in L]
        ctx.logger.info(str(L))
        Counts = int(len(re_L)/18)

        for i in range(Counts):
            if i >=1:
                if re_L[18*i+17] == '1':
                    re_L[18*i+17] = 'on'
                if re_L[18 * i + 17] == '0':
                    re_L[18 * i + 17] = 'off'
                if not L:
                    cur.execute("insert into policyroutes(number,current,user_group,source_interface,vlan,ttl,source_addr_port,to_addr_port,protocol, application,dscp, user_type,action,to_route,next_jump,match_times,remark,state) values("
                                "'%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')" % (re_L[18*i],re_L[18*i+1],re_L[18*i+2],re_L[18*i+3],re_L[18*i+4],re_L[18*i+5],re_L[18*i+6],re_L[18*i+7],re_L[18*i+8],re_L[18*i+9],re_L[18*i+10],re_L[18*i+11],re_L[18*i+12],re_L[18*i+13],re_L[18*i+14],re_L[18*i+15],re_L[18*i+16],re_L[18*i+17]))
                    conn.commit()
                else:
                    if re_L[18 * i] in L:
                        cur.execute("update policyroutes set number='%s',current='%s',user_group='%s',source_interface='%s',vlan='%s',ttl='%s',source_addr_port='%s',to_addr_port='%s',protocol='%s', application='%s',dscp='%s', user_type='%s',action='%s',to_route='%s',next_jump='%s',match_times='%s',remark='%s',state='%s' where number='%s'"% (re_L[18*i],re_L[18*i+1],re_L[18*i+2],re_L[18*i+3],re_L[18*i+4],re_L[18*i+5],re_L[18*i+6],re_L[18*i+7],re_L[18*i+8],re_L[18*i+9],re_L[18*i+10],re_L[18*i+11],re_L[18*i+12],re_L[18*i+13],re_L[18*i+14],re_L[18*i+15],re_L[18*i+16],re_L[18*i+17],re_L[18*i]))
                        conn.commit()
                    else:
                        cur.execute(
                            "insert into policyroutes(number,current,user_group,source_interface,vlan,ttl,source_addr_port,to_addr_port,protocol, application,dscp, user_type,action,to_route,next_jump,match_times,remark,state) values("
                            "'%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')" % (
                            re_L[18 * i], re_L[18 * i + 1], re_L[18 * i + 2], re_L[18 * i + 3], re_L[18 * i + 4],
                            re_L[18 * i + 5], re_L[18 * i + 6], re_L[18 * i + 7], re_L[18 * i + 8], re_L[18 * i + 9],
                            re_L[18 * i + 10], re_L[18 * i + 11], re_L[18 * i + 12], re_L[18 * i + 13],
                            re_L[18 * i + 14], re_L[18 * i + 15], re_L[18 * i + 16], re_L[18 * i + 17]))
                        conn.commit()
        conn.close()
        # ctx.logger.info('@@@@@@@@@@@@policy_route_search successfuly!!@@@@@@@@@@@')


def setStateOff():
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    cur.execute('select number from policyroutes;')
    L = cur.fetchall()
    if L:
        cur.execute("update policyroutes set state='off';")
        conn.commit()
    conn.close()


def main():
    all = get_gateway_info()
    setStateOff()
    while True:
        try:
            infos = next(all)
            ctx.logger.info(infos)
            cloud_ip = infos[0].split(':')[0]
            port = infos[0].split(':')[1]
            cookies = infos[1]
            license_id = infos[-1]
            policy_route_search(cloud_ip,port,license_id,cookies)
        except StopIteration as e:
            ctx.logger.info('StopIteration')
            break


def update(**kwargs):
    ctx.logger.info('............pa_policy_route_search is running............')
    main()



