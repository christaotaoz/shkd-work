# -*- coding: utf-8 -*-

from cloudify import ctx
from public_gateway_interface import get_gateway_info
import requests
import re
import psycopg2


# 专业版查询接口信息
def interface(ip_port,cookies):

    # 获取状态信息和源接口字段
    res5 = requests.post('https://%s/cgi-bin/Route/ajax_proxy_list' % ip_port, cookies=cookies,
                         verify=False, timeout=5)

    ip_list = re.findall("ip:'(.*?)'", res5.text)
    state_list = re.findall("state:'(.*?)'", res5.text)

    d = dict()
    for k, v in zip(ip_list, state_list):
        d[k] = v
    ctx.logger.info('interface is running...............................')
    return d


def wan_interface(ip_port,cookies,license_id):
    # 获取必要参数
    d = interface(ip_port,cookies)

    # 获取wan接口信息
    res4 = requests.get('https://%s/cgi-bin/Route/proxy_list'%ip_port, cookies=cookies, verify=False, timeout=10)
    html = res4.text

    # 判断是否有数据
    num_pattern = '<td.*?>.*?(\d+).*?</td>'
    num_L = re.findall(num_pattern, html)
    if not num_L:
        ctx.logger.info('网关%s没有wan接口信息！！' % ip_port)
    else:
        Value = data_filter(html)

        # 插入状态信息和源接口字段
        for i in range(0, int(len(Value) // 13) - 1):
            if Value[i * 13 + 13 + 4].strip() in d:
                Value[i * 13 + 13 + 3] = d[Value[i * 13 + 13 + 4].strip()]

        # 如果有数据则写入数据库
        conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
        cur = conn.cursor()
        cur.execute('select ip,licence_id from wan_interface;')
        L = cur.fetchall()
        ctx.logger.info('------------------查询到WAN(ip，license_id):'+str(L)+'------------------')
        Counts = int(len(Value) / 13)
        for i in range(Counts):
            if i >= 1:
                if Value[13 * i + 3] == '1':
                    Value[13 * i + 3] = 'on'
                if Value[13 * i + 3] == '0':
                    Value[13 * i + 3] = 'off'
                #没有数据的时插入数据
                if not L:
                    cur.execute(
                        "insert into wan_interface(number,line_name,network_card,state,ip,gateway,mtu,vlan,dns_traction_failure_rate,Inflow_rate,outflow_rate,connects,annotate,licence_id) values('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')" % (
                        Value[13 * i], Value[13 * i + 1], Value[13 * i + 2], Value[13 * i + 3], Value[13 * i + 4],
                        Value[13 * i + 5], Value[13 * i + 6], Value[13 * i + 7], Value[13 * i + 8], Value[13 * i + 9],
                        Value[13 * i + 10], Value[13 * i + 11], Value[13 * i + 12],license_id))
                    conn.commit()
                # 有数据的时候，根据ip做更新或者插入操作
                else:
                    ctx.logger.info('------------------准备更新WAN数据------------------')
                    ctx.logger.info('------------------%s------------------'%str(L))
                    cur.execute(
                        "update wan_interface set number='%s',line_name='%s',network_card='%s',state='%s',ip='%s',gateway='%s',mtu='%s',vlan='%s',dns_traction_failure_rate='%s',Inflow_rate='%s',outflow_rate='%s',connects='%s',annotate='%s',licence_id='%s' where ip='%s' and licence_id='%s';"% (
                            Value[13 * i], Value[13 * i + 1], Value[13 * i + 2], Value[13 * i + 3], Value[13 * i + 4],
                            Value[13 * i + 5], Value[13 * i + 6], Value[13 * i + 7], Value[13 * i + 8],
                            Value[13 * i + 9],Value[13 * i + 10], Value[13 * i + 11], Value[13 * i + 12], license_id, Value[13 * i + 4],license_id))
                    conn.commit()
                    ctx.logger.info('------------------更新WAN数据完成------------------')
        conn.close()
        ctx.logger.info('------------------wan interface search successfully!!------------------')

def lan_interface(ip_port,cookies,license_id):
    # 获取必要参数
    d = interface(ip_port,cookies)

    # 获取wan接口信息
    res4 = requests.get('https://%s/cgi-bin/Route/iflan_list'%ip_port, cookies=cookies,verify=False, timeout=5)
    html = res4.text

    # 判断是否有数据
    num_pattern = '<td.*?>.*?(\d+).*?</td>'
    num_L = re.findall(num_pattern,html)
    if not num_L:
        ctx.logger.info('------------------网关%s没有lan接口信息！！------------------' % ip_port)
    else:
        Value = data_filter(html)

        # 插入状态信息和源接口字段
        for i in range(0, int(len(Value) // 10) - 1):
            if Value[i * 10 + 10 + 4].strip() in d:
                Value[i * 10 + 10 + 3] = d[Value[i * 10 + 10 + 4].strip()]

        # 如果有数据则写入数据库
        conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
        cur = conn.cursor()
        Counts = int(len(Value) / 10)
        cur.execute('select ip,licence_id from lan_interface;')
        L = cur.fetchall()
        ctx.logger.info('查询到LAN(ip，license_id):'+str(L))
        for i in range(Counts):
            if i >= 1:
                if Value[10 * i + 3] == '1':
                    Value[10 * i + 3] = 'on'
                if Value[10 * i + 3] == '0':
                    Value[10 * i + 3] = 'off'
                if not L:
                    cur.execute(
                        "insert into lan_interface(number,interface_name,network_card,state,ip,network_mask,mtu,vlan,inflow_rate,outflow_rate,licence_id) values('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')" % (Value[10 * i], Value[10 * i + 1], Value[10 * i + 2], Value[10 * i + 3], Value[10 * i + 4],Value[10 * i + 5], Value[10 * i + 6], Value[10 * i + 7], Value[10 * i + 8], Value[10 * i + 9],license_id))
                    conn.commit()
                else:
                    ctx.logger.info('------------------准备更新LAN数据------------------')
                    cur.execute(
                        "update lan_interface set number='%s',interface_name='%s',network_card='%s',state='%s',ip='%s',network_mask='%s',mtu='%s',vlan='%s',inflow_rate='%s',outflow_rate='%s',licence_id='%s' where ip='%s' and licence_id='%s'" % (
                        Value[10 * i], Value[10 * i + 1], Value[10 * i + 2], Value[10 * i + 3], Value[10 * i + 4],Value[10 * i + 5], Value[10 * i + 6], Value[10 * i + 7], Value[10 * i + 8], Value[10 * i + 9],license_id,Value[10 * i + 4],license_id))
                    conn.commit()
                    ctx.logger.info('------------------更新LAN数据完成------------------')
        conn.close()
        ctx.logger.info('------------------lan interface search successfully!!------------------')

# 清洗数据
def data_filter(html):
    pattern_br = '\n|\n\t'          # 去换行
    pattern_input = '<input.*?>'    # 去 input 标签
    pattern_img = '<img.*?>'        # 去 img 标签
    pattern_a = '<a.*?>|</a>'       # 去 a 标签
    pattern_nbsp = '&nbsp;'         # 去 &nbsp;
    pattern_span = '<span.*?>|</span>'                          # 去 标签
    pattern_right1 = '<td width=.{1,3} align=right>.*?</td>'    # 去 右侧标题栏
    pattern_right2 = '<td align=right>.*?</td>'                 # 去 右侧数据栏

    html = re.sub(pattern_br, '', html, flags=re.S)
    html = re.sub(pattern_input, '', html)
    html = re.sub(pattern_img, '', html)
    html = re.sub(pattern_a, '', html)
    html = re.sub(pattern_nbsp, '', html)
    html = re.sub(pattern_span, '', html)
    html = re.sub(pattern_right1, '', html, flags=re.S)
    html = re.sub(pattern_right2, '', html, flags=re.S)

    pattern = '<td.*?>(.*?)</td>'
    Value = re.findall(pattern, html, flags=re.S)
    return Value

def main():
    all = get_gateway_info()
    while True:
        try:
            infos =next(all)
            ctx.logger.info(infos)
            ip_port = infos[0]
            cookies = infos[1]
            license_id = infos[-1]
            lan_interface(ip_port,cookies,license_id)
            wan_interface(ip_port,cookies,license_id)
        except StopIteration as e:
            ctx.logger.info('StopIteration')
            break


def update(**kwargs):
    ctx.logger.info('............pa_get_interface_search is running............')
    main()

