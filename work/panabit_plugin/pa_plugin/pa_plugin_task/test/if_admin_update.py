import requests
import json

login_url = 'https://192.168.4.28/login/userverify.cgi'
test_url = 'https://192.168.4.28/cgi-bin/cfy/Setup/if_admin'

headers = {'Content-Type': 'text/html; charset=gb2312', 'Pragma':'no-cache', 'Cache-Control':'no-cache'}

login_data = {'username': 'admin', 'password': 'panabit'}
post_data = {'ipaddr': '192.168.4.28', 'netmask': '255.255.0.0', 'gateway': '192.168.4.2'}

resp=requests.post(
        login_url, verify=False,data=login_data
    )
cookie_jar = resp.cookies

resp = requests.post(
    test_url, headers=headers,verify=False,cookies=cookie_jar,data=post_data
)
cookie_jar.clear()

print resp.headers
print resp.status_code
print resp.text


