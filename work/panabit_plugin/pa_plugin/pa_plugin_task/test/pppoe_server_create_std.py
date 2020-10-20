import requests
import json


login_url = 'https://192.168.4.55/login/userverify.cgi'
test_url = 'https://192.168.4.55/cgi-bin/cfy/Pppoe/pppoesvr_add'
enable_url = 'https://192.168.4.55/cgi-bin/cfy/Pppoe/pppoesvr_config'
#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data =  {'svrname': 'ceshi', 'ifname': 'em1', 'addr': '192.168.77.1', 'vlan': '0', 'mtu': '1942', 
	      'dns0': '114.114.114.114', 'dns1': '8.8.8.8', 'auth': 'local/radius', 'radsvr': '0',
	      'pool': '10', 'maxclnt': '0'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp = requests.post(
    login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

resp = requests.post(
    enable_url, verify=False,cookies=cookie_jar,data={'enable': '1'}
) 
resp = requests.post(
    test_url,verify=False,cookies=cookie_jar,data=post_data
)
cookie_jar.clear()
print resp.headers
print resp.status_code
print resp.text


