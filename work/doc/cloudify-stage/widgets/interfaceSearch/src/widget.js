Stage.defineWidget({
    id: 'interfaceSearch',
    name: 'interfaceSearch',
    description: 'test interfaceSearch',
    initialWidth: 800,
    initialHeight: 800,
    color : 'green',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(1),
    ],

    fetchUrl:'[manager]/interface_search?_include=number,line_name,network_card,state,ip,gateway,mtu,vlan,dns_traction_failure_rate,inflow_rate,outflow_rate,connects,annotate,licence_id[params]',

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
        const {DataTable,Button} = Stage.Basic;
        return (
            <div>
                <DataTable  noDataAvailable={data.length ==0}>
                    <DataTable.Action>
                        <Button content='Update' color="teal"  icon='redo' labelPosition='left'
                                onClick={()=>{this.doExecute(toolbox,"interfacesearch","install")}}/>
                    </DataTable.Action>
                    <DataTable.Column label="序号"  width="6%" />
                    <DataTable.Column label="线路名称"  width="8%" />
                    <DataTable.Column label="网卡"  width="8%"/>
                    <DataTable.Column label="状态"  width="8%"/>
                    <DataTable.Column label="IP地址"  width="8%"/>
                    <DataTable.Column label="网关地址"  width="8%"/>
                    <DataTable.Column label="MTU"  width="8%"/>
                    <DataTable.Column label="VLAN"  width="8%"/>
                    <DataTable.Column label="DNS牵引/失败率"  width="8%"/>
                    <DataTable.Column label="流入速率"  width="8%"/>
                    <DataTable.Column label="流出速率"  width="8%"/>
                    <DataTable.Column label="连接数"  width="6%"/>
                    <DataTable.Column label="备注"  width="6%"/>
                    <DataTable.Column label="网关ID"  width="10%"/>
                    {data.map((item)=>{return(
                        <DataTable.Row>
                            <DataTable.Data>{item.number}</DataTable.Data>
                            <DataTable.Data>{item.line_name}</DataTable.Data>
                            <DataTable.Data>{item.network_card}</DataTable.Data>
                            <DataTable.Data>{item.state}</DataTable.Data>
                            <DataTable.Data>{item.ip}</DataTable.Data>
                            <DataTable.Data>{item.gateway}</DataTable.Data>
                            <DataTable.Data>{item.mtu}</DataTable.Data>
                            <DataTable.Data>{item.vlan}</DataTable.Data>
                            <DataTable.Data>{item.dns_traction_failure_rate}</DataTable.Data>
                            <DataTable.Data>{item.inflow_rate}</DataTable.Data>
                            <DataTable.Data>{item.outflow_rate}</DataTable.Data>
                            <DataTable.Data>{item.connects}</DataTable.Data>
                            <DataTable.Data>{item.annotate}</DataTable.Data>
                            <DataTable.Data>{item.licence_id}</DataTable.Data>

                        </DataTable.Row>
                    )})}
                </DataTable>
            </div>
        )
    }
});

