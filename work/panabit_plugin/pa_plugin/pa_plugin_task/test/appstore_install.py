#!/usr/bin/python
import requests
import json
host = '192.168.4.28'
username = 'admin'
password = 'panabit'
file_path = '/root/PanabitApp_cloud_20180823.apx'
login_url = 'https://'+ host +'/login/userverify.cgi'
login_data = {'username': username, 'password': password}
resp=requests.post(
    login_url, verify=False,data=login_data
) 
cookie_jar = resp.cookies
files = {
    "appfile" :  open(file_path, "rb")}  
upload_url = 'https://'+ host +'/cgi-bin/cfy/Maintain/appinstall?action=upload'
resp=requests.post(
    upload_url, verify=False,cookies=cookie_jar,files = files
) 
print resp.headers
print resp.status_code
print resp.text
import_url = 'https://'+ host +'/cgi-bin/cfy/Maintain/appinstall?action=install'
resp = requests.get(
    import_url,verify=False,cookies=cookie_jar
) 
cookie_jar.clear()


