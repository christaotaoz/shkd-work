import requests
import json
import time

ip = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'
test_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/pppoe_account?action=delete&accounts=test'

start_time = time.strftime('%Y-%m-%d', time.localtime(time.time()))
#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data =  {'poolid': '1', 'account': 'test', 'passwd1': 'test', 'start': start_time, 'expire': '2019-10-05'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies
resp = requests.post(
    test_url,verify=False,cookies=cookie_jar
)
cookie_jar.clear()
print resp.headers
print resp.status_code
print resp.text


