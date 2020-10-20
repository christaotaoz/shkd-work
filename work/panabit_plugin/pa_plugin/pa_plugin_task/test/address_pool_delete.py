import requests
import json

ip  = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'


login_data = {'username': 'admin', 'password': 'panabit'}
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

list_url =  'https://'+ ip +'/cgi-bin/cfy/Pppoe/ippool_list'
resp = requests.get(
    list_url,verify=False,cookies=cookie_jar
)
pools = json.loads(resp.text)
for pool in pools:
    if pool['name'] == 'pool1':
        id = pool['id']
        test_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/ippool_list?action=deletepool&id=' + id
	resp = requests.get(
   	    test_url,verify=False,cookies=cookie_jar)
cookie_jar.clear()


