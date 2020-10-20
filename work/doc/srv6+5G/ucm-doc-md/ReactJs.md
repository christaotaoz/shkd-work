基础概念

```
React 使用 JSX 来替代常规的 JavaScript。

JSX 的基本语法规则：遇到 HTML 标签（以 `<` 开头），就用 HTML 规则解析；遇到代码块（以 `{` 开头），就用 JavaScript 规则解析
	{ }可以支持多种类型
	1.数字
	2.str
	3.bool 	#{boo.toString()}
	4.Object 	#[ ] or h11h1	JSX 允许在模板中插入数组，数组会自动展开所有成员

```



基础语法

```
#循环和遍历
#方案一：forEach
    const arrStr = ['1','2','3']
    const aStr
    arrStr.forEach(item=>{
    const temp = <h5>{item}</h5>
    aStr.push(temp)
    })
    
#方案二：map（必须有return）
	{arrStr.map(item=>{
		return <h5>{item}</h5>
	}))
	箭头函数返回值只有一行时，可以省略(return)
	
React中，需要把key添加给 被forEach 或 map 或 for 循环直接控制的元素

...obj（展开对象）

 ; 用法：如果是以 [ ( + -  五个符号为首字符，上一行结尾需加；
 
如果你没有给组件属性传值，它默认为 true

cb && cb（）表示cb如果为函数，就调用cb（）
```



基本用法：

```
1.导入包
		import React from 'react'；
		import ReactDOM from 'react-dom'；

2.创建虚拟DOM元素
		const mydiv = React .createElement('div',{id'mydiv'},'这是一个div元素')
		const mydiv = div id='mydiv'这是一个div元素div
3.调用render函数渲染
		ReactDOM.render(mydiv,docment.getElementById('app'))
```



创建组件(React.Component)的方式：组件必须大写字符开头

```
#第一种方式，命名函数
function Hello() { return XXX }

#第二种方式，定义类
class Hello extends React.Component{

    #构造器函数,类似于python的__init__方法
    constructor(props){
        super(props); #相当于手动调用父类构造函数
        this.state = {};
    }
    
    #更新状态函数
 	myfunc(){
 		this.setState({open: true});
 	}
 	
 	#必须定义render函数，渲染当前组件对应的虚拟DOM元素
    render(){
        #外界传递的props参数，通过 { this.props.XX } 访问
        return XXX #render函数中，必须返回合法的JSX虚拟DOM结构
    }
    
#子类继承父类的实例属性和实例方法
创建实例：new Hello()
实例属性：通过new出来的实例，访问到的属性 
静态属性：通过构造函数，直接访问到的属性 ，在class内部，通过static关键字标记
实例方法：
静态方法：
原型对象：prototype(存放实例方法)
```



组件的传参

```
#父组件 → 子组件
父组件Comment.js:
import React from "react"
import ComentList from "./ComentList"
class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        	arr:{}
        };
    }
    
    changeState(props){
		this.SetState({arr:props})    
    }
    
    render(
        return (
                <div>
                    <ComentList arr={this.state.arr}> //这里把state里面的arr传递到子组件</ComentList>
                    #或<ComentList arr={this.state.arr}/>
                </div>

        )
    ) 
}

子组件CommentList.js:
import React from "react"
class ComentList extends React.Component {
    constructor(props) {
        super(props);
    }
    render(
    	<div>this.props.state</div>
    ) 
}


#子组件 → 父组件
在父组件定义changeState函数并作为参数传给子组件
<ComentList changeState={changeState}>
在子组件中调用changeState函数,传入参数
this.props.changeState(props)
```



组件的生命周期

```
组件的生命周期分成三个状态：

Mounting：已插入真实 DOM
Updating：正在被重新渲染
Unmounting：已移出真实 DOM
React 为每个状态都提供了两种处理函数，will 函数在进入状态之前调用，did 函数在进入状态之后调用，三种状态共计五种处理函数。

componentWillMount()
componentDidMount()
componentWillUpdate(object nextProps, object nextState)
componentDidUpdate(object prevProps, object prevState)
componentWillUnmount()
此外，React 还提供两种特殊状态的处理函数。

componentWillReceiveProps(object nextProps)：已加载组件收到新的参数时调用
shouldComponentUpdate(object nextProps, object nextState)：组件判断是否重新渲染时调用
这些方法的详细说明，可以参考官方文档。下面是一个例子

var Hello = React.createClass({
  getInitialState: function () {
    return {
      opacity: 1.0
    };
  },

  componentDidMount: function () {
    this.timer = setInterval(function () {
      var opacity = this.state.opacity;
      opacity -= .05;
      if (opacity < 0.1) {
        opacity = 1.0;
      }
      this.setState({
        opacity: opacity
      });
    }.bind(this), 100);
  },

  render: function () {
    return (
      <div style={{opacity: this.state.opacity}}>
        Hello {this.props.name}
      </div>
    );
  }
});

ReactDOM.render(
  <Hello name="world"/>,
  document.body
);
上面代码在hello组件加载以后，通过 componentDidMount 方法设置一个定时器，每隔100毫秒，就重新设置组件的透明度，从而引发重新渲染。

另外，组件的style属性的设置方式也值得注意，不能写成
style="opacity:{this.state.opacity};"
而要写成
style={{opacity: this.state.opacity}}
这是因为 React 组件样式是一个对象，所以第一重大括号表示这是 JavaScript 语法，第二重大括号表示样式对象。

```



FAQ

```
1.this.state 和 this.props传参有什么区别
答： this.state是 子组件 → 父组件 传参;
	this.props是	子组件 → 父组件 传参;
	this.props是只读的，this.state可读可写;
2.可以return里写if或for语句吗
答： if 语句和 for 循环在 JavaScript 中不是表达式，因此它们不能直接在 JSX 中使用，但是你可以将它们放在周围的代码中
```

