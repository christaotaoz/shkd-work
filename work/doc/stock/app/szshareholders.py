
# -*- coding: utf-8 -*-

import urllib
from urllib import request
from lxml import etree
import re
import time
import platform
import zlib
import json
import sys

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

#默认截止日期为2018年
if len(sys.argv) == 1:
    Last_year = '2018'
    Last_month = '01'

#可以在命令行手动输入截止年份(如可以选2017,2018，2019）默认最后截止月份为1月
if len(sys.argv) == 2:
    if int(sys.argv[1]) in range(2017,2050):
        Last_year = str(sys.argv[1])
        Last_month = '01'
    else:
        print('你所选的年份不合法,程序退出')
        sys.exit(1)

#可以在命令行手动输入截止月份(格式如:1,01,02,10）
if len(sys.argv) == 3:
    if int(sys.argv[1]) in range(2017,2050):
        Last_year = str(sys.argv[1])
    else:
        print('你所选的年份不合法,程序退出')
        sys.exit(1)
    if int(sys.argv[2]) in range(1,13):
        if len(sys.argv[2]) == 1:
            Last_month = '0'+ str(sys.argv[2])
        else:
            Last_month = str(sys.argv[2])
    else:
        print('你所选的年份月份不合法,程序退出')
        sys.exit(1)

now = time.time()
now_ = time.localtime(now)
# 获取本地时间
CurDate = time.strftime('%Y-%m-%d',now_)
base_url_sh = 'http://sns.sseinfo.com/qasearch.do'
killWordArr = ['万股','万元','十大股东','10大股东','股东持股数','传真','电话','微信','增持',
               '致电','参考浏览用户','10名股东','前十名股东','万吨','万辆','致电','拨打','热线','联系','每亩','每平方','每公里']
headers_sh = {
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
    'Accept-Encoding': 'gzip,deflate',
    'User-Agent': 'Mozilla / 5.0(Windows NT 6.1;WOW64;rv: 65.0) Gecko / 20100101 Firefox / 65.0',
    'Referer': 'http://sns.sseinfo.com/search.do?keyword =%E8%82%A1%E4%B8%9C%E4%BA%BA%E6%95%B0&keywordEnd=%E8%82%A1%E4%B8%9C%E4%BA%BA%E6%95%B0',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': 'SSESNSXMLSID=35d99c27-c2f6-4b60-9d5a-81ee539d348c; JSESSIONID=88ex7e029rfg1iu6s6n97yz1w; yfx_c_g_u_id_10000042=_ck19061112481813733753451125570; yfx_f_l_v_t_10000042=f_t_1560228498147__r_t_1560228498147__v_t_1560231239540__r_c_0',
    'Content-Length': '65',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
}
p = '(\d+)'
base_url = 'http://irm.cninfo.com.cn/ircs/index/search'
debug = True # 设置是否打印log
isMonthLog = False # 是否为月日志,FALSE为日日志
headers = {
    'Host': 'irm.cninfo.com.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Referer': 'http://irm.cninfo.com.cn/ircs/index',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': 'ctx=/ircs; JSESSIONID=9901a42e-c579-48a9-b58d-9cbc183c4c5e'
}
dateMonthDay = {
    '1':'31','2':'28','3':'31','4':'30','5':'31','6':'30','7':'31','8':'31','9':'30','10':'31','11':'30','12':'31',
    '01': '31','02': '28','03': '31','04': '30','05': '31','06': '30','07': '31','08': '31','09': '30',
}
CnList = {
    u'一':1, u'二':2, u'两':2,u'三':3, u'四':4, u'五':5, u'六':6, u'七':7, u'八':8, u'九':9,u'十':10,u'壹':1, u'贰':2, u'叁':3,
    u'肆':4, u'伍':5, u'陆':6, u'柒':7, u'捌':8, u'玖':9,u'拾':10
}
#字符串格式化
def formatStr(answerAtext):
    if len(answerAtext) > 300:
        return ''
    for killWord in killWordArr:
        if killWord in answerAtext:
            return ''
    answerAtext = ''.join(answerAtext.split('，'))  #去除中文逗号
    answerAtext = ''.join(answerAtext.split(','))   #去除英文逗号
    answerAtext = ''.join(answerAtext.split('\n'))   #去除\n
    answerAtext = ''.join(answerAtext.split(' '))   #去除空格
    # answerAtext = ''.join(answerAtext.split('。'))  # 去除中文句号
    answerAtext = ''.join(answerAtext.split(':'))  # 去除中文冒号
    answerAtext = ''.join(answerAtext.split('！'))  # 去除中文冒号
    #汉字的数字
    cn_num_match = re.compile('[百千万佰仟]{1,}')
    #如果回答没有数字返回空
    pattern = re.compile(r'.*\d+')
    if pattern.match(answerAtext) == None:
        if cn_num_match.match(answerAtext) == None:
            return ''
    return answerAtext
Count= []
def writeShareholderCount(strAskArr,strAnswerArr,strComCodeArr,pubDateArr,updateDateArr):
    # #共一万+条数据
    for i in range(len(strAnswerArr)):
        # 清洗数据第二步,找到回答不为空的所有数据
        if strAnswerArr[i]:
            answerAtext = formatStr(strAnswerArr[i])
            askAtext = strAskArr[i]
            if pubDateArr == 'sh':
                pubDate = ' '
            else:
                pubDate = pubDateArr[i]
            if updateDateArr == 'sh':
                updateDate = ' '
            else:
                updateDate = updateDateArr[i]
            if answerAtext:
                dataList = getFullTime(answerAtext, askAtext, pubDate, updateDate)
                if dataList:
                    log('原始问题：' + askAtext)
                    log('原始回答：' + answerAtext)
                    for j in range(len(dataList)):
                        TimeAndNums = dataList[j]
                        Time = TimeAndNums.split(' ')[0]
                        Nums = TimeAndNums.split(' ')[1]
                        year = Time.split('-')[0]
                        year = fullyear(year)
                        if 2017 <= int(year) <2050:
                            month = Time.split('-')[1].strip()
                            day = Time.split('-')[2].strip()
                            if len(month) == 1:
                                month = '0' + str(month)
                            if 1 <= int(month) <= 12:
                                if len(day) == 1:
                                    day = '0' + str(day)
                                if 1 <= int(day) <= 31:
                                    if year + '-' + month >= Last_year + '-' + Last_month:
                                        strDate = year + '-' + month + '-' + day
                                        Count.append(strDate)
                                        log(strComCodeArr[i] + '\t' + strDate + '\t' + str(Nums) + '.000000' + '\n')
                                        writeFile(strComCodeArr[i] + '\t' + strDate + '\t' + str(Nums)+'.000000' + '\n')
                                    else:
                                        print('不符合筛选年份')
                                else:
                                    log2('原始问题:' + askAtext)
                                    log2('原始回复:' + answerAtext)
                                    log2('日份有异常，股票代码为：' + strComCodeArr[i])
                            else:
                                log2('原始问题:' + askAtext)
                                log2('原始回复:' + answerAtext)
                                log2('月份有异常，股票代码为：' + strComCodeArr[i])
                        else:
                            log2('原始问题:' + askAtext)
                            log2('原始回复:' + answerAtext)
                            log2('年份有异常，股票代码为：'+strComCodeArr[i])

def fullyear(year):
    if int(year) == 17:
        year = '2017'
    if int(year) == 18:
        year = '2018'
    if int(year) == 19:
        year = '2019'
    if int(year) == 20:
        year = '2020'
    return year

# #将如2万4千变为24000
def replWanQian(matched):
    Wan = int(matched.group(1)) * 10000
    Qian = int(matched.group(2)) * 1000
    num = str(Wan + Qian)
    return num + '已处理'

#将如2万的变为20000
def replWan(matched):
    Wan = int(matched.group(1)) * 10000
    num = str(Wan)
    return num + '已处理'

#将带中文万千的如十一万八千变为11800
def replCnWanQian(matched):
    Wan = matched.group(1)
    Qian = matched.group(2)
    if len(Wan) == 1:
        Num = int(CnList[Wan]) * 10000
        Num2 = int(CnList[Qian]) * 1000
        num = str(Num + Num2)
        return num + '已处理'
    elif len(Wan) == 2:
        Num = (int(CnList[Wan[0]]) + int(CnList[Wan[1]])) * 10000
        Num2 = int(CnList[Qian]) * 1000
        num = str(Num + Num2)
        return num + '已处理'
    elif len(Wan) == 3:
        Num = (int(CnList[Wan[0]]) * int(CnList[Wan[1]]) + int(CnList[Wan[2]])) * 10000
        Num2 = int(CnList[Qian]) * 1000
        num = str(Num + Num2)
        return num + '已处理'

#将带中文的万如五万变为50000
def replCnWan(matched):
    Wan = matched.group(1)
    if len(Wan) == 1:
        Num = int(CnList[Wan]) * 10000
        num = str(Num)
        return num + '已处理'
    elif len(Wan) == 2:
        Num = (int(CnList[Wan[0]]) + int(CnList[Wan[1]])) * 10000
        num = str(Num)
        # print(num + '_2' * 50)
        return num + '已处理'
    elif len(Wan) == 3:
        Num = (int(CnList[Wan[0]]) * int(CnList[Wan[1]]) + int(CnList[Wan[2]])) *10000
        num = str(Num)
        # print(num + '_3' * 50)
        return num + '已处理'

#将如1.34万转为13400
def replWanQianWithPoint(matched):
    Wan = int(float(matched.group(1)) * 10000)
    num = str(Wan)
    return num + '已处理'

# 完整时间格式化
def replFulltime(matched):
    Year = str(matched.group(1))
    if int(Year) < 17 or int(Year)>2050:
        return '数据不合法已处理'
    Year = fullyear(Year)
    Month = str(matched.group(2))
    Day = str(matched.group(3))
    Time = Year + '年' + Month + '月' + Day + '日'
    return Time + '已处理'

# 部分时间如X月X日的格式化
def replPartTime(matched):
    First = str(matched.group(1))
    # 大于一百万删掉
    if int(First) > 1000000:
        return '数据不合法已处理'
    Second = str(matched.group(2))
    if int(Second) == 0 and int(First)>4000:
        return First + '已处理'
    if 12>=int(First)>=1 and 31>=int(Second)>=1:
        Time = First + '月'+ Second + '日'
        return Time + '已处理'
    else:
        return '已处理'

# 去除机构数以及部分非法数字
def replPartNum(matched):
    num = matched.group(1)
    if int(num) < 3000:
        return '已处理'
    else:
        return num + '已处理'

dict = {
    '1':1,'一':1,
    '2':2,'二':2,
    '3':3,'三':3,
    '4':4,'四':4,
}
#处理季度
def replQuarter(matched):
    year = matched.group(1)
    Num = matched.group(2)
    if Num in dict:
        month = int(dict[Num]) * 3
        day = int(dateMonthDay[str(month)])
        return str(year) + '-' + str(month) + '-' +  str(day) + '日已处理'
    else:
        return '数据不合法已处理'

# 处理月末
def replMonthEnd(matched):
    month = int(matched.group(1))
    if int(month) >12 or int(month) < 1:
        return
    day = int(dateMonthDay[str(month)])
    return str(month) + '月' + str(day) + '日' + '@'*5

# 格式化时间，如12-01
def replFormatMonthDay(matched):
    month = int(matched.group(1))
    day = int(matched.group(2))
    return str(month) + '-' + str(day)

#匹配时间，股东人数，并作替换处理
def getFullTime(answerAtext,askAtext,pubDate,updateDate):
    reDate = r'\d+[年月日号]'
    refulltime = '(\d+)年(\d+)月(\d+)[日号]*'
    reTextWithQian = re.compile('(\d+)万(\d+)[仟千]*')#3万2千 或者3万8
    reTextWithPoint = re.compile('(\d+\.\d+)万')#3.3万 变为33000
    reTextNotWithPoint = re.compile('(\d+)万')#3万 变为30000
    reTextWithCn = re.compile('([一二两三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+)万([一二两三四五六七八九十百千万壹贰叁肆伍陆柒捌玖拾])[千仟]')
    reTextWithCnWan = re.compile('([一二两三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+)万')
    reFullTime = re.compile('(\d+)[\.-](\d+)[\.-](\d+)')#匹配2019.5.12 变为 2019年5月12日
    rePartTime = re.compile('(\d+)[\.-](\d+)')#匹配xx.xx,日期2.13变为2月13,数字1000000.00去除,数字10000.00变为10000
    rePartNum = re.compile('(\d+)[户个名人家]')#匹配88户
    reJiGouNum = re.compile('机构.*(\d+)')#匹配机构数
    answerAtext = re.sub(reTextWithCn,replCnWanQian, answerAtext)
    answerAtext = re.sub( reTextWithCnWan, replCnWan, answerAtext)
    answerAtext = re.sub(reTextWithQian,replWanQian, answerAtext)
    answerAtext = re.sub(reTextWithPoint,replWanQianWithPoint,answerAtext)
    answerAtext = re.sub(reTextNotWithPoint,replWan,answerAtext)
    answerAtext = re.sub(reFullTime,replFulltime,answerAtext)
    answerAtext = re.sub(rePartTime,replPartTime,answerAtext)
    answerAtext = re.sub(rePartNum,replPartNum,answerAtext)
    answerAtext = re.sub(reJiGouNum,replPartNum,answerAtext)
    answerAtext = re.sub('(\d+)月[底末]', replMonthEnd, answerAtext)
    answerAtext = re.sub('(\d+).*?(\w)季', replQuarter, answerAtext)

    askAtext = re.sub('(\d+)月[底末]', replMonthEnd, askAtext)
    askAtext = re.sub('(\d+).*?(\w)季', replQuarter, askAtext)
    askAtext = re.sub(rePartTime, replPartTime, askAtext)
    askAtext = re.sub(reFullTime, replFulltime, askAtext)
    find_time = re.findall(reDate, answerAtext)
    #答中不含时间的
    L = []
    if not find_time:
        fulltime = re.findall(refulltime,askAtext)
        # 问中含有完整时间的
        if fulltime:
            # 问中有唯一的完整时间
            if len(fulltime) == 1:
                formatTime = fulltime[0][0] + '-' + fulltime[0][1] + '-' + fulltime[0][2]
                count = getShareholderCount(answerAtext)
                #答中含有效数据即返回，没有数据的不处理
                if count:
                    formatData = formatTime + ' ' + count[0]
                    L.append(formatData)
            #问中有多个完整时间
            else:
                if updateDate != ' ':
                    count = getShareholderCount(answerAtext)
                    if count:
                        if len(count) == 1:
                            formatData = updateDate + ' ' +count[0]
                            L.append(formatData)
                        else:
                            print('暂无处理')
        else:
            #问中含部分时间或者不含时间的 将提问时间设置为截至日期
            count = getShareholderCount(answerAtext)
            if count:
                if pubDate != ' ':
                    #只有一个有效数据
                    if len(count) == 1:
                        # 符合x月x日的情况
                        MonthDay = re.findall('\d+月\d+',askAtext)
                        if MonthDay:
                            # 唯一的x月x日
                            if len(MonthDay) == 1:
                                year = pubDate.split('-')[0]
                                month_day = MonthDay[0]
                                month_day = re.sub('[月日]', '-', month_day)
                                formatData = year + '-' + month_day
                                formatData = formatTimeDate(formatData)
                                formatData = formatData + ' ' + count[0]
                                L.append(formatData)
                            else:
                                formatData = updateDate + ' ' + count[0]
                                L.append(formatData)
                        else:
                            formatData = pubDate + ' ' + count[0]
                            L.append(formatData)

                    # 多个数据
                    else:
                        formatData = pubDate + ' ' + min(count)
                        L.append(formatData)

    #答中含有时间的
    else:
        fulltime = re.findall(refulltime,answerAtext)
        #答中含有完整时间
        if fulltime:
            # 答中含有唯一的完整时间
            if len(fulltime) == 1:
                formatTime = fulltime[0][0] + '-' + fulltime[0][1] + '-' + fulltime[0][2]
                count = getShareholderCount(answerAtext)
                if count:
                    # 答中含有唯一的有效数据
                    if len(count) == 1:
                        formatData = formatTime + ' ' + count[0]
                        # print(answerAtext)
                        # print(askAtext)
                        L.append(formatData)

                    # 多个数据
                    else:
                        # 符合x月x日的情况
                        MonthDay = re.findall('\d+月\d+', answerAtext)
                        if MonthDay:
                            if len(MonthDay) == 1:
                                More_day = re.findall('\d+日',answerAtext)
                                if len(More_day) == 1:
                                    formatData = formatTime + ' ' + max(count)
                                    L.append(formatData)

                                else:
                                    for i in range(len(More_day)):
                                        ft = fulltime[0][0] + '-' + fulltime[0][1] + '-' + More_day[i][:-1]
                                        formatData = ft +  ' ' + count[i]
                                        L.append(formatData)

                            else:
                                year = fulltime[0][0]
                                for i in range(len(MonthDay)):
                                    month_day = re.sub('(\d+)月(\d+)',replFormatMonthDay,MonthDay[i])
                                    fulltime = year + '-' + month_day
                                    formatData = fulltime + ' ' + count[i]
                                    L.append(formatData)

                        else:
                            print('暂无处理')
            # 匹配到多个完整日期
            else:
                count = getShareholderCount(answerAtext)
                if count:
                    if len(fulltime) == 2:
                        if len(count) == 2:
                            for i in range(2):
                                if int(fulltime[i][0]) == 9:
                                    ft = '2019' + '-' + fulltime[i][1] + '-' + fulltime[i][2]
                                    formatData = ft + ' ' + count[i]
                                    L.append(formatData)
                                else:
                                    ft = fulltime[i][0] +'-' + fulltime[i][1] + '-' + fulltime[i][2]
                                    formatData = ft + ' ' + count[i]
                                    L.append(formatData)

                        elif len(count) == 1:
                            Ex = re.findall('您好公司于2019年4月26日披露了2018年年度报告截止2018年12月31日公司股东人数为45068已处理',answerAtext)
                            if Ex:
                                formatData = '2018-12-31 45068'
                                L.append(formatData)

                            if pubDate != ' ' :
                                formatData = pubDate + ' ' + count[0]
                                L.append(formatData)

                    else:
                        ex1 = re.findall('截[至止](\d+)年(\d+)月(\d+)日.*?(\d+)',answerAtext)
                        if ex1:
                            if len(ex1) ==1 :
                                formatData = ex1[0][0]+ '-' + ex1[0][1]+ '-' +ex1[0][2]+ ' '+ ex1[0][3]
                                L.append(formatData)

                            else:
                                del fulltime[1]
                                for i in range(2):
                                    ft = fulltime[i][0] +'-' + fulltime[i][1] + '-' + fulltime[i][2]
                                    formatData = ft + ' ' + count[i]
                                    L.append(formatData)

                        else:
                            formatData = fulltime[0][0] + '-' + fulltime[0][1] + '-' + fulltime[0][2] + ' ' + count[0]
                            L.append(formatData)

        # 答中含部分时间
        else:
            if pubDate != ' ' :
                count = getShareholderCount(answerAtext)
                if count:
                    # 唯一有效数据
                    if len(count) == 1:
                        #符合x月x日的情况
                        MonthDay = re.findall('\d+月\d+',answerAtext)
                        if MonthDay:
                            #唯一的x月x日
                            if len(MonthDay) == 1:
                                year = pubDate.split('-')[0]
                                month_day = MonthDay[0]
                                month_day = re.sub('[月日]', '-', month_day)
                                if month_day.split('-')[0] == '2020':
                                    year = '2020'
                                    month_day = month_day.split('-')[1] + '-' + updateDate.split('-')[2]
                                if month_day.split('-')[0] == '2019':
                                    year = '2019'
                                    month_day = month_day.split('-')[1] + '-' + updateDate.split('-')[2]
                                if month_day.split('-')[0] == '2018':
                                    year = '2018'
                                    month_day = month_day.split('-')[1] +'-' + updateDate.split('-')[2]
                                if month_day.split('-')[0] == '2017':
                                    year = '2017'
                                    month_day = month_day.split('-')[1] + '-' + updateDate.split('-')[2]
                                formatData = year + '-' + month_day
                                formatData = formatTimeDate(formatData)
                                formatData = formatData + ' ' + count[0]
                                # print(askAtext)
                                # print(answerAtext)
                                # print(formatData)
                                L.append(formatData)

                            # 多个X月X日
                            else:
                                Last_time = re.findall('截.*?(\d+)月(\d+)日', answerAtext)
                                if Last_time:
                                    if len(Last_time) == 1:
                                        year = pubDate.split('-')[0]
                                        month_day = Last_time[0][0] + '-' + Last_time[0][1]
                                        formatData = year + '-' + month_day
                                        formatData = formatTimeDate(formatData)
                                        formatData = formatData + ' ' + count[0]
                                        L.append(formatData)

                                    else:
                                        formatData = pubDate + ' ' + count[0]
                                        L.append(formatData)

                                else:
                                    formatData = pubDate + ' ' + count[0]
                                    L.append(formatData)

                        #唯一值 ,时间格式混乱
                        else:
                            Quarter = re.findall('\d{4}-\d+-\d+',answerAtext)
                            if Quarter:
                                formatData = Quarter[0]+ ' ' + count[0]
                                L.append(formatData)

                            else:
                                if '300515' in answerAtext:
                                    pass
                                else:
                                    formatData = pubDate + ' ' + count[0]
                                    L.append(formatData)

                    #多个有效值处理
                    else:
                        Q1 = re.findall('(\d+月\d+[号日]).*?(\d+月\d+[号日])',answerAtext)
                        if Q1:
                            # 有效时间的数据为2个
                            if len(Q1) == 1:
                                #有效人数的数据为2个
                                if len(count) == 2:
                                    for i in range(len(count)):
                                        formatData = pubDate_Multi_Count(pubDate,Q1[0],i,count)
                                        L.append(formatData)

                                #有效人数的数据大于2个
                                else:
                                    Q2 = re.findall('\d+月\d+[号日]',answerAtext)
                                    if len(Q2) == 3:
                                        if len(count) == 3:
                                            for i in range(len(count)):
                                                formatData = pubDate_Multi_Count(pubDate,Q2,i,count)
                                                L.append(formatData)

                                        else:
                                            answerAtext = re.sub('28日','2月28日',answerAtext)
                                            Q3 = re.findall('\d+月\d+日', answerAtext)
                                            for i in range(len(count)):
                                                formatData = pubDate_Multi_Count(pubDate,Q3,i,count)
                                                L.append(formatData)
                            else:
                                if len(count) == 4:
                                    Time = Q1[0]+Q1[1]
                                    for i in range(len(count)):
                                        formatData = pubDate_Multi_Count(pubDate,Time,i,count)
                                        L.append(formatData)
                                else:
                                    pass
                                    # for i in range(len(count)):
                                    #     year = pubDate.split('-')[0]
                                    #     month_day = re.sub('(\d+)月(\d+)日', replFormatMonthDay, Q1[i][0])
                                    #     formatData = year + '-' + month_day
                                    #     formatData = formatTimeDate(formatData)
                                    #     formatData = formatData + ' ' + count[i]
                                    #     L.append(formatData)
                        else:
                            Q4 = re.findall('\d+月\d+[日号]',answerAtext)
                            if len(Q4) == 1:
                                Q5 = re.findall('\d+日',answerAtext)
                                if len(Q5)>=2:
                                    month = re.findall('\d+月',answerAtext)[0]
                                    for i in range(len(Q5)):
                                        year = pubDate.split('-')[0]
                                        month_day = re.sub('(\d+)月(\d+)日', replFormatMonthDay, month+Q5[i])
                                        formatData = year + '-' + month_day
                                        formatData = formatTimeDate(formatData)
                                        formatData = formatData + ' ' + count[i]
                                        L.append(formatData)

                                else:
                                    formatData = pubDate + ' ' +  max(count)
                                    L.append(formatData)
    return L


#多个时间处理
def pubDate_Multi_Count(pubDate,List,i,count):
    year = pubDate.split('-')[0]
    month_day = re.sub('(\d+)月(\d+)[号日]', replFormatMonthDay, List[i])
    formatData = year + '-' + month_day
    formatData = formatTimeDate(formatData)
    formatData = formatData + ' ' + count[i]
    return formatData

#年份处理
def formatTimeDate(formatData):
    formatList = formatData.split('-')

    print('*'*30+ formatData)
    if int(formatList[0]) == 2019:
        if int(formatList[1]) > 6:
            formatList[0] = '2018'
    formatData = '-'.join(formatList)
    return formatData

#提取股东人数
def getShareholderCount(answerText):
    # # # 清洗无效数据
    reTextArr = [r'\d+年',r'\d+月',r'\d+日',r'\d+号',r'较.*\d+',r'[未不]合并.*?\d+',r'B股.*?\d+',r'不含信用.*?\d+',r'其中.*?\d+.*?\d+','\d+多吨','\d+元']
    for reText in reTextArr:
        answerText = reAndDelete(answerText,reText)
    L = re.findall('\d+',answerText)
    Valid_L =[]
    if L:
        for j in L:
            if 1000000>int(j)> 3000:
                Valid_L.append(j)
    if Valid_L:
        return Valid_L
    return 0



def reAndDelete(answerText,reText):
    reEndStrArr = re.findall(reText,answerText)
    if reEndStrArr is not None:
        for reEndStr in reEndStrArr:
            index = answerText.find(str(reEndStr))
            answerText = answerText[:index] + answerText[index+len(reEndStr):]
    return answerText

# 获得截至日期
def getEndDate(year,month,day):
    #当前时间
    intY = int(year)
    intM = int(month)
    intD = int(day)
    #如果是2019年1月2日的数据，截至日期写成2018年12月31日
    try:
        if(intM == 1) and intD < 10:
            strY = intY - 1
            strM = '12'
            strD = '31'
            strDate = ('%s-%s-%s' % (strY, strM, strD))
        else:
            strY = str(intY)
            if intD < 10:
                strM = intM - 1
                strD = str(int(dateMonthDay[str(intM -1)]))
                strDate = ('%s-%s-%s' % (strY, strM, strD))
            elif 15 > intD >= 10:
                strDate = ('%s-%s-%s' % (strY, str(intM),'10'))
            elif 20 > intD >= 15:
                strDate = ('%s-%s-%s' % (strY, str(intM),'15'))
            elif 28 > intD >= 20:
                strDate = ('%s-%s-%s' % (strY, str(intM),'20'))
            else:
                strDate = ('%s-%s-%s' % (strY, str(intM),dateMonthDay[str(intM)]))
    except Exception as e:
        return ' '
    return strDate   #返回10，15，20，月底的日期

#错误日志处理
def log2(message):
    fileName =  CurDate + '-error.txt'
    f = open(fileName, 'a')
    f.write(message + '\n')
    f.close()


#日志处理
def log(message):
    fileName = ''
    if debug:
        if platform.system() == 'Windows':
            print(message.encode('gbk'))
        else:
            print(message)
        if isMonthLog:
            fileName = CurDate + '-log.txt'
        else:
            fileName = CurDate+'-log.txt'
    if platform.system() == 'Windows':
        fileName = fileName.encode('gbk')
    f = open(fileName, 'a')
    f.write(message + '\n')
    f.close()


#写文件
def writeFile(text,pam = 'a'):
    filename = '%s.txt'%(CurDate)
    if platform.system() == 'Windows':
        filename = filename.encode('gbk')
    f = open(filename, pam)
    f.write(text)
    f.close()


#获取深圳证券主函数
def get_SZ_Ask_Answer(page):
    data = 'pageNo={}&pageSize=1000&searchTypes=11%2C&keyWord=%E8%82%A1%E4%B8%9C%E4%BA%BA%E6%95%B0&market=&industry=&stockCode='.format(page)
    data = bytes(data,encoding='utf8')
    req = request.Request(base_url,data=data,headers=headers,method='POST')
    response = request.urlopen(req,timeout=10).read().decode('utf-8')
    html_content_dict = json.loads(response)
    html_content_list = html_content_dict['results']
    strComCodeArr = []
    strAnswerArr = []
    strAskArr = []
    pubDateArr = []
    updateDateArr = []
    for i in html_content_list:
        updateDateArr.append(timeSwitch(int(i['updateDate'][:-3])))
        pubDateArr.append(timeSwitch(int(i['pubDate'][:-3])))
        strAskArr.append(i['mainContent'])
        strAnswerArr.append(i['attachedContent'])
        strComCodeArr.append('SZ' + i['stockCode'])
    writeShareholderCount(strAskArr, strAnswerArr, strComCodeArr, pubDateArr,updateDateArr)


#获取上海证券主函数
def get_SH_Ask_Answer(page):
    data = 'page={}&keyword=%E8%82%A1%E4%B8%9C%E4%BA%BA%E6%95%B0&sdate=&edate='.format(page)
    data = bytes(data,encoding='utf8')
    req = request.Request(base_url_sh,data=data,headers=headers_sh,method='POST')
    response = request.urlopen(req,timeout=10).read()
    try:
        html = zlib.decompress(response, 16 + zlib.MAX_WBITS).decode('utf-8')
        html = etree.HTML(html)
        html_content = html.xpath('//div[@class="m_feed_item"]')
        strComCodeArr = []
        strAnswerArr = []
        strAskArr = []
        for single_content in html_content:
            content = single_content.xpath('.//div[@class="m_feed_txt"]//text()')
            if re.search(p,content[1]) is not None:
                strComCode = 'SH'+str(re.search(p,content[1]).group(1))
                strComCodeArr.append(strComCode)
                del content[1]
                #问答列表
                aa = ''.join(content).strip().split('\n\t')
                strAsk = aa[0]
                strAnswer = aa[-1]
                strAnswerArr.append(strAnswer)
                strAskArr.append(strAsk)
        writeShareholderCount(strAskArr, strAnswerArr, strComCodeArr,'sh','sh')
    except Exception as e:
        print(e, "@" * 30)

#去重
def removeDuplicate():
    filename = '%s.txt'%(CurDate)
    if platform.system() == 'Windows':
        filename = filename.encode('gbk')
    file_object = open(filename)
    new_list_txt = []
    try:
        list_of_all_the_lines = file_object.readlines()
    finally:
        file_object.close()
    for line in list_of_all_the_lines:
        if line not in new_list_txt:
            new_list_txt.append(line)
    f = open(filename, 'w')
    for newline in new_list_txt:
        f.write(newline)
    f.close()

#排序并统计有效数据的个数
def order():
    with open( '%s.txt'%(CurDate), 'r') as f:
        L = f.readlines()
    L.sort()

    with open( '%s.txt'%(CurDate), 'w') as f1:
        for i in L:
            f1.write(i)
    print(len(L))


#格式化日期
def timeSwitch(timestamp):
    Last_time = time.localtime(timestamp)
    Last_time = time.strftime('%Y-%m-%d',Last_time)
    return Last_time

# 重写文件
def init():
    f1 = open(CurDate + '-log.txt','w')
    f1.close()
    f2 = open('%s.txt'%(CurDate), 'w')
    f2.close()


#自动发送邮件功能
def AutoEmail():
    #模拟服务器
    #SMTP服务器
    SMTPServer="smtp.163.com"
    #发邮件的地址
    Sender="christ_z@163.com"
    #发送者邮件的授权密码
    passwd="FUNAHOIDMKTFZCPB"

    # 创建一个带附件的实例
    message = MIMEMultipart()
    message['From'] = Sender

    message['To'] = "2217679508@qq.com"
    subject = '上海宽带技术及应用工程中心-Chris'
    message['Subject'] = subject
    # 邮件正文内容
    message.attach(MIMEText('Python邮件,每周二8点更新', 'plain', 'utf-8'))

    # 构造附件1

    att1 = MIMEText(open('%s.txt'%(CurDate), 'rb').read(), 'base64', 'utf-8')
    att1["Content-Type"] = 'application/octet-stream'
    # 这里的filename可以任意写，写什么名字，邮件中显示什么名字
    att1["Content-Disposition"] = 'attachment; filename="%s.txt"'%(CurDate)
    message.attach(att1)

    try:
        mailServer = smtplib.SMTP(SMTPServer, 25)  # 25为端口号(邮件），0-1024都被系统占用了
        # 登录邮箱
        mailServer.login(Sender, passwd)  # 需要的是，邮箱的地址和授权密码
        # 发送文件
        mailServer.sendmail(Sender, ["2217679508@qq.com"], message.as_string())
        mailServer.sendmail(Sender, ["jiyif@qq.com"], message.as_string())
        print("邮件发送成功")
    except smtplib.SMTPException as e:
        print(e)
        print("Error: 无法发送邮件")



def main():
    init()
    #深圳 循环一次抓取1000条数据
    for i in range(1, 11):
        get_SZ_Ask_Answer(i)

    #上海 循环一次抓取10条数据
    for i in range(1, 400):
        get_SH_Ask_Answer(i)
    print(len(Count))
    removeDuplicate()
    order()
    AutoEmail()


if __name__ == '__main__':
    main()
