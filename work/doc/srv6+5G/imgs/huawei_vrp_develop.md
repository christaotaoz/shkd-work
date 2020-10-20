函数

1.get_network_driver

```
参数：name, prepend=True
返回值: <class 'napalm_huawei_vrp.huawei_vrp.VRPDriver'>
```

2.open

```
"""Open a connection to the device.
"""
参数：无
返回值：无
```

3._netmiko_open

```
"""Standardized method of creating a Netmiko connection using napalm attributes."""
参数：device_type, netmiko_optional_args=self.netmiko_optional_args
返回值：<netmiko.huawei.huawei.HuaweiSSH object at 0x02D75090>
```

4.load_merge_candidate

```
"""Open the candidate config and merge."""
参数：filename=None, config=None
返回值：无
```

5.commit_config

```
"""Commit configuration."""
参数：message=""
返回值：无
```

6._save_config

```
"""Save the current running config to the given file."""
参数:filename=''
```

