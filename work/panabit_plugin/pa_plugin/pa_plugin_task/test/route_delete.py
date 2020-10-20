import requests
import json


ip = '192.168.4.28'
wan_name = 'out'
lan_name = 'in'
login_url = 'https://'+ ip +'/login/userverify.cgi'
list_url = 'https://'+ ip +'/cgi-bin/cfy/Route/proxy_list'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies
resp = requests.get(
    list_url,verify=False,cookies=cookie_jar)
routes = json.loads(resp.text)
for route in routes:
    if route['name'] == wan_name:
        if route['type'] == 'proxy':
            id_wan = route['id']
            test_url_wan = 'https://'+ ip + '/cgi-bin/cfy/Route/proxy_list?action=delete&pxyid=' + id_wan
            resp = requests.get(
   		test_url_wan,verify=False,cookies=cookie_jar)
    if route['name'] == lan_name:
        if route['type'] == 'rtif':
            id_lan = route['id']
            test_url_lan = 'https://'+ ip + '/cgi-bin/cfy/Route/iflan_list?action=delete&pxyid=' + id_lan
            resp = requests.get(
    		    test_url_lan,verify=False,cookies=cookie_jar)
cookie_jar.clear()


