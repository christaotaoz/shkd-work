import requests
import json


ip = '192.168.4.28'
login_url = 'https://'+ ip +'/login/userverify.cgi'
test_url = 'https://'+ ip +'/cgi-bin/Route/policy_list?action=remove&id=40'

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
resp = requests.post(
    test_url,verify=False,cookies=cookie_jar
)
print resp.headers
print resp.status_code
print resp.text


