import requests
import json

ip = '192.168.4.55'
login_url = 'https://'+ ip +'/login/userverify.cgi'
test_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/ippool_edit?id=2'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data =  {'name': 'test001', 'start': '192.168.112.2', 'end': '192.168.112.100', 
	      'dns': '114.114.114.114,8.8.8.8', 'ratein': '0', 'rateout': '0', 
	      'maxonlinetime': '0', 'clntepa': 'pass'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp = requests.post(
    login_url, verify=False, data=login_data
)
cookie_jar = resp.cookies
resp = requests.post(
    test_url, data=post_data, verify=False, cookies=cookie_jar
)
#resp = requests.post(
#    test_url,verify=False,cookies=cookie_jar,data=post_data
#)
cookie_jar.clear()
print resp.headers
print resp.status_code
print resp.text


