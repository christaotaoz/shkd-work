/**
 * Created by kinneretzin on 07/09/2016.
 */

import DeploymentsList from './DeploymentsList';

Stage.defineWidget({
    id: 'deployments',
    name: '部署管理',
    description: '显示模版部署列表',
    initialWidth: 8,
    initialHeight: 24,
    color : 'purple',
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS],

    initialConfiguration:
        [
            Stage.GenericConfig.POLLING_TIME_CONFIG(10),
            Stage.GenericConfig.PAGE_SIZE_CONFIG(),
            {id: "clickToDrillDown", name: "点击显示明细",
                default: true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
            {id: "showExecutionStatusLabel", name: "显示执行状态",
                description: "Show last execution workflow ID and status",
                default: false, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
            {id: "blueprintIdFilter", name: "Blueprint ID to filter by",
                placeHolder: "输入要过滤的模版id", type: Stage.Basic.GenericField.STRING_TYPE},
            {id: "displayStyle", name: "显示风格",
                items: [{name:'表格', value:'table'}, {name:'列表', value:'list'}],
                default: "table", type: Stage.Basic.GenericField.LIST_TYPE},
            Stage.GenericConfig.SORT_COLUMN_CONFIG('created_at'),
            Stage.GenericConfig.SORT_ASCENDING_CONFIG(false)
        ],
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deployments'),

    fetchParams: function(widget, toolbox) {
        var blueprintId = toolbox.getContext().getValue('blueprintId');

        blueprintId = _.isEmpty(widget.configuration.blueprintIdFilter) ? blueprintId : widget.configuration.blueprintIdFilter;

        let obj = {
            blueprint_id: blueprintId
        }
        if(toolbox.getContext ().getValue ('onlyMyResources')){
            obj.created_by = toolbox.getManager().getCurrentUsername();
        }
        return obj;
    },

    fetchData: function(widget,toolbox,params) {
        let deploymentData = toolbox.getManager().doGet('/deployments', {
                _include: 'id,blueprint_id,visibility,created_at,created_by,updated_at,inputs,workflows',
                ...params
            });
        let deploymentIds = deploymentData.then(data => _.map(data.items, item => item.id));

        let nodeInstanceData = deploymentIds.then(ids =>
            toolbox.getManager().doGet('/summary/node_instances', {
                _target_field: 'deployment_id',
                _sub_field: 'state',
                deployment_id: ids
            })
        );

        let executionsData = deploymentIds.then(ids =>
            toolbox.getManager().doGet('/executions', {
                _include: 'id,deployment_id,workflow_id,status,status_display,created_at,scheduled_for,ended_at,parameters,error',
                _sort: '-ended_at',
                deployment_id: ids
            })
        );

        return Promise.all([deploymentData, nodeInstanceData, executionsData]).then(function(data) {
                const deploymentData = data[0];
                const nodeInstanceData = _.reduce(data[1].items, (result, item) => {
                    result[item.deployment_id] = {
                        states: _.reduce(item['by state'], (result, state) => {
                                result[state.state] = state.node_instances;
                                return result;
                            }, {}),
                        count: item.node_instances
                    };
                    return result;
                }, {});
                const executionsData = _.groupBy(data[2].items, 'deployment_id');

                return Object.assign({}, deploymentData, {
                    items: _.map (deploymentData.items,(item) => {
                        let workflows = Stage.Common.DeploymentUtils.filterWorkflows(_.sortBy(item.workflows, ['name']));
                        return Object.assign({},item,{
                            nodeInstancesCount: !!nodeInstanceData[item.id] ? nodeInstanceData[item.id].count : 0,
                            nodeInstancesStates: !!nodeInstanceData[item.id] ? nodeInstanceData[item.id].states : {},
                            created_at: Stage.Utils.Time.formatTimestamp(item.created_at), //2016-07-20 09:10:53.103579
                            updated_at: Stage.Utils.Time.formatTimestamp(item.updated_at),
                            executions: _.filter(executionsData[item.id], Stage.Utils.Execution.isActiveExecution),
                            lastExecution: _.first(executionsData[item.id]),
                            workflows
                        })
                    }),
                    total: _.get(deploymentData, 'metadata.pagination.total', 0),
                    blueprintId: params.blueprint_id
                });
            });
    },

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        let selectedDeployment = toolbox.getContext().getValue('deploymentId');
        let formattedData = Object.assign({},data,{
            items: _.map (data.items,(item)=>{
                return Object.assign({},item,{
                    isSelected: selectedDeployment === item.id,
                    isUpdated: !_.isEqual(item.created_at, item.updated_at)
                })
            })
        });

        return (
            <DeploymentsList widget={widget} data={formattedData} toolbox={toolbox}/>
        );
    }
});
