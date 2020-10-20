/**
 * Created by woody on 30/08/2019.
 */
export default  class UpdateButton extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            Click:false,
        };

    }

    render(){
        const {Button} = Stage.Basic;
        let toolbox = this.props.toolbox;

        return(
            <Button
                disabled={this.state.Click ? true : false}
                content={this.state.Click ? '正在更新' :'更新'}
                color={this.state.Click ? "grey":"teal"}
                icon='redo'
                labelPosition='left'

                onClick={()=>{
                    this.setState({Click : true});
                    alert("正在刷新...");
                    toolbox.getManager().doPost('/executions',null,{
                        'deployment_id': 'lineAmount',
                        'workflow_id' : 'install',
                    });
                    setTimeout(()=>{
                        this.setState({Click : false});
                    },30000);
                }}
            />
        )
    }
}
