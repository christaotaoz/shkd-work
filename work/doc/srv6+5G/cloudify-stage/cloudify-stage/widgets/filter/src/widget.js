/**
 * Created by kinneretzin on 07/09/2016.
 */

import Filter from './Filter';

Stage.defineWidget({
    id: 'filter',
    name: '资源过滤',
    description: '为资源创建过滤 - 模板, 部署, 节点, 实例 and 执行',
    initialWidth: 12,
    initialHeight: 3,
    color: 'yellow',
    showHeader: false,
    showBorder: false,
    categories: [Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],
    
    fetchData:(widget,toolbox,params)=>{
        return Promise.all([
            widget.configuration.filterByBlueprints ? toolbox.getManager().doGetFull('/blueprints?_include=id') : Promise.resolve({}),
            widget.configuration.filterByDeployments ? toolbox.getManager().doGetFull('/deployments?_include=id,blueprint_id') : Promise.resolve({}),
            widget.configuration.filterByNodes ? toolbox.getManager().doGetFull('/nodes?_include=id,blueprint_id,deployment_id') : Promise.resolve({}),
            widget.configuration.filterByNodeInstances ? toolbox.getManager().doGetFull('/node-instances?_include=id,deployment_id,node_id') : Promise.resolve({}),
            widget.configuration.filterByExecutions || widget.configuration.filterByExecutionsStatus ?
                toolbox.getManager().doGetFull('/executions?_include=id,blueprint_id,deployment_id,workflow_id,status_display') : Promise.resolve({}),
        ]).then(results=>{
            return {
                blueprints: results[0],
                deployments: results[1],
                nodes: results[2],
                nodeInstances: results[3],
                executions: results[4]
            }
        });
    },

    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('filter'),
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(10),
        {id: "filterByBlueprints",name: "显示模板过滤器", default: true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: "filterByDeployments",name: "显示部署过滤器", default: true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: "filterByExecutions",name: "显示执行过滤器", default: true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: "filterByNodes",name: "显示节点过滤器", default: false, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: "filterByNodeInstances",name: "显示实例过滤器", default: false, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: "filterByExecutionsStatus",name: "显示执行状态过滤器", default: false, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: "allowMultipleSelection", name: "允许多选",
         description: "Allows selecting more than one blueprint, deployment, node, node instance and execution in the filter",
         default: false, type: Stage.Basic.GenericField.BOOLEAN_TYPE}
    ],

    _processData(blueprintId, deploymentId, nodeId, nodeInstanceId, executionId, executionStatus, data) {
        let processedData = {
            blueprintId,
            deploymentId,
            nodeId,
            nodeInstanceId,
            executionId,
            executionStatus,
            blueprints: {
                items: _.sortBy(data.blueprints.items, 'id')
            },
            deployments: {
                items: _.sortBy(data.deployments.items, 'id')
            },
            nodes: {
                items: _.sortBy(data.nodes.items, 'id')
            },
            nodeInstances: {
                items: _.sortBy(data.nodeInstances.items, 'id')
            },
            executions: {
                items: _.sortBy(data.executions.items, 'id')
            }
        };

        processedData.allExecutions = Object.assign({}, processedData.executions);
        if (!_.isNil(blueprintId)) {
            let blueprintIdArray = _.castArray(blueprintId);
            processedData.deployments.items
                = _.filter(processedData.deployments.items, (deployment) => _.includes(blueprintIdArray, deployment.blueprint_id));
            processedData.nodes.items
                = _.filter(processedData.nodes.items, (node) => _.includes(blueprintIdArray, node.blueprint_id));
            processedData.executions.items
                = _.filter(processedData.executions.items, (execution) => _.includes(blueprintIdArray, execution.blueprint_id));
        }

        if (!_.isNil(deploymentId)) {
            const deploymentIdArray = _.castArray(deploymentId);
            processedData.nodes.items
                = _.filter(processedData.nodes.items, (node) => _.includes(deploymentIdArray, node.deployment_id));
            processedData.nodeInstances.items
                = _.filter(processedData.nodeInstances.items, (nodeInstance) => _.includes(deploymentIdArray, nodeInstance.deployment_id));
            processedData.executions.items
                = _.filter(processedData.executions.items, (execution) => _.includes(deploymentIdArray, execution.deployment_id));
        }

        if (!_.isNil(nodeId)) {
            const nodeIdArray = _.castArray(nodeId);
            processedData.nodeInstances.items
                = _.filter(processedData.nodeInstances.items, (nodeInstance) => _.includes(nodeIdArray, nodeInstance.node_id));
        }

        processedData.executionStatuses = Object.assign({}, processedData.executions);
        if (!_.isNil(executionId)) {
            const executionIdArray = _.castArray(executionId);
            processedData.executionStatuses.items
                = _.filter(processedData.executionStatuses.items, (execution) => _.includes(executionIdArray, execution.id));
        }

        return processedData;
    },
    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        const context = toolbox.getContext();
        const selectedBlueprintIds = context.getValue('blueprintId');
        const selectedDeploymentIds = context.getValue('deploymentId');
        const selectedNodeIds = context.getValue('nodeId');
        const selectedNodeInstanceIds = context.getValue('nodeInstanceId');
        const selectedExecutionIds = context.getValue('executionId');
        const selectedExecutionStatus = context.getValue('executionStatus');

        let processedData
            = this._processData(selectedBlueprintIds, selectedDeploymentIds, selectedNodeIds,
                                selectedNodeInstanceIds, selectedExecutionIds, selectedExecutionStatus, data);

        return (
            <Filter configuration={widget.configuration} data={processedData} toolbox={toolbox}/>
        );

    }
});