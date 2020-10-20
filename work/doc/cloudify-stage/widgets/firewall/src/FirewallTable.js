/**
 * Created by zhengqin on 08/25/2019.
 */

export default class FirewallTable extends React.Component {
    static EDIT_ACTION = 'edit';
    static DELETE_ACTION = 'delete';
    static WORKFLOW_ACTION = 'workflow';

    static EMPTY_WORKFLOW = {name: '', parameters: []};

    constructor(props, context) {
        super(props, context);

        this.state = {
            showDeploymentModal: false,
            showModal: false,
            modalType: '',
            loading: false,
            blueprint: {},
            deployment: {},
            deploymentPrefix:'firewall',
            inputField:'policy_id',
            workflow: FirewallTable.EMPTY_WORKFLOW,
            error: null,
            confirmDelete: false,
            force: false,
            item: {plicy_number: ''},
        }
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('firewall:refresh', this._refreshData, this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('firewall:refresh', this._refreshData);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.data, nextProps.data);
    }

    fetchGridData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }

    onCreateDeployment(bpid) {
        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        actions.doGetFullBlueprintData({id: bpid}).then((blueprint) => {
            this.setState({error: null, blueprint, showDeploymentModal: true});
        }).catch((err) => {
            this.setState({error: err.message});
        });
    }

    onUpdateDeployment(item){
        let deploymentId = this.state.deploymentPrefix+item.policy_number;
        console.log(deploymentId);
        let deployment = this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`);
        deployment.then((result)=> {
            _.unset(result,['inputs',this.state.inputField]);
            this.setState({error: null, deployment:result, showModal: true,modalType: FirewallTable.EDIT_ACTION});
        }).catch((err) => {
            this.setState({error: err.message});
        });
        console.log(this.state.deployment);
    }

    _isShowModal(type) {
        return this.state.modalType === type && this.state.showModal;
    }
    _hideDeploymentModal() {
        this.setState({showDeploymentModal: false});
    }

    _showModal(type) {
        this.setState({modalType: type, showModal: true});
    }

    _hideModal() {
        this.setState({showModal: false});
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

    deleteFirewallConfirm(item){
        this.setState({
            confirmDelete : true,
            item: item,
            force: false
        });
    }

    _deleteFirewall(){
        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        let deploymentId = this.state.deploymentPrefix+this.state.item.policy_number;

        this.setState({loading:true});
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`);
        deployment.then((result)=>{
            this.setState({deployment:result});
            this.setState({confirmDelete: false});
            let executePromises = deploymentActions.doExecute({id: deploymentId}, {name: 'uninstall'}, {}, false)
            return executePromises.then((results) => {
                return executionActions.waitUntilFinished(results.id, 10000)
                })
                .then(() => {
                    this.props.toolbox.getEventBus().trigger('firewall:refresh');
                    this._deleteDeployment();
                    this.setState({loading:false});
                })
        })

    }

    _setError(errorMessage) {
        this.setState({error: errorMessage});
    }

    _handleForceChange(event, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    render(){
        const {DataTable,Button} = Stage.Basic;
        let {DeployAndInstallBlueprintModal,UpdateDeploymentNoIdModal,DeleteConfirm} = Stage.Common;
        let tableName = 'firewall';
        return (
            <div>
                <DataTable fetchData={this.fetchGridData.bind(this)}
                       totalSize={this.props.data.total}
                       pageSize={this.props.widget.configuration.pageSize}
                       sortColumn={this.props.widget.configuration.sortColumn}
                       sortAscending={this.props.widget.configuration.sortAscending}
                       selectable={true}
                       className={tableName}>
                    <DataTable.Action>
                        <Button content='新增' icon='plus' labelPosition='left' color = 'green' onClick={(event)=>{this.onCreateDeployment('bp_firewall')} }/>
                    </DataTable.Action>
                    <DataTable.Column label="策略编号" name='policy_number' width="6%" />
                    <DataTable.Column label="内网IP"  width="8%" />
                    <DataTable.Column label="内网端口"  width="8%"/>
                    <DataTable.Column label="外网IP"  width="8%"/>
                    <DataTable.Column label="外网端口"  width="8%"/>
                    <DataTable.Column label="方向"  width="8%"/>
                    <DataTable.Column label="协议"  width="8%"/>
                    <DataTable.Column label="动作"  width="8%"/>
                    <DataTable.Column label="网关列表"/>
                    <DataTable.Column width="10%"/>
                    {
                        this.props.data.items.map((item)=>{
                            return (
                                <DataTable.Row  key={item.policy_number}>
                                    <DataTable.Data>{item.policy_number}</DataTable.Data>
                                    <DataTable.Data>{item.internal_ip}</DataTable.Data>
                                    <DataTable.Data>{item.internal_port}</DataTable.Data>
                                    <DataTable.Data>{item.internet_ip}</DataTable.Data>
                                    <DataTable.Data>{item.internet_port}</DataTable.Data>
                                    <DataTable.Data>{item.direction}</DataTable.Data>
                                    <DataTable.Data>{item.protocol}</DataTable.Data>
                                    <DataTable.Data>{item.actions}</DataTable.Data>
                                    <DataTable.Data><p style={{wordBreak:'break-all',width:'100%'}}>{item.gateway_list}</p></DataTable.Data>
                                    <DataTable.Data className="center aligned rowActions">
                                        <i className="redo icon link bordered" title="更新"
                                           onClick={(event)=>{this.onUpdateDeployment(item)}}></i>
                                        <i className="trash icon link bordered" title="删除"
                                           onClick={(event)=>{this.deleteFirewallConfirm(item)}}></i>
                                    </DataTable.Data>
                                </DataTable.Row>
                            );
                        })
                    }
                </DataTable>
                <DeployAndInstallBlueprintModal open={this.state.showDeploymentModal}
                                      blueprint={this.state.blueprint}
                                      onHide={this._hideDeploymentModal.bind(this)}
                                      toolbox={this.props.toolbox}
                                      deploymentPrefix={this.state.deploymentPrefix}
                                      inputField={this.state.inputField}/>
                <UpdateDeploymentNoIdModal
                    open={this._isShowModal(FirewallTable.EDIT_ACTION)}
                    deployment={this.state.deployment}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}
                    inputField={this.state.inputField}/>
                <DeleteConfirm resourceName={`防火墙策略 ${_.get(this.state.item, 'policy_number', '')}`}
                               force={this.state.force}
                               open={this.state.confirmDelete}
                               loading={this.state.loading}
                               onConfirm={this._deleteFirewall.bind(this)}
                               onCancel={() => this.setState({confirmDelete : false})}
                               onForceChange={this._handleForceChange.bind(this)} />
            </div>
        );
    }
}