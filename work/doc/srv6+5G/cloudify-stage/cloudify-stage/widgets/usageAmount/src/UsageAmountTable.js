/**
 * Created by woody on 25/08/2019.
 */
import UpdateButton from "./UpdateButton";
import UserButton from "./UserButton"
export default class UsageAmountTable extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectable:true,
            searchable:true,

        };
    }


    _selectUser(userName) {
        let selecteduserName = this.props.toolbox.getContext().getValue('userName');
        this.props.toolbox.getContext().setValue('userName', userName === selecteduserName ? null : userName);
    }

    fetchGridData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }



    render(){
        const {DataTable} = Stage.Basic;
        let toolbox = this.props.toolbox;
        let data = this.props.data;

        return(
            <DataTable      fetchData={this.fetchGridData.bind(this)}
                            selectable = {this.state.selectable}
                            searchable ={this.state.searchable}
                            pageSize={this.props.widget.configuration.pageSize}
                            totalSize={this.props.data.total}
                            className="UsageAmoutTable" >

            <DataTable.Action>
                   <UpdateButton toolbox={toolbox}/>
            </DataTable.Action>

            <DataTable.Column label="账号" name="id" width="8%"/>
            <DataTable.Column label="登录ip" name="login_ip" width="12%"/>
             <DataTable.Column label="登录时长" name="hours_of_use" width="12%"/>
             <DataTable.Column label="上传流量" name="upload_traffic" width="12%"/>
             <DataTable.Column label="下载流量" name="download_traffic" width="12%"/>
             <DataTable.Column label="总流量" name="all_traffic" width="12%"/>
             <DataTable.Column label="更新时间" name="update_time" />
             <DataTable.Column label="操作" width="12%"/>

            {data.items.map((item)=>  {return (
                                <DataTable.RowExpandable key={item.id} expanded={item.isSelected} >
                                    <DataTable.Row  key={item.id} selected={item.isSelected} onClick={this._selectUser.bind(this,item.id)}>
                                                         <DataTable.Data>{item.id}</DataTable.Data>
                                                         <DataTable.Data>{item.login_ip}</DataTable.Data>
                                                         <DataTable.Data>{item.hours_of_use}</DataTable.Data>
                                                         <DataTable.Data>{item.upload_traffic}MB</DataTable.Data>
                                                         <DataTable.Data>{item.download_traffic}MB</DataTable.Data>
                                                         <DataTable.Data>{item.all_traffic}MB</DataTable.Data>
                                                         <DataTable.Data>{item.update_time}</DataTable.Data>
                                                        <DataTable.Data >
                                                           <UserButton data={item} toolbox={toolbox}/>
                                                        </DataTable.Data>
                                    </DataTable.Row>
                                    <DataTable.DataExpandable>
                                        <DataTable>
                                            <DataTable.Column label="创建时间" name="create_time" width="12%"/>
                                            <DataTable.Column label="NAS IP" name="nas_ip" width="12%"/>
                                            <DataTable.Column label="允许登录时间段" name="login_time" width="12%"/>
                                            <DataTable.Column label="允许每月在线时间" name="Max-Monthly-Session" width="12%"/>
                                            <DataTable.Column label="允许最大在线时间" name="Max_all_session" width="12%"/>
                                            <DataTable.Column label="允许最大使用流量" name="Max_Monthly_Traffic" width="12%"/>
                                            <DataTable.Column label="用户组" name="user_group" width="12%"/>
                                                <DataTable.Row key={item.id}  onClick={()=>this.onRowClick(item)}>
                                                    <DataTable.Data>{item.create_time}</DataTable.Data>
                                                    <DataTable.Data>{item.nas_ip}</DataTable.Data>
                                                    <DataTable.Data></DataTable.Data>
                                                    <DataTable.Data></DataTable.Data>
                                                    <DataTable.Data></DataTable.Data>
                                                    <DataTable.Data></DataTable.Data>
                                                    <DataTable.Data>{item.user_group}</DataTable.Data>
                                                </DataTable.Row>
                                        </DataTable>
                                    </DataTable.DataExpandable>
                               </DataTable.RowExpandable>
                                                )
                                        }
                            )
                        }
            </DataTable>
            )
        }
}

