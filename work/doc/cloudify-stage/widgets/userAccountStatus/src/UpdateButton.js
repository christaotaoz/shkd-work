// author : zhutao

export default  class UpdateButton extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isCallable:false,
        };

    }
    render(){
        const {Button} = Stage.Basic;
        let toolbox = this.props.toolbox;
        // let data = this.props.data;
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        return(

            <Button
                disabled={!this.state.isCallable ? false : true}
                content={!this.state.isCallable ? '用户查询' :'正在查询中..'}

                color="green"
                icon='redo'
                labelPosition='left'
                style={{width: '155px'}}
                onClick={()=>{
                    this.setState({isCallable : true});
                    toolbox.getManager().doPost('/executions',null,{
                        'deployment_id': 'read',
                        'workflow_id' : 'install',
                    })
                        .then((exe)=>{
                            console.log(exe.id);
                            executionActions.waitUntilFinished(exe.id,2000)
                                .then((res)=>{
                                    console.log(res);
                                    if(res[0].status === 'terminated'){
                                        window.alert('update ok');
                                        this.setState({isCallable : false});
                                    }
                                });

                        })

                    // toolbox.getEventBus().on('deployments:refresh', ()=>{window.alert('1233')});
                    // setTimeout(
                    //     ()=>{
                    //         // data ? toolbox.getEventBus().trigger('deployments:refresh') : null;
                    //         data ? setTimeout(()=>{this.setState({isCallable : false})},10000) : null;
                    //     },10000
                    // );

                }}
            />
        )
    }
}
