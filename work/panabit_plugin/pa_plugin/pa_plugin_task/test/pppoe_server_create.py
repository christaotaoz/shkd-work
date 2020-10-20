import requests
import json

ip = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'
test_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/pppoesvr_add'
enable_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/pppoesvr_config'
pool_name = 'pool1'
radius_name = 'radius'
login_data = {'username': 'admin', 'password': 'panabit'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp = requests.post(
    login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

resp = requests.get(
    enable_url, verify=False,cookies=cookie_jar
) 
print resp.text
rets = json.loads(resp.text)
for ret in rets:
    if ret['enable'] != '1':
	resp = requests.post(
    	    enable_url, verify=False,cookies=cookie_jar,data={'enable': '1'}) 

list_pool_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/ippool_list'
resp = requests.get(
    list_pool_url,verify=False,cookies=cookie_jar
)
pools = json.loads(resp.text)
for pool in pools:
    if pool['name'] == pool_name:
        pool_id = pool['id']

list_radius_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/radsvr_list'
resp = requests.get(
    list_radius_url,verify=False,cookies=cookie_jar
)
radius = json.loads(resp.text)
for rad in radius:
    if rad['name'] == radius_name:
        radius_id = rad['id']
post_data =  {'svrname': 'ceshi1', 'ifname': 'ix1', 'addr': '192.168.102.1', 'vlan': '0', 'mtu': '1492', 
	      'dns0': '114.114.114.114', 'dns1': '8.8.8.8', 'auth': 'radius', 'radsvr': radius_id,
	      'pool': pool_id, 'maxclnt': '0'}
resp = requests.post(
    test_url,verify=False,cookies=cookie_jar,data=post_data
)
cookie_jar.clear()
print resp.headers
print resp.status_code
print resp.text


