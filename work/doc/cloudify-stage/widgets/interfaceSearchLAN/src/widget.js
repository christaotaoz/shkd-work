Stage.defineWidget({
    id: 'interfaceSearchLAN',
    name: 'interfaceSearchLAN',
    description: 'test interfaceSearchLAN',
    initialWidth: 800,
    initialHeight: 800,
    color : 'purple',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(1),
    ],
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
// fetchUrl: {
//     nodes: '[manager]/nodes?_include=id,deployment_id,blueprint_id,type,type_hierarchy,number_of_instances,host_id,relationships,created_by[params:blueprint_id,deployment_id,gridParams]',
//     deployments: '[manager]/deployments?_include=id,groups[params:blueprint_id,id]'
// }
// // ...
// render: function(widget, data, error, toolbox) {
//     let nodes = data.nodes.items;
//     let deployments = data.nodeInstances.items;
//     //...
// }
    fetchUrl:{
        interface_search_lan:'[manager]/interface_search_lan?_include=number,interface_name,network_card,state,ip,network_mask,mtu,vlan,inflow_rate,outflow_rate,licence_id[params]',
        // interface_search:'[manager]/interface_search?_include=number,line_name,network_card,state,ip,gateway,mtu,vlan,dns_traction_failure_rate,inflow_rate,outflow_rate,connects,annotate[params]'
    },

    render: function(widget,data,error,toolbox) {
        const {DataTable,Button} = Stage.Basic;
        let interface_search_lan = data.interface_search_lan.items;
        let interface_search = data.interface_search_lan;
        // console.log(data);
        return (
            <div>
                <DataTable  noDataAvailable={data.interface_search_lan.length ==0}>
                    <DataTable.Action>
                        <Button content='Update' color="teal"  icon='redo' labelPosition='left'
                                onClick={()=>{this.doExecute(toolbox,"interfacesearch","install")}}/>
                    </DataTable.Action>
                    <DataTable.Column label="序号"  width="10%" />
                    <DataTable.Column label="接口名称"  width="10%" />
                    <DataTable.Column label="物理网卡"  width="10%"/>
                    <DataTable.Column label="状态"  width="10%"/>
                    <DataTable.Column label="IP地址"  width="10%"/>
                    <DataTable.Column label="网络掩码"  width="10%"/>
                    <DataTable.Column label="MTU"  width="10%"/>
                    <DataTable.Column label="VLAN"  width="10%"/>
                    <DataTable.Column label="流入速率"  width="10%"/>
                    <DataTable.Column label="流出速率"  width="10%"/>
                    <DataTable.Column label="网关ID"  width="10%"/>

                    {data.interface_search_lan.map((item)=>{return(
                        <DataTable.Row>
                            <DataTable.Data>{item.number}</DataTable.Data>
                            <DataTable.Data>{item.interface_name}</DataTable.Data>
                            <DataTable.Data>{item.network_card}</DataTable.Data>
                            <DataTable.Data>{item.state}</DataTable.Data>
                            <DataTable.Data>{item.ip}</DataTable.Data>
                            <DataTable.Data>{item.network_mask}</DataTable.Data>
                            <DataTable.Data>{item.mtu}</DataTable.Data>
                            <DataTable.Data>{item.vlan}</DataTable.Data>
                            <DataTable.Data>{item.inflow_rate}</DataTable.Data>
                            <DataTable.Data>{item.outflow_rate}</DataTable.Data>
                            <DataTable.Data>{item.licence_id}</DataTable.Data>
                        </DataTable.Row>
                    )})}
                 </DataTable>
            </div>
        )
    }
});

