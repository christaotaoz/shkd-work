
// import EquipmentStatusActionTables from "./EquipmentStatusActionTables";
// import EquipmentStatusActionTablesNoData from './EquipmentStatusActionTablesNoData'
// author : zhutao
import UpdateButton from './UpdateButton';
import Synchronization from './Synchronization';

Stage.defineWidget({
    id: 'equipmentStatus',
    name: 'equipmentStatus',
    description: 'test equipmentStatus',
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
        Stage.GenericConfig.SORT_COLUMN_CONFIG('license_id'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(false)
    ],
    fetchUrl:'[manager]/equipment_status?[params]',
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
                    <DataTable fetchData={this.fetchGridData.bind(this, toolbox)}
                               selectable={true}
                               searchable={true}
                               pageSize={widget.configuration.pageSize}
                               totalSize={_data.total}>
                        <DataTable.Action>
                            <UpdateButton toolbox={toolbox} data={data}/>
                        </DataTable.Action>
                        <DataTable.Column name='id' label="序号"/>
                        <DataTable.Column name='license_id' label="5G基站"/>
                        <DataTable.Column name='sys_name' label="Hinoc" />
                        <DataTable.Column name='state' label="边缘云"/>
                        <DataTable.Column name='time_str' label="CDN" />
                        <DataTable.Column name='valid_time' label="SDWAN" />
                        {_data.items.map((item, i) => {
                            return (
                                <DataTable.Row key={i}>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{Page*size+(i + 1)}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.license_id}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.sys_name}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.state}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.time_str}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.valid_time}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.users}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.flowcont}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.bps}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.sys_run}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.temp_cpu}</p>
                                    </DataTable.Data>
                                    <DataTable.Data><p
                                        style={{color: item.state == 'offline' ? '#f00' : '#000'}}>{item.version}</p>
                                    </DataTable.Data>
                                </DataTable.Row>
                            )
                        })}
                    </DataTable>
                </div>
            )
        }
    }
});

