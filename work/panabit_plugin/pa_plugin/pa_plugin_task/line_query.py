 #-*- coding:utf-8 -*-

from cloudify import ctx
import requests
from cloudify.decorators import operation
import psycopg2
import time,datetime
import sys
import ConfigParser
import json,ast,re
reload(sys)
sys.setdefaultencoding('utf8')

@operation
def update(**kwargs):
    ctx.logger.info('正在链路查询')
    cloud_ip = get_conf_info("cloud_server","cloud_ip")
    cloud_user = get_conf_info("cloud_server","cloud_user")   
    cloud_passwd = get_conf_info("cloud_server","cloud_pass")
    netway_info = get_gateway_info(cloud_ip,cloud_user,cloud_passwd)     #网关列表迭代对象
    while True:
        try:
            info = next(netway_info).split("$$")
        except StopIteration:
            break
        ip_port = info[0] + ":" + info[1]
        license_id = info[2]
        cookies = info[3]
        sys_name=info[4]
        # print login_ip
        # print cookies
        date = get_em_info(ip_port, cookies,license_id,sys_name)
        upadte_database(date)
    ctx.logger.info('链路查询完成')




def upadte_database(date):
    '''
    更新或者插入链路信息数据库
    '''
    update_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    conn = psycopg2.connect(database='cloudify_db',user='cloudify',password='cloudify',host='127.0.0.1',port='5432')
    cur = conn.cursor()
    gatewayinterface = date[-1]['gateway']
    sys_name = date[-1]['sys_name']
    date.pop()
    # print date
    for gateinfo in date:
        name = gateinfo['name']
        inpps= gateinfo['inpps']
        inbps= gateinfo['inbps']
        outpps= gateinfo['outpps']
        state= gateinfo['state']
        outbps= gateinfo['outbps']
        cur.execute("select gateway from lineamout where \
                     gateway='%s' and name='%s'"%(gatewayinterface,name))
        if  cur.fetchall():
            cur.execute("update lineamout set inpps='%s',inbps='%s',outpps='%s',state='%s',outbps='%s',update_time='%s',sys_name='%s'\
                        where name='%s' and gateway='%s'"%(inpps,inbps,outpps,state,outbps,update_time,sys_name,name,gatewayinterface))
        else:
            cur.execute("insert into lineamout (inpps,inbps,name,outpps,state,outbps,gateway,update_time,sys_name) \
            values ('%s','%s','%s','%s','%s','%s','%s','%s','%s')"%(inpps,inbps,name,outpps,state,outbps,gatewayinterface,update_time,sys_name))
        conn.commit()
    conn.close()
    ctx.logger.info(sys_name + "..........更新成功...........")






def get_gateway_info(cloud_ip,user,password):
    '''
    获取云平台上网关迭代对象
    '''
    requests.packages.urllib3.disable_warnings()
    res1 = requests.post('https://%s/Maintain/cloud_login.php'%cloud_ip,data={'user':user,'pass':password},verify=False, timeout=3)
    # print res1.text
    cookie1 = res1.cookies
    all_gateway_data = {
        'type': 'cloud_devlist','grpid': '0','sch':'','sort': 'license_id12',
        'g_ascdesc': 'asc','page': '1','limit': '20000','expire': '0'
    }
    gateway_all_list = requests.post('https://%s/Maintain/system_handle.php'%cloud_ip,data=all_gateway_data,cookies=cookie1,verify=False, timeout=3)
    # print gateway_all_list.text
    gateway_dict = json.loads(gateway_all_list.text)
    gateway_list = gateway_dict['rows']


    for i in range(len(gateway_list)):
        ip_port = cloud_ip +'$$'+ gateway_list[i]['webport']
        license_id = gateway_list[i]['license_id12']
        # 获取panabit的验证接口
        try:
            res2 = requests.post('https://%s/Maintain/system_handle.php' % cloud_ip,
                                 data={'type': 'openssh_m', 'licenseid': '%s' % license_id, 'webenable': '1',
                                       'sshenable': '0'},
                                 cookies=cookie1, verify=False, timeout=3)

            # 将json转换为字典
            d = json.loads(res2.text)
            data = d['str'].split('-')
            surl = '/login/userverify.cgi?pakey=' + data[2] + '&username=admin'

            # 获取用户验证 的cookies
            res3 = requests.get("https://" + '%s' % cloud_ip + ":" + data[0] + surl, verify=False, timeout=3)
            cookie3 = dict(res3.cookies)
            # print(str(cookie3))
            # 字典合并
            valid_cookie = dict(cookie1, **cookie3)
            # print(str(valid_cookie))
            sys_name = gateway_list[i]['sys_name']
            yield ip_port + '$$' + license_id + '$$' + str(valid_cookie)+"$$"+sys_name
        except StopIteration:
            break
        except requests.exceptions.ReadTimeout:
            pass




def get_em_info(ip_port, cookies,license_id,sys_name):
    '''
    解析网关线路的数据信息
    '''
    
    cookies = eval(cookies)

    ####ajax动态获取线路信息
    resp = requests.post('https://%s/cgi-bin/Monitor/ajax_if_stat'%ip_port,cookies=cookies,verify=False,timeout=5)
    ems = eval(resp.text)
    # print ems

    gate_dict={"gateway":license_id,"sys_name":sys_name}
    ems.append(gate_dict)

    resp2 = requests.get('https://%s/cgi-bin/Monitor/if_stat'%ip_port,cookies=cookies,verify=False,timeout=5)
    # print(type(resp2.text),resp2.text)
    html = resp2.text

    # #
    p1 = '<td.*?>(.*?)</td>'
    L = re.findall(p1,html)
    data = data_filter(resp2.text)
    # print(len(L))
    valid_list = []
    date_dist={}
    for i in L:
        i = data_filter(i)
        if i == u'网卡调度>>':
            continue
        #     print('11111111111111111111111111111111111111')
        valid_list.append(i)
    # print json.dumps(valid_list).decode("unicode-escape")

    # #更新线路状态信息 0/1
    # for index in range(len(ems)-1):
    #     # print ems[index]
    #     for k ,v in ems[index].items():
    #         if v == 'summary':
    #             break
    #         if k == 'state':
    #             valid_list[5+14*(index+1)] = v
    # print json.dumps(valid_list).decode("unicode-escape")

    #更新线路详细信息
    for index in range(len(ems)-2):
        # print ems[index]
        mode = valid_list[valid_list.index("接入模式")+14*(index+1)]
        location = valid_list[valid_list.index("接入位置")+14*(index+1)]
        drive = valid_list[valid_list.index("驱动")+14*(index+1)]
        rate = valid_list[valid_list.index("工作速率")+14*(index+1)]
        model = valid_list[valid_list.index("型号")+14*(index+1)]
        model = valid_list[valid_list.index("型号")+14*(index+1)]
        MAC = valid_list[valid_list.index("MAC")+14*(index+1)]

        # print json.dumps(valid_list).decode("unicode-escape")

        ems[index].update({"接入模式":mode})
        ems[index].update({"接入位置":location})
        ems[index].update({"驱动":drive})
        ems[index].update({"工作速率":rate})
        ems[index].update({"型号":model})
        ems[index].update({"MAC":MAC})
        # print json.dumps(ems[index]).decode("unicode-escape"),index
    # print json.dumps(ems).decode("unicode-escape"),sys_name
    return ems

def data_filter(html):
    '''
    清洗数据
    '''
    # pattern_br = '\n|\n\t'            # 去换行
    # pattern_input = '<input.*?>'      # 去 input 标签
    pattern_img = '<img.*?>'            # 去 img 标签
    pattern_a = '<a.*?>|</a>'           # 去 a 标签
    pattern_nbsp = '&nbsp;'             # 去 &nbsp;
    pattern_span = '<span.*?>|</span>'                          # 去 标签
    # pattern_right1 = '<td width=.{1,3} align=right>.*?</td>'    # 去 右侧标题栏
    # pattern_right2 = '<td align=right>.*?</td>'                 # 去 右侧数据栏
    pattern_b = '<b.*?>|</b>'           #去除b标签

    # html = re.sub(pattern_br, '', html, flags=re.S)
    # html = re.sub(pattern_input, '', html)
    html = re.sub(pattern_img, '', html)
    html = re.sub(pattern_a, '', html)
    html = re.sub(pattern_nbsp, '', html)
    html = re.sub(pattern_span, '', html)
    html = re.sub(pattern_b, '', html)
    # html = re.sub(pattern_right1, '', html, flags=re.S)
    # html = re.sub(pattern_right2, '', html, flags=re.S)

    # pattern = '<td.*?>(.*?)</td>'
    # Value = re.findall(pattern, html, flags=re.S)
    # return Value

    return html


def get_conf_info(section,option):
    conf_path = "/etc/ucm_init.conf"
    config = ConfigParser.ConfigParser()
    config.read(conf_path)
    r = config.get(section, option)
    return r
