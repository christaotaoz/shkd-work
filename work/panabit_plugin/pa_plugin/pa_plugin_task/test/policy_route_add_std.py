import requests
import json


#example
#curl -X POST -k --cookie 'pauser_1536198051_752886=paonline_admin_2448_15361981941' "https://192.168.4.65/cgi-bin/cfy/Route/proxy_add" -d "proxyname=test001&ifname=em2&wantype=static&pingip=8.8.8.8&proxymtu=1500&proxyaddr=10.2.0.22&proxygw=10.2.0.1&waitime=5"

login_url = 'https://192.168.4.55/login/userverify.cgi'
test_url = 'https://192.168.4.55/cgi-bin/cfy/Route/policy_addrule'

#headers = {'Content-Type': 'application/x-www-form-urlencoded', 
#	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data =  {'polno': '40', 'inifname': 'proxy.testlan', 'route_proxy': 'test001', 'srctype': 'any',
	      'dsttype': 'any', 'proto': 'any', 'appid': 'any', 'nat_proxy': 'test001', 'nat_nexthop': '_NULL_',
	      'action': 'nat'}

#s = requests.session().get(test_url,verify=False)
#resp = requests.post(
#    test_url, headers=headers,verify=False,data=post_data,cookies=s.cookies
#)
resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies
resp = requests.post(
    test_url,verify=False,cookies=cookie_jar,data=post_data
)
print resp.headers
print resp.status_code
print resp.text


