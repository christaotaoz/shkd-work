/**
 * Created by jakubniezgoda on 28/02/2017.
 */

export default class TemplateButtons extends React.Component {

    // doDownload(toolbox) {
    //     alert("正在更新模板,此过程需要一段时间,请勿断网断电！！！");
    //     this.toolbox.getManager().doPost('/executions',null,{
    //                     'deployment_id': 'Template001',
    //                     'workflow_id' : 'install',
    //                 });
    // }

    render() {
        let {Button} = Stage.Basic;
        let toolbox = this.props.toolbox;
        let id = "Template00"+ this.props.id
        let content = this.props.content
        return (
                 <Button  color="blue" icon="file alternate" labelPosition='left'content={content} style={{width: '250px'}}
                 onClick={()=>{
                    if (confirm(content+":确认更新模板？") && confirm(content+"此过程需要一段时间,请勿断网断电！！！")){
                    toolbox.getManager().doPost('/executions',null,{
                        'deployment_id': id,
                        'workflow_id' : 'install',
                    });}
                }}/>
        );
    }
}