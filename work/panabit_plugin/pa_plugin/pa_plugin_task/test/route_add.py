import requests
import json


ip = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'
test_url_wan = 'https://'+ ip + '/cgi-bin/cfy/Route/proxy_add'
test_url_lan = 'https://'+ ip + '/cgi-bin/cfy/Route/iflan_add'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data_wan = {'proxyname': 'out', 'ifname': 'ix0', 'wantype':'static',
	     'pingip': '8.8.8.8', 'proxymtu': '1500', 'proxyaddr': '10.1.0.110',
	     'proxygw': '10.1.0.1', 'waitime': '6'}
post_data_lan = {'name': 'in', 'ifname': 'ix1', 'ifaddr': '10.2.0.34', 
		 'netmask': '255.255.255.0', 'mtu': '1500', 'mode': 'work'}
#post_data2 = {'mode': '1', 'zone': 'inside', 'peer': 'none', 'ifname': 'em2'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies
resp = requests.post(
    test_url_wan,verify=False,cookies=cookie_jar,data=post_data_wan
)
print resp.headers
print resp.status_code
print resp.text

resp = requests.post(
    test_url_lan,verify=False,cookies=cookie_jar,data=post_data_lan
)
cookie_jar.clear()

print resp.headers
print resp.status_code
print resp.text

