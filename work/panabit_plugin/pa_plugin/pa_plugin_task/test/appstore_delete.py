#!/usr/bin/python
import requests
import json
host = '192.168.4.28'
username = 'admin'
password = 'panabit'
login_url = 'https://'+ host +'/login/userverify.cgi'
login_data = {'username': username, 'password': password}
resp=requests.post(
    login_url, verify=False,data=login_data
) 
cookie_jar = resp.cookies
delete_url = 'https://'+ host +'/cgi-bin/cfy/Maintain/appstore?action=delete&app=cloud'
resp = requests.get(
    delete_url,verify=False,cookies=cookie_jar
) 
cookie_jar.clear()


