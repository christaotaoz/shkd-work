# -*- coding: utf-8 -*-

from cloudify import ctx

from cloudify.decorators import operation

from napalm import get_network_driver

from bson import ObjectId

import pymongo

import re

import os

import psycopg2


@operation
def add(**kwargs):
    ip = ctx.node.properties['ip']
    #判断是否为合法ip
    compile_ip=re.compile('^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$')
    if compile_ip.match(ip):

        num = 0

        IMSI = ctx.node.properties['IMSI*']

        UE_NUMS = ctx.node.properties['UE_NUMS']

        APN = ctx.node.properties['APN']


        ctx.logger.info('IMSI:%s type:%s'%(IMSI,str(type(IMSI))))
        ctx.logger.info('UE_NUMS:%s type:%s'%(UE_NUMS,str(type(UE_NUMS))))
        ctx.logger.info('APN:%s type:%s'%(APN,str(type(APN))))

        if isinstance(IMSI,int) or isinstance(IMSI,long):
            if len(str(IMSI)) != 15:
                ctx.logger.info("IMSI is not valid as IMSI length != 15")
                return
        else:
            ctx.logger.info("IMSI is not valid as IMSI is not int")
            return

        if isinstance(UE_NUMS,int) or isinstance(UE_NUMS,long):
            if UE_NUMS < 1:
                ctx.logger.info("values is not valid as values must > 0")
                return
        else:
            ctx.logger.info("values is not valid as values is not int")
            return

        if not str(APN).isalpha():
            ctx.logger.info("APN is not valid as values must be pure alphabet")
            return

        coon = pymongo.MongoClient('192.168.4.76',27017)

        db=coon['open5gs']

        myset = db['subscribers']

        try:
            for i in range(UE_NUMS):
                _id = ObjectId()
                myset.insert({'access_restriction_data': 32, 'network_access_mode': 2, 'ambr': {'downlink': 1024000L, 'uplink': 1024000L}, 'subscribed_rau_tau_timer': 12, 'pdn': [{'qos': {'arp': {'priority_level': 8, 'pre_emption_vulnerability': 1, 'pre_emption_capability': 1}, 'qci': 9}, 'pcc_rule': [], 'ambr': {'downlink': 1024000L, 'uplink': 1024000L}, 'apn': '%s'%str(APN), '_id': ObjectId(_id), 'type': 2}], '__v': 0, 'subscriber_status': 0, 'security': {'k': '00112233445566778899AABBCCDDEEFF', 'op': None, 'opc': '279EB54971771559879284FDDDE3EE0C', 'sqn': 0, 'amf': '8000'}, '_id': ObjectId(_id), 'imsi': '%s'%str(IMSI)})
                IMSI += 1
                num += 1
            ctx.logger.info('Add %s User Successfully!'%(str(num)))
        except Exception as e:
            ctx.logger.info('Add User Failed!')
            ctx.logger.info("Error: %s"%str(e))
    else:
        ctx.logger.info('新增失败,失败原因: Invalid ip')


@operation
def delete(**kwargs):
    ip = ctx.node.properties['ip']

    #判断是否为合法ip
    compile_ip=re.compile('^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$')
    if compile_ip.match(ip):
        num = 0

        coon = pymongo.MongoClient('192.168.4.76',27017)

        db=coon['open5gs']

        myset = db['subscribers']

        IMSI_1 = ctx.node.properties['IMSI_1']

        IMSI_2 = ctx.node.properties['IMSI_2']

        if isinstance(IMSI_1,int) or isinstance(IMSI_1,long):
            if len(str(IMSI_1)) != 15:
                ctx.logger.info("IMSI_1 is not valid as IMSI_1 length != 15")
                return
        else:
            ctx.logger.info("IMSI_1 is not valid as IMSI_1 is not int")
            return

        if isinstance(IMSI_2,int) or isinstance(IMSI_2,long):
            if IMSI_2 < IMSI_1:
                ctx.logger.info("IMSI_2 is not valid as IMSI_2 <= IMSI_1")
                return
            if len(str(IMSI_2)) != 15:
                ctx.logger.info("IMSI_2 is not valid as IMSI_2 length != 15")
                return
            try:
                all = myset.find({"imsi": {'$gte':'%s'%str(IMSI_1),'$lte':'%s'%str(IMSI_2)}})
                for i in all:
                    myset.delete_one({'imsi':'%s'%i['imsi']})
                    num += 1
                ctx.logger.info('Delete %s User Sucessfully!'%(str(num)))
            except Exception as e:
                ctx.logger.info('Delete User Failed!')
                ctx.logger.info("Error: %s"%str(e))
        else:
            ctx.logger.info("IMSI_2 is not valid as IMSI_2 is not int")
            return
    else:
        ctx.logger.info('删除失败,失败原因: Invalid ip')


@operation
def update(**kwargs):
    ip = ctx.node.properties['ip']

    #判断是否为合法ip
    compile_ip=re.compile('^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$')
    if compile_ip.match(ip):

        IMSI = ctx.node.properties['IMSI*']
        APN = ctx.node.properties['APN']


        ctx.logger.info('IMSI:%s type:%s'%(IMSI,str(type(IMSI))))
        ctx.logger.info('APN:%s type:%s'%(APN,str(type(APN))))

        if isinstance(IMSI,int) or isinstance(IMSI,long):
            if len(str(IMSI)) != 15:
                ctx.logger.info("IMSI is not valid as IMSI length != 15")
                return
        else:
            ctx.logger.info("IMSI is not valid as IMSI is not int")
            return

        if not str(APN).isalpha():
            ctx.logger.info("APN is not valid as values must be pure alphabet")
            return


        coon = pymongo.MongoClient('192.168.4.76',27017)

        db=coon['open5gs']

        myset = db['subscribers']

        try:
            d =  myset.find_one({"imsi":"%s"%IMSI})

            pdn = d['pdn']

            pdn[0]['apn'] = APN

            myset.update_one({"imsi":"%s"%IMSI},{"$set": {'pdn': pdn }})
            ctx.logger.info('Update User APN = %s Successfully!'%(str(APN)))
        except Exception as e:
            ctx.logger.info('Update User Failed!')
            ctx.logger.info("Error: %s"%str(e))
    else:
        ctx.logger.info('更新失败,失败原因: Invalid ip')


@operation
def huaweiSwitch(**kwargs):
    ctx.logger.info("os.getcwd() = %s"%str(os.getcwd()))
    ip = ctx.node.properties['ip']

    #判断是否为合法ip
    compile_ip=re.compile('^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$')
    if compile_ip.match(ip):
        try:
            driver = get_network_driver('huawei_vrp')
            device = driver(hostname='%s'%str(ip), username='admin123', password='Zijinshan001&')
            device.open()
            #写交换机配置文件？
            device.load_merge_candidate('/home/mongo-plugin/mongo-plugin/mongo_task/config.cfg')
            device.commit_config()

            ctx.logger.info('配置文件路径:/home/mongo-plugin/mongo-plugin/mongo_task/config.cfg')
            ctx.logger.info('配置交换机成功!')
        except Exception as e:
            ctx.logger.info('配置交换机失败!')
            ctx.logger.info("错误原因: %s"%str(e))
    else:
        ctx.logger.info("配置交换机失败,IP不合法")

@operation
def read(**kwargs):
    ip = ctx.node.properties['ip']

    #判断是否为合法ip
    compile_ip=re.compile('^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$')
    if compile_ip.match(ip):
        coon = pymongo.MongoClient('%s'%str(ip),27017)

        db=coon['open5gs']

        myset = db['subscribers']

        # myset.delete_many({})
        conn = psycopg2.connect(database='cloudify_db', user='cloudify', password='cloudify', host='127.0.0.1', port='5432')
        cur = conn.cursor()


        cur.execute("delete from user_account_status;")
        conn.commit()


        all = myset.find()


        #for i in all:
        #    ctx.logger.info("查询结果: %s"%str(i))

        try:
            for i in all:
                ctx.logger.info("Find: %s"%str(i))
                #imsi
                imsi = i['imsi']
                #print i['imsi']
                #ul
                ul = i['ambr']['uplink']
                # print i['ambr']['uplink']
                #dl
                dl = i['ambr']['downlink']
                # print i['ambr']['downlink']
                #apn
                apn =  i['pdn'][0]['apn']
                # print i['pdn'][0]['apn']
                cur.execute("insert into user_account_status values('%s','%sKbps','%sKbps','%s');"%(str(imsi),str(ul),str(dl),str(apn)))
            conn.commit()
            ctx.logger.info("查询成功!")
        except Exception as e:
            ctx.logger.info("查询失败,失败原因: %s"%str(e))
    else:
        ctx.logger.info('查询失败,失败原因: Invalid ip')
