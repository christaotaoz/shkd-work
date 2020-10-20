/**
 * Created by pawelposel on 03/11/2016.
 */
import DeploymentButton from './DeploymentButton';

Stage.defineWidget({
    id: 'deploymentButton',
    name: '创建部署按钮',
    description: '创建部署按钮',
    initialWidth: 3,
    initialHeight: 3,
    showHeader: false,
    showBorder: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deploymentButton'),
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    render: function(widget,data,error,toolbox) {
        return (
            <DeploymentButton toolbox={toolbox} />
        );
    }

});