

```
yum install lrzsz -y
yum install python-pip -y
yum install -y gcc gcc-c++ python-devel
yum -y install epel-release
pip install wagon==0.6.0
pip install cloudify-dsl-parser
pip install cloudify-plugins-common
pip install cloudify-rest-client

如果pip安装出现如下错误：
ERROR: Command errored out with exit status 1:
     command: /usr/bin/python2 -c 'import sys, setuptools, tokenize; sys.argv[0] = '"'"'/tmp/pip-install-qas2Pz/cloudify-rest-client/setup.py'"'"';
    __file__='"'"'/tmp/pip-install-qas2Pz/cloudify-rest-client/setup.py'"'"';f=getattr(tokenize, '"'"'open'"'"', open)(__file__);
   code=f.read().replace('"'"'\r\n'"'"', '"'"'\n'"'"');f.close();
   exec(compile(code, __file__, '"'"'exec'"'"'))' egg_info --egg-base /tmp/pip-install-qas2Pz/cloudify-rest-client/pip-egg-info
         cwd: /tmp/pip-install-qas2Pz/cloudify-rest-client/
    Complete output (5 lines):
    Traceback (most recent call last):
      File "<string>", line 1, in <module>
      File "/tmp/pip-install-qas2Pz/cloudify-rest-client/setup.py", line 23, in <module>
        packages=find_packages(include=['cloudify_rest_client*']),
    TypeError: find_packages() got an unexpected keyword argument 'include'
    ----------------------------------------
ERROR: Command errored out with exit status 1: python setup.py egg_info Check the logs for full command output.

可以使用下列命令解决
pip install -U setuptools
```



