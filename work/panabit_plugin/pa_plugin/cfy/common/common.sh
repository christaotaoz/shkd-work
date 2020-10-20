#!/bin/sh

RAMDISK="/usr/ramdisk"
if [ -f ${RAMDISK}/PG.conf ]; then
	. ${RAMDISK}/PG.conf
	PGPATH="${RAMDISK}"
else
	. /etc/PG.conf
fi

. ${PGPATH}/etc/panabit.inf

PGBIN=${PGPATH}/bin
FLOWEYE=${PGBIN}/floweye
EVENTFILE=${PGETC}/log/pending_events
SYSNAME=`cat /usr/ramdisk/etc/sysname.inf`
APPWEBROOT="/cgi-bin/app/"
if [ -e /usr/ramdisk/datalog/keepme ]; then
	RAMLOG="/usr/ramdisk/datalog"
else
	RAMLOG="${DATAPATH}"
fi

afm_dialog_msg()
{
    echo "<script language=javascript>"
    echo "alert(\"$1\");"
    echo "</script>"
}

afm_window_close()
{
    echo "<script language=javascript>"
    echo "window.close();"
    echo "</script>"
}



# redirect current page to the designated page
# @param arg1 time to wait
# @param arg2 url of the designated page
# @return 
afm_load_page()
{
    echo "<META HTTP-EQUIV=REFRESH CONTENT=\"$1;URL=$2\">"
}

# to see if arg1 is digit number
# @param arg1
# @return 1(yes), 0(no)
afm_isdigit()
{
	local ret=""

	ret=`echo $1 | sed -e "s/[0-9]//g"`
	[ "${ret}" = "" -o "${ret}" = "-" ] && return 1
	return 0
}

# @param arg1 the number
# @param arg2 begin number
# @param arg3 end number
# @return 1(yes) 0(no)
afm_isbetween()
{
	local ret=""

	ret=`echo $1 | sed -e "s/[0-9]//g"`
	[ "${ret}" != "" -a "${ret}" != "-" ] && return 0
	
	[ $1 -ge $2 -a $1 -le $3 ] && return 1
	return 0
}

# to see if arg1 is an IP address
# @param arg1
# @return 1(yes), 0(no)
afm_isipaddr()
{
	local v=""

	v=`echo $1 | cut -d'.' -f1`
	afm_isbetween "$v" 0 255
	[ "$?" = "0" ] && return 0

	v=`echo $1 | cut -d'.' -f2`
	afm_isbetween "$v" 0 255
	[ "$?" = "0" ] && return 0

	v=`echo $1 | cut -d'.' -f3`
	afm_isbetween "$v" 0 255
	[ "$?" = "0" ] && return 0

	v=`echo $1 | cut -d'.' -f4`
	afm_isbetween "$v" 0 255
	[ "$?" = "0" ] && return 0

	v=`echo $1 | cut -d'.' -f5`
	[ "$v" != "" ] && return 0

	return 1 
}


cgi_show_iptype()
{
        local anyselect=""
        local netselect=""
        local rngselect=""

        case "$1" in
        "any")
                anyselect="selected"
                ;;
        "net")
                netselect="selected"
                ;;
        "iprange")
                rngselect="selected"
                ;;
        esac

        echo "<option value=\"any\" ${anyselect}>任意地址</option>"
        echo "<option value=\"net\" ${netselect}>xxx.xxx.xxx.xxx/nn</option>"
        echo "<option value=\"range\" ${rngselect}>n.n.n.n-m.m.m.m</option>"

        if [ "${tblexists}" != "" ]; then
                if [ "$1" = "table" ]; then
                        echo "<option value=\"table\" selected>IP群组</option>"
                else
                        echo "<option value=\"table\">IP群组</option>"
                fi
        fi
}

cgi_show_usrgrp()
{
	local idname=$1
	local gid

	${FLOWEYE} usrinfo listgrp | while read gid gname theothers
	do
		gid=$((${gid} + 1))
		if [ "${idname}" = "usr.${gid}" -o "${idname}" = "${gname}" ]; then
			echo "<option value=\"usr.${gid}\" selected>${gname}</option>"
		else
			echo "<option value=\"usr.${gid}\">${gname}</option>"
		fi
	done

	${FLOWEYE} pppoeippool list | while read pid pname start end theothers
	do
		[ "${start}" = "0.0.0.0" -a "${end}" = "0.0.0.0" ] && continue;
		if [ "${idname}" = "pppoe.${pid}" -o "${idname}" = "${pname}" ]; then
			echo "<option value=\"pppoe.${pid}\" selected>${pname}</option>"
		else
			echo "<option value=\"pppoe.${pid}\">${pname}</option>"
		fi
	done
}


operator_check()
{
	local url=$1
	local user=$2

	[ "${user}" = "" ] && user=${ADMIN_NAME}
	echo "0.01" >> /usr/ramdisk/admin/out
	if [ "${PANABIT_USER}" != "${ADMIN_NAME}" -a "${PANABIT_USER}" != "${user}" ]; then
		afm_dialog_msg "操作权限不够!"
		afm_load_page 0 "${url}"
		echo "0.1" >> /usr/ramdisk/admin/out
		exit 0
	fi
}

cgi_show_app_info()
{
	local appid="$1"
	local width=$2
	local nameval

	wid8=$((${width} / 8))
	wid4=$((${width} / 4))	

	output=`${FLOWEYE} app get ${CGI_appid}`
	if [ "${output}" != "" ]; then
		for nameval in ${output}; do
        		eval "${nameval}"
		done
	fi

	echo "<table width=${width} border=0 cellspacing=1 cellpadding=1>
<tr id=tblhdr height=22>
    <td width=${wid8} align=center>连接数</td>
    <td width=${wid8} align=center>节点数</td>
    <td width=${wid4} align=center>流量(上行/下行)</td>
    <td width=${wid4} align=center>速率(上行/下行)</td>
    <td width=* align=center>代理速率(上行/下行)</td>
</tr>
<tr id=row1 height=22>
        <td align=right>${flowcnt}</td>
        <td align=right>${nodecnt}</td>
        <td align=right>${upbytes}/${downbytes}</td>
        <td align=right>${upbps}/${downbps}</td>
        <td align=right>${nat_upbps}/${nat_downbps}</td>
</tr>
</table>"
}

cgi_show_ipobj_info()
{
	local usrname;

	if [ "${upool}" != "" ]; then
		usrname="${upool}/${nbname}"
	else
		usrname="${nbname}"
	fi

	echo "<table width=800 border=0 cellspacing=1 cellpadding=1>
<tr id=tblhdr>
        <td width=160 align=right>账号信息</td>
        <td width=130 align=right>MAC地址</td>
        <td width=120 align=right>累计流出</td>
        <td width=120 align=right>累计流入</td>
        <td width=120 align=right>流出bps</td>
        <td width=*   align=right>流入bps</td>
</tr>
<tr id=row5>
        <td align=right>${usrname}</td>
        <td align=right>${mac}</td>
        <td align=right id=ipoutbytes>${outbytes}</td>
        <td align=right id=ipinbytes>${inbytes}</td>
        <td align=right id=ipbpsout>${bpsout}</td>
        <td align=right id=ipbpsin>${bpsin}</td>
</tr>
</table>

<table width=800 border=0 cellspacing=1 cellpadding=1>
<tr id=tblhdr>
        <td width=160 align=right>速率限制(入/出,kbps)</td>
        <td width=130 align=right>在线时长(秒)</td>
        <td width=120 align=right>连接数</td>
        <td width=120 align=right>虚拟身份</td>
        <td width=120 align=right>共享(IE/CH/加权)</td>
        <td width=*   align=right>移动终端</td>
</tr>
<tr id=row1>
        <td align=right>${ratein}/${rateout}</td>
        <td align=right id=iplifetime>${life_tmstr}</td>
        <td align=right id=ipflowcnt>${flowcnt}</td>
        <td align=right id=ipqqcnt>${qqcnt}/${accountcnt}</td>
        <td align=right id=ipcookie>${iecookie}/${chromecookie}/${weightcookie}</td>
       	<td align=right id=ipmstcnt>${mstcnt}</td>
</tr>
</table>"
}

WEB_LOGGER()
{
	local logfile
	local curtime

	if [ -e /usr/ramdisk/datalog/keepme ]; then
		localfile="/usr/ramdisk/datalog/web_`date +%Y.%m.%d`.log"
	else
		localfile="${DATAPATH}/web_`date +%Y.%m.%d`.log"
	fi

	curtime=`date +%Y.%m.%d/%H:%M:%S`
	echo "${curtime} ${REMOTE_ADDR} ${PANABIT_USER} $1 $2" >> ${localfile}
	sync
	sync
}

string_verify()
{
	local errmsg
	local sysname="$1"

        # verify it
        errmsg=`echo ${sysname} | grep "[&|\||>|-|(|)]"`
        [ "${errmsg}" != "" ] && return 0

	errmsg=`echo ${CGI_sysname} | grep "\.conf"`
	[ "${errmsg}" != "" ] && return 0

	return 1
}

cgi_show_iftablist()
{
	echo "当前状态#/cgi-bin/Monitor/if_show?name=$1 实时流量#/cgi-bin/Monitor/ifpxy_rtgraph?name=$1 历史趋势#/cgi-bin/Monitor/if_graph?time=day&name=$1"
}

cgi_show_pxytablist()
{
	if [ "${type}" = "" ]; then
		for nameval in `${FLOWEYE} nat getproxy $1`
		do
        		eval "${nameval}"
		done
	fi

	if [ "${type}" = "rtif" ]; then
        	echo "参数设置#/cgi-bin/Route/iflan_edit?iflanname=$1 DHCP服务#/cgi-bin/Route/dhcpsvr_edit?id=$1 当前状态#/cgi-bin/Monitor/proxy_show?proxyname=$1 \
历史趋势#/cgi-bin/Monitor/proxy_graph?time=day&proxyname=$1 线路日志#/cgi-bin/Monitor/proxy_logshow?proxyname=$1"
	elif [ "${type}" = "posvrif" ]; then
        	echo "参数设置#/cgi-bin/Pppoe/pppoesvr_edit?name=$1 当前状态#/cgi-bin/Monitor/proxy_show?proxyname=$1 \
历史趋势#/cgi-bin/Monitor/proxy_graph?time=day&proxyname=$1 线路日志#/cgi-bin/Monitor/proxy_logshow?proxyname=$1"
	else
        	echo "参数设置#/cgi-bin/Route/proxy_edit?proxyname=$1 当前状态#/cgi-bin/Monitor/proxy_show?proxyname=$1 \
实时流量#/cgi-bin/Monitor/proxy_rtgraph?name=$1&type=${type} TOP应用#/cgi-bin/Monitor/proxy_apprate?link=$1 \
历史趋势#/cgi-bin/Monitor/proxy_graph?time=day&proxyname=$1 线路日志#/cgi-bin/Monitor/proxy_logshow?proxyname=$1"
	fi
}

TMPPATH=${PGPATH}/admin/tmp
MAXPRI=6
ADMIN_NAME="admin"
[ "${TOPSEC}" != "" ] && ADMIN_NAME="superman"

