/**
 * Created by woody on 30/08/2019.
 */
import UpdateButton from './UpdateButton';
Stage.defineWidget({
    id: 'lineAmount',
    name: '链路查询',
    description: 'test',
    initialWidth: 12,
    initialHeight: 25,
    color : 'red',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    hasStyle: false,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(30),
        Stage.GenericConfig.PAGE_SIZE_CONFIG(10),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('gateway'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(false)
    ],



    fetchData(widget,toolbox,params) {
        return toolbox.getManager().doGet('/lineamout',params)
    },

    fetchParams: (widget, toolbox) =>
        toolbox.getContext().getValue('onlyMyResources') ? {created_by: toolbox.getManager().getCurrentUsername()} : {},


    // doExecute(toolbox,force = false, dry_run = false, queue = false, scheduled_time = undefined) {
    // return( alert("正在刷新，请稍后……"),
    //     this.click=true,
    //     toolbox.getManager().doPost('/executions',null,{
    //     'deployment_id': 'lineAmount',
    //     'workflow_id' : 'install',
    //     dry_run,
    //     force,
    //     queue,
    //     scheduled_time,})),
    //     setInterval(()=>{this.click=false;},15000)},


    _processData(data) {
        return Object.assign({}, data, {
            total: _.get(data, 'metadata.pagination.total', 0)
        });
    },

    // _refreshData() {
    //     this.props.toolbox.refresh();
    // },

    fetchGridData(toolbox,fetchParams) {
        return toolbox.refresh(fetchParams);
    },

    render: function(widget,datas,error,toolbox) {
        if (_.isEmpty(datas)) {
            return <Stage.Basic.Loading/>;
        }
        let {DataTable} = Stage.Basic;
        let data  = this._processData(datas);
        return (
                 <DataTable fetchData={this.fetchGridData.bind(this,toolbox)}
                            selectable = {true}
                            searchable ={true}
                            className=""
                            pageSize={widget.configuration.pageSize}
                            totalSize={data.total}
                            sizeMultiplier={5} >

                            <DataTable.Action>
                                <UpdateButton toolbox={toolbox}/>
                            </DataTable.Action>

                         <DataTable.Column label="网关" name="gateway" width="8%"/>
                         <DataTable.Column label="名称" name="sys_name" width="8%"/>
                         <DataTable.Column label="线路" name="name" width="8%"/>
                         <DataTable.Column label="状态" name="state" width="8%"/>
                         <DataTable.Column label="流入pps" name="inpps" width="12%"/>
                         <DataTable.Column label="流出pps" name="outpps" width="12%"/>
                         <DataTable.Column label="流入bps" name="inbps" width="12%"/>
                         <DataTable.Column label="流出bps" name="outbps" width="12%"/>
                         <DataTable.Column label="更新时间" name="update_time" width="12%"/>



                            {data.items.map((item)=>  {return   <DataTable.RowExpandable key="prestashop" expanded={false}>
                            <DataTable.Row selected={false} >
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.gateway}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.sys_name}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.name}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.state}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.inpps}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.outpps}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.inbps}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.outbps}</p></DataTable.Data>
                                                                 <DataTable.Data><p style={{color: item.state=='offline'?'#f00':'#000'}}>{item.update_time}</p></DataTable.Data>

                                </DataTable.Row>
                                           </DataTable.RowExpandable>
                                            })}
                    </DataTable>
                );
            }
        }
    );
