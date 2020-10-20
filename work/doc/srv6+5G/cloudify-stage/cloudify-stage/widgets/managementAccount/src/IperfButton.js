
import React from "react";

import IperfModal from './IperfModal';

export default  class IperfButton extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isCallable:false,
            open:false,
            id:'',
        };

    }
    onShow() {
        this.setState({open: true});
    }

    _hideModal () {
        this.setState({open: false});
    }
    onCallable () {
        if (this.state.isCallable === false)
        {this.setState({isCallable:true});}
        if (this.state.isCallable === true)
        {this.setState({isCallable:false});}
    }
    render(){
        const {Button} = Stage.Basic;
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        return (
            <div >
                <Button color="violet" icon='add' content={!this.state.isCallable ? '5G边缘云测试':'正在测试中..'} labelPosition='left' className='widgetButton'
                       onClick={()=>{
                                    this.setState({isCallable : true});
                                    this.props.toolbox.getManager().doPost('/executions',null,{
                                        'deployment_id': 'iperfd',
                                        'workflow_id' : 'install',
                                    })
                                    .then((exe)=>{
                                        console.log('id test');
                                        console.log(exe.id);
                                        console.log('id test');
                                        executionActions.waitUntilFinished(exe.id,2000)
                                            .then((res)=>{
                                                console.log(res);
                                                if(res[0].status === 'terminated'){
                                                    console.log('iperf工作流执行完毕');
                                                    this.setState({isCallable : false});
                                                    this.setState({id : exe.id});
                                                    console.log(this.state.id);
                                                    this.props.toolbox.refresh();
                                                    console.log('iperf工作流执行完毕');
                                                    this.onShow();
                                                }
                                            });
                                    })
                                }}
                    // onClick={this.onShow.bind(this)}
                            />
                <IperfModal open={this.state.open} toolbox={this.props.toolbox} onHide={this._hideModal.bind(this)} onCallable={this.onCallable.bind(this)} data={this.props.data} id={this.state.id}/>
            </div>
        )
    }
}
