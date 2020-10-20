import requests
#import response
import json
#import demjson

login_url = 'https://192.168.4.28/login/userverify.cgi'
test_url = 'https://192.168.4.28/cgi-bin/cfy/Route/proxy_list'
# query one by id
headers = {'Content-Type': 'text/html; charset=gb2312', 'Pragma':'no-cache', 'Cache-Control':'no-cache'}

data = {'username': 'admin', 'password': 'panabit'}


resp=requests.post(
    login_url, verify=False,data=data
)
cookie_jar = resp.cookies

resp = requests.get(
    test_url, headers=headers,verify=False,cookies=cookie_jar
)
cookie_jar.clear()


print resp.headers
print resp.status_code
print resp.text


