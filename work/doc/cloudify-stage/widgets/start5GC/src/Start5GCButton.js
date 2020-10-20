export default  class Start5GCButton extends React.Component {
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
                disabled={this.state.isCallable}
                content={!this.state.isCallable ? '启动5GC' :'正在启动中..'}
                className='widgetButton'
                color="violet"
                icon='sync'
                labelPosition='left'
                onClick={()=>{
                    this.setState({isCallable : true});
                    toolbox.getManager().doPost('/executions',null,{
                        'deployment_id': 'fivegcd',
                        'workflow_id' : 'install',
                    })
                    .then((exe)=>{
                        console.log(exe.id);
                        executionActions.waitUntilFinished(exe.id,2000)
                            .then((res)=>{
                                console.log(res);
                                if(res[0].status === 'terminated'){
                                    window.alert('ok');
                                    this.setState({isCallable : false});
                                }
                            });
                    });
                }}
            />
        )
    }
}
