import DeploymentActionButtons from "../../deploymentActionButtons/src/DeploymentActionButtons";

/**
 * Created by zcn on 04/09/2019.
 */

export default class UserGroupTable extends React.Component {

    static EDIT_ACTION = 'edit';
    static DELETE_ACTION = 'delete';
    static WORKFLOW_ACTION = 'workflow';

    constructor(props,context) {
        super(props,context);

        this.state = {
            showDeploymentModal: false,
            showModal: false,
            modalType: '',
            loading: false,
            blueprint: {},
            deployment:{},
            error: null,
            deploymentPrefix:'ug',
            inputField:'user_group_name',
            item: {id: ''},
            confirmDelete:false,
            force: false

        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.data, nextProps.data);
    }
    _refreshData() {
        this.props.toolbox.refresh();
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('gatewayUserGroup:refresh',this._refreshData,this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('gatewayUserGroup:refresh',this._refreshData);
    }

    _showModal(type) {
        this.setState({modalType: type, showModal: true});
    }

    _hideModal() {
        this.setState({showModal: false});
    }

    _isShowModal(type) {
        return this.state.modalType === type && this.state.showModal;
    }

    fetchGridData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }

    rateTrans(rate){
        if (rate ==='0')
            return '不限';
        else
            return rate;
    }
    
    onlineBehavior(agpname,app){
        let appArr = [];
        let behArr = [];
        let behList = '';
        switch(agpname){
            case 'high_speed_user':
                behList = '可以上网、看视频，不能游戏';
                break;
            case 'low_speed_user':
                behList = '可以上网，不能游戏、看视频';
                break;
            case 'unlimited':
                behList = '不限';
                break;
            default:
                appArr = app.split(',');
                appArr.forEach(v=>{
                    if(v === 'game') 
                        behArr.push('不能游戏');
                    else if(v === 'video')
                        behArr.push('不能看视频');
                    else if(v === 'mobile')
                        behArr.push('不能打电话');
                    else if(v === 'webmail')
                        behArr.push('不能发邮件');
                })
                behList = behArr.join(',')
                break;
        }
        return behList;     
    }

    onCreateDeployment(bpid){
        // Get the full blueprint data (including plan for inputs)
        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        actions.doGetFullBlueprintData({id: bpid}).then((blueprint)=>{
            this.setState({error: null, blueprint, showDeploymentModal: true});
        }).catch((err)=> {
            this.setState({error: err.message});
        });
    }
    _hideDeploymentModal() {
        this.setState({showDeploymentModal: false});
    }

    onUpdateUserGroup(item){
        let deploymentId = this.state.deploymentPrefix+item.id;
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`);
        deployment.then((result)=>{
            _.unset(result,['inputs',this.state.inputField]);
            this.setState({deployment:result});
            this.setState({modalType: UserGroupTable.EDIT_ACTION, showModal: true});
        })
    }

    _deleteDeployment() {
        this._hideModal();

        if (!this.state.deployment) {
            this._setError('删除部署失败');
            return;
        }

        this.props.toolbox.loading(true);

        var actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        actions.doDelete(this.state.deployment).then(() => {
            this._setError(null);
            this.props.toolbox.getEventBus().trigger('deployments:refresh');
            this.props.toolbox.loading(false);
        }).catch((err) => {
            this._setError(err.message);
            this.props.toolbox.loading(false);
        });
    }

    deleteUserGroupConfirm(item){
        this.setState({
            confirmDelete : true,
            item: item,
            force: false
        });
    }
    _deleteUserGroup(){
        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        let deploymentId = this.state.deploymentPrefix+this.state.item.id;
        // this.props.toolbox.loading(true);
        this.setState({loading:true});
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`);
        deployment.then((result)=>{
            this.setState({deployment:result});
            this.setState({confirmDelete: false});
            let executePromises = deploymentActions.doExecute({id: deploymentId}, {name: 'uninstall'}, {}, false)
            return executePromises.then((results) => {
                return executionActions.waitUntilFinished(results.id, 2000)
                    .then((uninstallation) => {
                        if(uninstallation[0].status === 'terminated'){
                            this.props.toolbox.getEventBus().trigger('gatewayUserGroup:refresh');
                            this._deleteDeployment();
                            this.setState({loading:false});
                        }
                    })
            })
        })
    }

    _setError(errorMessage) {
        this.setState({error: errorMessage});
    }

    _handleForceChange(event, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    render () {
        const {DataTable,Button} = Stage.Basic;
        let {DeployAndInstallBlueprintModal,UpdateDeploymentNoIdModal, DeleteConfirm} = Stage.Common;
        let data= this.props.data.items;
        let tableName = 'userGroupTable';

        return (
            <div>
                <DataTable
                    fetchData={this.fetchGridData.bind(this)}
                    totalSize={this.props.data.total}
                    pageSize={this.props.widget.configuration.pageSize}
                    selectable={true}
                    className={tableName}>
                    <DataTable.Action>
                        <Button content='无限制用户组' icon='add' labelPosition='left' color='green'
                                onClick={(event)=>{this.onCreateDeployment('bp_user_group_boss')}}/>
                        <Button content='高速上网用户组' icon='add' labelPosition='left' color='green'
                                onClick={(event)=>{this.onCreateDeployment('bp_user_group_high_speed')}}/>
                        <Button content='低速上网用户组' icon='add' labelPosition='left' color='green'
                                onClick={(event)=>{this.onCreateDeployment('bp_user_group_low_speed')}}/>
                        <Button content='自定义用户组' icon='add' labelPosition='left' color='green'
                                onClick={(event)=>{this.onCreateDeployment('bp_user_group_customize')}}/>
                    </DataTable.Action>
                    <DataTable.Column label="用户组名字" name='id' width="5%"/>
                    <DataTable.Column label="上行最大速率" width="2%"/>
                    <DataTable.Column label="下行最大速率" width="2%"/>
                    <DataTable.Column label="DNS服务器" width="6%"/>
                    <DataTable.Column label="上网行为" width="15%"/>
                    <DataTable.Column label="网关列表" />
                    <DataTable.Column width="10%"/>
                    {data.map((item)=>{return(
                    <DataTable.Row id={`${tableName}_${item.id}`} key={item.id}>
                        <DataTable.Data>{item.id}</DataTable.Data>
                        <DataTable.Data>
                            {this.rateTrans(item.max_uplink_rate)}
                        </DataTable.Data>
                        <DataTable.Data>
                            {this.rateTrans(item.max_downlink_rate)}
                        </DataTable.Data>
                        <DataTable.Data>{item.dns_server}</DataTable.Data>
                        <DataTable.Data>
                            {this.onlineBehavior(item.agpname,item.applist)}
                        </DataTable.Data>
                        <DataTable.Data><p style={{wordBreak:'break-all',width:'100%'}}>{item.gateway_list}</p></DataTable.Data>
                        <DataTable.Data className="center aligned rowActions">
                            <i className="redo icon link bordered" title="更新"
                               onClick={(event)=>{event.stopPropagation();this.onUpdateUserGroup(item)}}></i>
                            <i className="trash icon link bordered" title="删除"
                               onClick={(event)=>{event.stopPropagation();this.deleteUserGroupConfirm(item)}}></i>
                        </DataTable.Data>
                    </DataTable.Row>
                )})}
                </DataTable>
                <DeployAndInstallBlueprintModal open={this.state.showDeploymentModal}
                                      blueprint={this.state.blueprint}
                                      onHide={this._hideDeploymentModal.bind(this)}
                                      toolbox={this.props.toolbox}
                                      deploymentPrefix={this.state.deploymentPrefix}
                                      inputField={this.state.inputField}/>
                <UpdateDeploymentNoIdModal open={this._isShowModal(UserGroupTable.EDIT_ACTION)}
                                       deployment={this.state.deployment}
                                       inputField={this.state.inputField}
                                       onHide={this._hideModal.bind(this)}
                                       toolbox={this.props.toolbox}/>
                <DeleteConfirm resourceName={`用户组 ${_.get(this.state.item, 'id', '')}`}
                               force={this.state.force}
                               open={this.state.confirmDelete}
                               loading={this.state.loading}
                               onConfirm={this._deleteUserGroup.bind(this)}
                               onCancel={() => this.setState({confirmDelete : false})}
                               onForceChange={this._handleForceChange.bind(this)} />
            </div>
        )
    }
}