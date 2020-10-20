import requests
import json


ip = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'
test_url = 'https://'+ ip +'/cgi-bin/cfy/Route/policy_addrule?from=policy_list'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies
list_pool_url = 'https://'+ ip +'/cgi-bin/cfy/Pppoe/ippool_list'
resp = requests.get(
    list_pool_url,verify=False,cookies=cookie_jar
)
pools = json.loads(resp.text)
for pool in pools:
    if pool['name'] == 'pool1':
        pool_id = pool['id']

post_data =  {'polno': '40', 'schtime': 'any','inifname': 'proxy.ceshi1', 'pool': pool_id, 'route_proxy': 'out',
              'srctype': 'any','dsttype': 'any', 'proto': 'any', 'appid': 'any', 'nat_proxy': 'out',
              'nat_nexthop': '_NULL_','action': 'nat'}
resp = requests.post(
    test_url,verify=False,cookies=cookie_jar,data=post_data
)
print resp.headers
print resp.status_code
print resp.text


