/**
 * Created by woody on 01/10/2019.
 */
import AccountManagement from "./AccountManagement"
Stage.defineWidget({
    id: 'accountManagement',
    name: 'Blueprint upload button',
    description: 'Adds button to upload new blueprint',
    initialWidth: 2,
    initialHeight: 4,
    showHeader: false,
    showBorder: false,
    isReact: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deploymentActionButtons'),
    categories: [Stage.GenericConfig.CATEGORY.SYSTEM_RESOURCES, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],



     fetchData: function(widget,toolbox) {
        let deploymentId = "add_user"

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
        return {deployment_id: "add_user"};
    },

    _set(data){
        if (_.has(data, 'inputs.password')){
            _.set(data, 'inputs.password');
        };
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
        return <AccountManagement deployment={data} widget={widget} toolbox={toolbox} />
            }
}
);
