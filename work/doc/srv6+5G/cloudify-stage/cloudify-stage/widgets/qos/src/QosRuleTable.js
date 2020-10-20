import DeploymentActionButtons from "../../deploymentActionButtons/src/DeploymentActionButtons";

/**
 * Created by zcn on 04/09/2019.
 */

export default class QosRuleTable extends React.Component {

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
            deploymentPrefix:'qos',
            inputField:'qos_rule_name',
            blueprint: {},
            deployment:{},
            error: null,
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
        this.props.toolbox.getEventBus().on('qos:refresh',this._refreshData,this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('qos:refresh',this._refreshData);
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

    _dirIntoCn(dir){
        switch(dir){
            case 'both':
                return '双向';
                break;
            case 'in':
                return '下行';
                break;
            case 'out':
                return '上行';
                break;
            default:
                return '方向错误';
                break;
        }
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

    onUpdateQosRule(item){
        let deploymentId = this.state.deploymentPrefix+item.id;
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`);
        deployment.then((result)=>{
            _.unset(result,['inputs',this.state.inputField]);
            this.setState({deployment:result});
            this.setState({modalType: QosRuleTable.EDIT_ACTION, showModal: true});
        })
    }

    _deleteDeployment() {
    // _forceDeleteDeployment() {
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

    deleteQosRuleConfirm(item){
        this.setState({
            confirmDelete : true,
            item: item,
            force: false
        });
    }
    _deleteQosRule(){
        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        let deploymentId = this.state.deploymentPrefix+this.state.item.id;

        this.setState({loading:true});
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`);
        deployment.then((result)=>{
            this.setState({deployment:result});
            this.setState({confirmDelete: false});
            let executePromises = deploymentActions.doExecute({id: deploymentId}, {name: 'uninstall'}, {}, false)
                // .then(() => this.waitForUserGroupIsDeleted())
            return executePromises.then((results) => {
                return executionActions.waitUntilFinished(results.id, 10000)
                    .then((uninstallation) => {
                        if(uninstallation[0].status === 'terminated'){
                            this.props.toolbox.getEventBus().trigger('qos:refresh');
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
        let tableName = 'QosRuleTable';

        return (
            <div>
                <DataTable
                    fetchData={this.fetchGridData.bind(this)}
                    totalSize={this.props.data.total}
                    pageSize={this.props.widget.configuration.pageSize}
                    selectable={true}
                    className={tableName}>
                    <DataTable.Action>
                        <Button content='新建QoS规则' icon='add' labelPosition='left' color='green'
                                onClick={(event)=>{this.onCreateDeployment('bp_qos')}}/>
                        {/*<Button content='一键同步' icon='group' labelPosition='left' color='green'*/}
                        {/*        onClick={(event)=>{this.onCreateDeployment('boss')}}/>*/}
                    </DataTable.Action>
                    <DataTable.Column label="qos规则名字" name="id"  width="5%"/>
                    <DataTable.Column label="wan线路" width="5%"/>
                    <DataTable.Column label="方向" width="5%"/>
                    <DataTable.Column label="内网限速" width="5%"/>
                    <DataTable.Column label="TCP连接数" width="5%"/>
                    <DataTable.Column label="UDP连接数" width="5%"/>
                    <DataTable.Column label="总连接数" width="5%"/>
                    <DataTable.Column label="网关列表"/>
                    <DataTable.Column width="10%"/>
                    {data.map((item)=>{return(
                    <DataTable.Row id={`${tableName}_${item.id}`} key={item.id}>
                        <DataTable.Data>{item.id}</DataTable.Data>
                        <DataTable.Data>{item.wan_line}</DataTable.Data>
                        <DataTable.Data>
                            {this._dirIntoCn(item.direction)}
                        </DataTable.Data>
                        <DataTable.Data>{item.ip_rate}</DataTable.Data>
                        <DataTable.Data>{item.max_tcp_session}</DataTable.Data>
                        <DataTable.Data>{item.max_udp_session}</DataTable.Data>
                        <DataTable.Data>{item.max_total_session}</DataTable.Data>
                        <DataTable.Data><p style={{wordBreak:'break-all',width:'100%'}}>{item.gateway_list}</p></DataTable.Data>
                        <DataTable.Data className="center aligned rowActions">
                            <i className="redo icon link bordered" title="更新"
                               // onClick={this._showModal.bind(this, UserGroupTable.EDIT_ACTION)}></i>
                               onClick={(event)=>{event.stopPropagation();this.onUpdateQosRule(item)}}></i>
                            <i className="trash icon link bordered" title="删除"
                               onClick={(event)=>{event.stopPropagation();this.deleteQosRuleConfirm(item)}}></i>
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
                <UpdateDeploymentNoIdModal open={this._isShowModal(QosRuleTable.EDIT_ACTION)}
                                       deployment={this.state.deployment}
                                       inputField={this.state.inputField}
                                       onHide={this._hideModal.bind(this)}
                                       toolbox={this.props.toolbox}/>
                <DeleteConfirm resourceName={`QoS规则 ${_.get(this.state.item, 'id', '')}`}
                               force={this.state.force}
                               open={this.state.confirmDelete}
                               loading={this.state.loading}
                               onConfirm={this._deleteQosRule.bind(this)}
                               onCancel={() => this.setState({confirmDelete : false})}
                               onForceChange={this._handleForceChange.bind(this)} />
            </div>
        )
    }
}