import requests
import json

ip = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
enable_data = {'rad_enable': '1', 'rad_nasidentifier': 'panabit', 'rad_acctinternal': '300', 'rad_ttl': '30'}
post_data =  {'desc': 'radius', 'ip': '192.168.4.158', 'authport': '1812', 'acctport': '1813',
	      'secret': 'panabit', 'proxy': 'test001', 'proxy2': 'test001'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

list_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/radsvr_list'
resp = requests.get(
    list_url,verify=False,cookies=cookie_jar
)
rets = json.loads(resp.text)
for ret in rets:
    if ret['name'] == 'radius':
	id = ret['id']
	test_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/radsvr_list?action=delete&id=' + id
	resp = requests.get(
   	    test_url,verify=False,cookies=cookie_jar)
cookie_jar.clear()
print resp.headers
print resp.status_code
print resp.text


