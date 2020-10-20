//author:zhutao

import UpdateButton from './UpdateButton'
Stage.defineWidget({
    id: 'policyroutes',
    name: 'policyroutes',
    description: 'test policyroutes',
    initialWidth: 800,
    initialHeight: 800,
    color : 'red',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    hasStyle : false,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(5),
        Stage.GenericConfig.PAGE_SIZE_CONFIG(10),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('number'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(true)
    ],

    fetchUrl:'[manager]/policyroutes?[params]',

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
            return(
                <DataTable    fetchData={this.fetchGridData.bind(this,toolbox)}
                              searchable ={true}
                              pageSize={widget.configuration.pageSize}
                              totalSize={_data.total} >
                    <DataTable.Action>
                        <UpdateButton toolbox={toolbox} data={data}/>
                    </DataTable.Action>
                    <DataTable.Column label="序号"  width="6%" />
                    <DataTable.Column label="当前"  width="6%" />
                    <DataTable.Column label="用户组"  width="6%"/>
                    <DataTable.Column label="源接口"  width="6%"/>
                    <DataTable.Column label="VLAN"  width="6%"/>
                    <DataTable.Column label="TTL"  width="6%"/>
                    <DataTable.Column label="源地址/端口"  width="6%"/>
                    <DataTable.Column label="目标地址/端口"  width="6%"/>
                    <DataTable.Column label="协议"  width="6%"/>
                    <DataTable.Column label="应用"  width="6%"/>
                    <DataTable.Column label="DSCP"  width="6%"/>
                    <DataTable.Column label="用户类型"  width="6%"/>
                    <DataTable.Column label="动作"  width="6%"/>
                    <DataTable.Column label="目标线路"  width="6%"/>
                    <DataTable.Column label="下一跳"  width="6%"/>
                    {/*<DataTable.Column label="匹配次数"  width="6%"/>*/}
                    {/*<DataTable.Column label="备注"  width="6%"/>*/}
                    <DataTable.Column label="状态"  width="10%"/>
                    {_data.items.map((item)=>{return(
                        <DataTable.Row>
                            <DataTable.Data >{item.number}</DataTable.Data>
                            <DataTable.Data >{item.current}</DataTable.Data>
                            <DataTable.Data >{item.user_group}</DataTable.Data>
                            <DataTable.Data >{item.source_interface}</DataTable.Data>
                            <DataTable.Data >{item.vlan}</DataTable.Data>
                            <DataTable.Data >{item.ttl}</DataTable.Data>
                            <DataTable.Data >{item.source_addr_port}</DataTable.Data>
                            <DataTable.Data >{item.to_addr_port}</DataTable.Data>
                            <DataTable.Data >{item.protocol}</DataTable.Data>
                            <DataTable.Data >{item.application}</DataTable.Data>
                            <DataTable.Data >{item.dscp}</DataTable.Data>
                            <DataTable.Data >{item.user_type}</DataTable.Data>
                            <DataTable.Data >{item.action}</DataTable.Data>
                            <DataTable.Data >{item.to_route}</DataTable.Data>
                            <DataTable.Data >{item.next_jump}</DataTable.Data>
                            {/*<DataTable.Data >{item.match_times}</DataTable.Data>*/}
                            {/*<DataTable.Data >{item.remark}</DataTable.Data>*/}
                            <DataTable.Data >{item.state}</DataTable.Data>
                        </DataTable.Row>
                    )})}
            </DataTable>
            )
        // }
    }

});

