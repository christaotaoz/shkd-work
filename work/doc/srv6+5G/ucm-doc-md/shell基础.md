变量

```
#创建一个变量
para=“this is a shell para” 
#删除一个变量
unset para
#引用一个变量
echo $para
echo ${para}

```

命令

```
#直接使用shell命令的结果
aaa=`ls`
echo aaa

s="pwd"
m="pwd;ls"
#引用一个是命令
echo $(pwd)
echo $($s)
#引用多条命令
echo $(eval pwd;ls)
echo $(eval $m)
```

数组

```
#定义
arr=（a b c）
#修改数组的值
arr[0]=d
#查看数组的某一个值
echo ${arr[1]}
#查看数组所有值
echo ${arr[@]}
echo ${arr[*]}
#查看数组的长度
${#arr[@]}
${#arr[*]}
#截取数组，第一个数字表示起点，第二个数字表示长度
${arr[@]:0:2}
```





$特殊用法

$para 或 ${para} 表示引用变量

$(pwd) 表示引用命令

$((1+1 ))表示引用表达式

使用脚本文件  para1 para2

| $#   | 传递到脚本的参数个数                                         |
| ---- | ------------------------------------------------------------ |
| $*   | 以一个单字符串显示所有向脚本传递的参数。 如"$*"用「"」括起来的情况、以"$1 $2 … $n"的形式输出所有参数。 |
| $$   | 脚本运行的当前进程ID号                                       |
| $!   | 后台运行的最后一个进程的ID号                                 |
| $@   | 与$*相同，但是使用时加引号，并在引号中返回每个参数。 如"$@"用「"」括起来的情况、以"$1" "$2" … "$n" 的形式输出所有参数。 |
| $-   | 显示Shell使用的当前选项，与[set命令](https://www.runoob.com/linux/linux-comm-set.html)功能相同。 |
| $?   | 显示最后命令的退出状态。0表示没有错误，其他任何值表明有错误  |
| $0   | 脚本文件名                                                   |
| $1   | 传给脚本的第一个参数                                         |

更多操作符参考<https://www.runoob.com/linux/linux-shell-basic-operators.html>