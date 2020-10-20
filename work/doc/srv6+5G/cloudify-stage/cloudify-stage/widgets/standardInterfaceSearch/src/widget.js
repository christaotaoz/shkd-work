// author : zhutao

import UpdateButton from './UpdateButton';
Stage.defineWidget({
    id: 'standardInterfaceSearch',
    name: 'standardInterfaceSearch',
    description: 'test standardInterfaceSearch',
    initialWidth: 800,
    initialHeight: 800,
    color : 'blue',
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
    //line_name,network_card,state,ip,gateway,mtu,vlan,dns_traction_failure_rate,inflow_rate,outflow_rate,connects,licence_id,annotate
    fetchUrl:'[manager]/interface_search?[params]',
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

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }else{
            const {DataTable,Button} = Stage.Basic;
            let _data = this._processData(data);
            let size = _data.metadata.pagination.size;
            let offset = _data.metadata.pagination.offset;
            let Page = parseInt(offset/size);
            return (
                <div>
                    <DataTable
                        fetchData={this.fetchGridData.bind(this,toolbox)}
                        searchable ={true}
                        pageSize={widget.configuration.pageSize}
                        totalSize={_data.total}>
                        <DataTable.Action>
                            <UpdateButton toolbox={toolbox}  data={data}/>
                        </DataTable.Action>
                        <DataTable.Column label="序号"  width="7%" />
                        <DataTable.Column label="线路名称"  width="7%" />
                        <DataTable.Column label="网卡"  width="7%"/>
                        <DataTable.Column label="状态"  width="7%"/>
                        <DataTable.Column label="IP地址"  width="9%"/>
                        <DataTable.Column label="网关地址"  width="9%"/>
                        <DataTable.Column label="MTU"  width="7%"/>
                        <DataTable.Column label="VLAN"  width="7%"/>
                        <DataTable.Column label="DNS牵引/失败率"  width="7%"/>
                        <DataTable.Column label="流入速率"  width="7%"/>
                        <DataTable.Column label="流出速率"  width="7"/>
                        <DataTable.Column label="连接数"  width="7%"/>
                        {/*<DataTable.Column label="所属组"  width="6%"/>*/}
                        {/*<DataTable.Column label="备注"  width="7%"/>*/}
                        <DataTable.Column label="网关ID"  width="10%"/>
                        {_data.items.map((item,i)=>{return(
                            <DataTable.Row>
                                <DataTable.Data >{Page*size+(i + 1)}</DataTable.Data>
                                <DataTable.Data >{item.line_name}</DataTable.Data>
                                <DataTable.Data >{item.network_card}</DataTable.Data>
                                <DataTable.Data >{item.state}</DataTable.Data>
                                <DataTable.Data >{item.ip}</DataTable.Data>
                                <DataTable.Data >{item.gateway}</DataTable.Data>
                                <DataTable.Data >{item.mtu}</DataTable.Data>
                                <DataTable.Data >{item.vlan}</DataTable.Data>
                                <DataTable.Data >{item.dns_traction_failure_rate}</DataTable.Data>
                                <DataTable.Data >{item.inflow_rate}</DataTable.Data>
                                <DataTable.Data >{item.outflow_rate}</DataTable.Data>
                                <DataTable.Data >{item.connects}</DataTable.Data>
                                {/*<DataTable.Data >{item.group_}</DataTable.Data>*/}
                                {/*<DataTable.Data >{item.annotate}</DataTable.Data>*/}
                                <DataTable.Data >{item.licence_id}</DataTable.Data>
                            </DataTable.Row>
                        )})}
                    </DataTable>
                </div>
            )
        }
    }
});

