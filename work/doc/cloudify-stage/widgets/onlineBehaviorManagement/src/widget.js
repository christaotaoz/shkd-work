/**
 * Created by liuhui on 04/06/2019.
 */

Stage.defineWidget({
    id: 'onlineBehaviorManagment',
    name: 'Blueprint upload button',
    description: 'Adds button to upload new blueprint',
    initialWidth: 2,
    initialHeight: 4,
    showHeader: false,
    showBorder: false,
    isReact: true,

    render: function(widget,data,error,toolbox) {
        let {Button} = Stage.Basic;
        let {deploymentActionButtonsWidget,blueprintActionButtonsWidget,executeWorkflowButton} = Stage.Common;


        return<div>
        <Button content="上网行为管理" icon="arrows alternate" labelPosition='left' color="blue" className='widgetButton' />
            <executeWorkflowButton open='true'/>
        </div>


    }
}
);
