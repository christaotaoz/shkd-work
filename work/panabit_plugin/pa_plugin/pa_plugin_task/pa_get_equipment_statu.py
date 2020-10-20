# -*- coding: utf-8 -*-

from cloudify import ctx
from public_gateway_interface import get_gateway_info
import requests
import json
import time
import psycopg2

def get_equipment_status(ip,cookies,license_id,i,conn,cur,L):
    data  = {
        "type" : "cloud_devlist" ,
        "grpid" : "0" ,
        "sch" : "" ,
        "sort" : "license_id12" ,
        "g_ascdesc" : "asc" ,
        "page" : "1" ,
        "limit" : "20" ,
        "expire" : "0"
    }
    resp = requests.post('https://%s/Maintain/system_handle.php' % ip,data=data, cookies=cookies,verify=False, timeout=5)

    d = json.loads(resp.text)
    d = d['rows'][i]
    #编号
    license_id = license_id
    #名称
    sys_name = d['sys_name']
    #状态(暂未处理)
    #最后在线
    time_str = d['time_str']
    #有效期
    license_end = d['license_end']
    cur_time = int(time.time())
    valid_time = str((int(license_end) - int(cur_time))//(3600*24) + 1)
    #用户
    users =  str(d['users'])+ '/' + str(d['max_users']) + '/' + str(d['max_ipcnt'])
    #连接数
    flowcont = str(d['flowcont']) + '/' + str(d['max_flowcont'])
    #上行/下行(bps)
    bps = str(d['upbps']) + '/' + str(d['downbps'])
    #运行
    sys_run = d['sys_run']
    #温度
    temp_cpu = str(d['temp']) + '/' + str(d['cpu'])
    #当前版本
    version = d['version']
    # 写数据库
    #没有数据的情况，新增网关
    if not L:
        ctx.logger.info("------------------insert:'%s'------------------" % license_id)
        cur.execute("insert into equipment_status(license_id,sys_name,time_str,valid_time,users,flowcont,bps,sys_run,temp_cpu,version) values('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s');" % ( license_id,sys_name,time_str,valid_time,users,flowcont,bps,sys_run,temp_cpu,version))
        conn.commit()
        ctx.logger.info('------------------insert %s ok----------------------'%license_id)
    #有数据
    else:
        if license_id in L:
            ctx.logger.info("------------------update:'%s'------------------"%license_id)
            cur.execute("update equipment_status set sys_name='%s',time_str='%s',valid_time='%s',users='%s',flowcont='%s',bps='%s',sys_run='%s',temp_cpu='%s',version='%s',state='on' where license_id ='%s';"%(sys_name,time_str,valid_time,users,flowcont,bps,sys_run,temp_cpu,version,license_id))
            conn.commit()
            ctx.logger.info('------------------update %s ok----------------------'%license_id)
        #新增网关
        else:
            ctx.logger.info("------------------insert:'%s'------------------" % license_id)
            cur.execute(
                "insert into equipment_status(license_id,sys_name,time_str,valid_time,users,flowcont,bps,sys_run,temp_cpu,version) values('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s');" % (
                license_id, sys_name, time_str, valid_time, users, flowcont, bps, sys_run, temp_cpu, version))
            conn.commit()
            ctx.logger.info('------------------insert %s ok----------------------' % license_id)


def setStateOff():
    conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    cur.execute('select license_id from equipment_status;')
    L = cur.fetchall()
    L = [x[0] for x in L]
    ctx.logger.info("------------------change all pa off------------------" )
    for i in L:
        cur.execute(
            "update equipment_status set state='off' where license_id ='%s';" % i)
        conn.commit()
    return conn,cur,L

def main():
    all = get_gateway_info()
    conn,cur,L = setStateOff()
    i = 0
    while True:
        try:
            infos =next(all)
            ip = infos[0].split(':')[0]
            cookies = infos[1]
            license_id = infos[-1]
            get_equipment_status(ip, cookies,license_id,i,conn,cur,L)
            i += 1
        except StopIteration as e:
            ctx.logger.info('------------------StopIteration------------------')
            break
    conn.close()

def update(**kwargs):
    ctx.logger.info('------------------pa_equipment_search is running------------------')
    main()




