/**
 * Created by woody on 01/09/2019.
 */

import RestPasswd from './RestPasswd';

Stage.defineWidget({
    id: 'resetPassword',
    name: 'button',
    description: 'Adds button',
    initialWidth: 2,
    initialHeight: 4,
    showHeader: false,
    showBorder: false,
    isReact: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deploymentActionButtons'),
    categories: [Stage.GenericConfig.CATEGORY.SYSTEM_RESOURCES, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    fetchData: function(widget,toolbox) {
        let deploymentId = "reset_password"

        if (!_.isEmpty(deploymentId)) {
            toolbox.loading(true);
            return toolbox.getManager().doGet(`/deployments/${deploymentId}`)
                .then(deployment => {
                    toolbox.loading(false);
                    let workflows = Stage.Common.DeploymentUtils.filterWorkflows(_.sortBy(deployment.workflows, ['name']));

                    return Promise.resolve({...deployment, workflows});
                });
        }

        return Promise.resolve(DeploymentActionButtons.EMPTY_DEPLOYMENT);
    },

    fetchParams: function(widget, toolbox) {
        return {deployment_id: "reset_password"};
    },

    _set(data){
        if (_.has(data, 'inputs.user_name')){
            _.set(data, 'inputs.user_name');
        };
    },


    render: function(widget,data,error,toolbox) {
        let {} = Stage.Basic;
        this._set(data);



        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }
        return (
            <RestPasswd deployment={data} widget={widget} toolbox={toolbox} />
        );
    }
}
);
