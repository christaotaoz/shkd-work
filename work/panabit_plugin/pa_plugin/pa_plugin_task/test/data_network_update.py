import requests
import json

login_url = 'https://192.168.4.39/login/userverify.cgi'
test_url1 = 'https://192.168.4.39/cgi-bin/cfy/Setup/if_edit?ifname=ix0'
test_url2 = 'https://192.168.4.39/cgi-bin/cfy/Setup/if_edit?ifname=ix1'

headers = {'Content-Type': 'application/x-www-form-urlencoded', 
	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data1 = {'mode': '1', 'zone': 'outside', 'peer': 'none', 'ifname': 'ix0'}
post_data2 = {'mode': '1', 'zone': 'inside', 'peer': 'none', 'ifname': 'ix1'}

resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

resp = requests.post(
    test_url1, headers=headers,verify=False,cookies=cookie_jar,data=post_data1
)
resp = requests.post(
    test_url2, headers=headers,verify=False,cookies=cookie_jar,data=post_data2
)
cookie_jar.clear()

print resp.headers
print resp.status_code
print resp.text



