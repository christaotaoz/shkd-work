/**
 * Created by pawelposel on 03/11/2016.
 */
import DeploymentButton from './DeploymentButton';

Stage.defineWidget({
    id: 'userAccountUpdateButton',
    name: '更新用户按钮',
    description: '更新用户按钮',
    initialWidth: 2,
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