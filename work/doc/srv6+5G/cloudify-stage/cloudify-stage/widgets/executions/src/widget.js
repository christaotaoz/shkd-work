/**
 * Created by kinneretzin on 20/10/2016.
 */

import ExecutionsTable from './ExecutionsTable';

Stage.defineWidget({
    id: "executions",
    name: '实时运行状态列表',
    description: '显示当前系统中执行状态',
    initialWidth: 8,
    initialHeight: 24,
    hasStyle: true,
    color : "teal",
    fetchUrl: {
        executions: '[manager]/executions?[params]',
        deploymentUpdates: '[manager]/deployment-updates?_include=old_blueprint_id,execution_id[params:deployment_id]'
    },
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('executions'),
    categories: [Stage.GenericConfig.CATEGORY.EXECUTIONS_NODES],
    
    initialConfiguration:
        [
            Stage.GenericConfig.POLLING_TIME_CONFIG(5),
            Stage.GenericConfig.PAGE_SIZE_CONFIG(),
            {id: "fieldsToShow",name: "表中显示的字段列表", placeHolder: "选择列表中要显示的字段",
                items: ["Blueprint","Deployment","Workflow","Id","Created","Scheduled","Ended","Creator","Attributes","Status","Actions"],
                default: 'Blueprint,Deployment,Workflow,Created,Ended,Creator,Attributes,Actions,Status', type: Stage.Basic.GenericField.MULTI_SELECT_LIST_TYPE},
            {id: "showSystemExecutions", name: "显示系统运行状态", default: true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
            Stage.GenericConfig.SORT_COLUMN_CONFIG('created_at'),
            Stage.GenericConfig.SORT_ASCENDING_CONFIG(false)
        ],

    fetchParams: function(widget, toolbox) {
        return {
            blueprint_id: toolbox.getContext().getValue('blueprintId'),
            deployment_id: toolbox.getContext().getValue('deploymentId'),
            status_display: toolbox.getContext().getValue('executionStatus'),
            _include_system_workflows: (
                widget.configuration.showSystemExecutions &&
                !toolbox.getContext().getValue('blueprintId') &&
                !toolbox.getContext().getValue('deploymentId')
            )
        };
    },

    render: function(widget,data,error,toolbox) {

        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        let {executions, deploymentUpdates} = data;

        // Create map from deployments updates items where execution_id is a key and blueprint_id is a value
        let executionIdToBlueprintIdMap = {};
        _.forEach(deploymentUpdates.items, (deploymentUpdate) =>
            executionIdToBlueprintIdMap[deploymentUpdate.execution_id] = deploymentUpdate.old_blueprint_id);

        let selectedExecution = toolbox.getContext().getValue('executionId');
        let params = this.fetchParams(widget, toolbox);
        let formattedData = {
            items: _.map (executions.items,(item)=>{
                return Object.assign({},item,{
                    blueprint_id: _.get(executionIdToBlueprintIdMap, item.id, item.blueprint_id),
                    created_at: Stage.Utils.Time.formatTimestamp(item.created_at), //2016-07-20 09:10:53.103579
                    scheduled_for: Stage.Utils.Time.formatTimestamp(item.scheduled_for),
                    ended_at: Stage.Utils.Time.formatTimestamp(item.ended_at),
                    isSelected: item.id === selectedExecution
                })
            }),
            total: _.get(executions, 'metadata.pagination.total', 0),
            blueprintId: params.blueprint_id,
            deploymentId: params.deployment_id
        };

        return (
            <ExecutionsTable widget={widget} data={formattedData} toolbox={toolbox}/>
        );
    }
});
