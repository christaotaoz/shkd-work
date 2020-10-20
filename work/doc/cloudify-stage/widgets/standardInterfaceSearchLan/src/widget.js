//author:zhutao

import UpdateButton from './UpdateButton';
Stage.defineWidget({
    id: 'standardInterfaceSearchLan',
    name: 'standardInterfaceSearchLan',
    description: 'test standardInterfaceSearchLan',
    initialWidth: 800,
    initialHeight: 800,
    color : 'orange',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(5),
        Stage.GenericConfig.PAGE_SIZE_CONFIG(10),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('licence_id'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(true)
    ],
// interface_name,network_card,state,ip,inflow_rate,outflow_rate,vlan,mtu,network_mask,licence_id
    fetchUrl:'[manager]/interface_search_lan?[params]',
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

    doExecute(toolbox,deployment, workflow, params, force = true,dry_run = false, queue = false, scheduled_time = undefined) {
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
        }
        const {DataTable,Button} = Stage.Basic;
        let _data = this._processData(data);
        let size = _data.metadata.pagination.size;
        let offset = _data.metadata.pagination.offset;
        let Page = parseInt(offset/size);
        return (
            <div>
                <DataTable  fetchData={this.fetchGridData.bind(this,toolbox)}
                            searchable ={true}
                            pageSize={widget.configuration.pageSize}
                            totalSize={_data.total}>
                    <DataTable.Action>
                        <UpdateButton toolbox={toolbox}  data={data} />
                    </DataTable.Action>
                    <DataTable.Column  label="序号"  width="9%" />
                    <DataTable.Column  label="线路名称"  width="9%" />
                    <DataTable.Column  label="网卡"  width="9%"/>
                    <DataTable.Column  label="状态"  width="9"/>
                    <DataTable.Column  label="IP地址"  width="9%"/>
                    <DataTable.Column  label="网络掩码"  width="9%"/>
                    <DataTable.Column  label="MTU"  width="9%"/>
                    <DataTable.Column  label="VLAN"  width="9%"/>
                    <DataTable.Column  label="流入速率"  width="9%"/>
                    <DataTable.Column  label="流出速率"  width="9%"/>
                    <DataTable.Column  label="网关ID"  width="10%"/>
                    {_data.items.map((item,i)=>{return(
                        <DataTable.Row>
                            <DataTable.Data >{Page*size+(i + 1)}</DataTable.Data>
                            <DataTable.Data >{item.interface_name}</DataTable.Data>
                            <DataTable.Data >{item.network_card}</DataTable.Data>
                            <DataTable.Data >{item.state}</DataTable.Data>
                            <DataTable.Data >{item.ip}</DataTable.Data>
                            <DataTable.Data >{item.network_mask}</DataTable.Data>
                            <DataTable.Data >{item.mtu}</DataTable.Data>
                            <DataTable.Data >{item.vlan}</DataTable.Data>
                            <DataTable.Data >{item.inflow_rate}</DataTable.Data>
                            <DataTable.Data >{item.outflow_rate}</DataTable.Data>
                            <DataTable.Data >{item.licence_id}</DataTable.Data>
                        </DataTable.Row>
                    )})}
                </DataTable>
            </div>
        )
    }
});

