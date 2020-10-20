import UploadButton from "../../pluginUploadButton/src/UploadButton";

/**
 * Created by zhengqin on 08/25/2019.
 */

import InterfaceConf from './InterfaceConf';

Stage.defineWidget({
    id: 'interfaceConf',
    name: '更新接口配置',
    description: '更新WAN和LAN接口的MTU配置',
    initialWidth: 2,
    initialHeight: 4,
    showHeader: false,
    showBorder: false,
    isReact: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deploymentActionButtons'),
    categories: [Stage.GenericConfig.CATEGORY.SYSTEM_RESOURCES, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    fetchData: function(widget,toolbox) {
        let deploymentId = "interface_conf";

        if (!_.isEmpty(deploymentId)) {
            toolbox.loading(true);
            return toolbox.getManager().doGet(`/deployments/${deploymentId}`)
                .then(deployment => {
                    toolbox.loading(false);
                    let workflows = Stage.Common.DeploymentUtils.filterWorkflows(_.sortBy(deployment.workflows, ['name']));

                    return Promise.resolve({...deployment, workflows});
                });
        }

        return Promise.resolve(InterfaceConf.EMPTY_DEPLOYMENT);
    },

    render: function(widget,data,error,toolbox) {

        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }
        return (
            <InterfaceConf deployment={data} widget={widget} toolbox={toolbox} />
        );
    }
}
);
