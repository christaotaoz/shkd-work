import requests
import json


login_url = 'https://192.168.4.55/login/userverify.cgi'
test_url = 'https://192.168.4.55/cgi-bin/cfy/Pppoe/radsvr_add'
enable_url =  'https://192.168.4.55/cgi-bin/cfy/Pppoe/radsvr_list'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
enable_data = {'rad_enable': '1', 'rad_nasidentifier': 'panabit', 'rad_acctinternal': '300', 'rad_ttl': '30'}
post_data =  {'desc': 'radius', 'ip': '192.168.4.158', 'authport': '1812', 'acctport': '1813',
	      'secret': 'panabit', 'proxy': 'out', 'proxy2': 'in'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

resp = requests.post(
    enable_url,verify=False,cookies=cookie_jar,data=enable_data
)

resp = requests.post(
    test_url,verify=False,cookies=cookie_jar,data=post_data
)
cookie_jar.clear()
print resp.headers
print resp.status_code
print resp.text


