
// import EquipmentStatusActionTables from "./EquipmentStatusActionTables";
// import EquipmentStatusActionTablesNoData from './EquipmentStatusActionTablesNoData'
// author : zhutao
import UpdateButton from './UpdateButton';
import Synchronization from './Synchronization';
import DeploymentButton from './DeploymentButton';

Stage.defineWidget({
    id: 'userAccountStatus',
    name: 'userAccountStatus',
    description: 'test userAccountStatus',
    initialWidth: 800,
    initialHeight: 800,
    color : 'orange',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS,Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(5),
        Stage.GenericConfig.PAGE_SIZE_CONFIG(10),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('imsi'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(false)
    ],
    fetchUrl:'[manager]/user_account_status?[params]',
    fetchParams: (widget, toolbox) =>
        toolbox.getContext().getValue('onlyMyResources') ? {created_by: toolbox.getManager().getCurrentUsername()} : {},

    fetchGridData(toolbox,fetchParams) {
        return toolbox.refresh(fetchParams);
    },

    _processData(data) {
        return Object.assign({}, data, {
            total: _.get(data, 'metadata.pagination.total', 0)
        });
    },

    doExecute(toolbox,deployment, workflow, params, force = true, dry_run = false, queue = false, scheduled_time = undefined) {
        return toolbox.getManager().doPost('/executions',null,{
            'deployment_id': deployment,
            'workflow_id' : workflow,
            dry_run,
            force,
            queue,
            scheduled_time,
            parameters: params
            });
    },

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }else {
            const {DataTable} = Stage.Basic;
            let _data = this._processData(data);
            let size = _data.metadata.pagination.size;
            let offset = _data.metadata.pagination.offset;
            let Page = parseInt(offset/size);

            return (
                <div>
                    <DataTable
                               fetchData={this.fetchGridData.bind(this, toolbox)}
                               selectable={true}
                               searchable={true}
                               pageSize={widget.configuration.pageSize}
                               totalSize={_data.total}>
                        <DataTable.Action>
                            <DeploymentButton toolbox={toolbox} />
                        </DataTable.Action>
                        <DataTable.Column name='id' label="Id"/>
                        <DataTable.Column name='imsi' label="IMSI*"/>
                        <DataTable.Column name='ul' label="UL"/>
                        <DataTable.Column name='dl' label="DL" />
                        <DataTable.Column name='apn' label="APN" />
                        {_data.items.map((item, i) => {
                            return (
                                <DataTable.Row key={i}>
                                    <DataTable.Data >{item.id}</DataTable.Data>
                                    <DataTable.Data >{item.imsi}</DataTable.Data>
                                    <DataTable.Data >{item.ul}</DataTable.Data>
                                    <DataTable.Data >{item.dl}</DataTable.Data>
                                    <DataTable.Data >{item.apn}</DataTable.Data>
                                </DataTable.Row>
                            )
                        })}
                    </DataTable>
                </div>
            )
        }
    }
});

