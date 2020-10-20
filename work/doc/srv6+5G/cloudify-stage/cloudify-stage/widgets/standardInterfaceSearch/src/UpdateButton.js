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
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        return(
            <Button
                disabled={!this.state.isCallable ? false : true}
                content={!this.state.isCallable ? '更新' :'正在更新中..'}
                color="teal"
                icon='redo'
                labelPosition='left'
                style={{width: '155px'}}
                onClick={()=>{
                    this.setState({isCallable : true});
                    toolbox.getManager().doPost('/executions',null,{
                        'deployment_id': 'standardinterfacesearch',
                        'workflow_id' : 'install',
                    })
                    .then((exe)=>{
                        executionActions.waitUntilFinished(exe.id,2000)
                            .then((res)=>{
                                console.log(res);
                                if(res[0].status === 'terminated'){
                                    window.alert('update ok');
                                    this.setState({isCallable : false});
                                }
                            });
                    });
                }}
            />
        )
    }
}
