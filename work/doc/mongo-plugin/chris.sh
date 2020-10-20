#cfy dep del mongo_test -f
#cfy blu del mongo_test -f
cfy blu upload blueprints/huaweiSwitch.yaml -b huaweiSwitch
cfy dep create huaweiSwitch -b huaweiSwitch
cfy exe start install -d huaweiSwitch