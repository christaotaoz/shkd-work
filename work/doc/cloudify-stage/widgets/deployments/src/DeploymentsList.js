/**
 * Created by kinneretzin on 18/10/2016.
 */

import MenuAction from './MenuAction';
import DeploymentsSegment from './DeploymentsSegment';
import DeploymentsTable from './DeploymentsTable';

export default class DeploymentsList extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
            error: null,
            modalType: '',
            showModal: false,
            deployment: {},
            deploymentUpdateId: null,
            workflow: {}
        }
    }

    static DEPLOYMENT_UPDATE_DETAILS_MODAL = 'deploymentUpdateDetailsModal';

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.data, nextProps.data);
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('deployments:refresh',this._refreshData,this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('deployments:refresh',this._refreshData);
    }

    _selectDeployment(item) {
        if (this.props.widget.configuration.clickToDrillDown) {
            this.props.toolbox.drillDown(this.props.widget,'deployment',{deploymentId: item.id}, item.id);
        } else {
            var oldSelectedDeploymentId = this.props.toolbox.getContext().getValue('deploymentId');
            this.props.toolbox.getContext().setValue('deploymentId',item.id === oldSelectedDeploymentId ? null : item.id);
        }
    }

    _showLogs(deploymentId, executionId) {
        this.props.toolbox.drillDown(this.props.widget,'logs',{deploymentId, executionId}, `Execution Logs - ${executionId}`);
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

    _forceDeleteDeployment() {
        this._hideModal();

        if (!this.state.deployment) {
            this._setError('删除部署失败');
            return;
        }

        this.props.toolbox.loading(true);

        var actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        actions.doForceDelete(this.state.deployment).then(() => {
            this._setError(null);
            this.props.toolbox.getEventBus().trigger('deployments:refresh');
            this.props.toolbox.loading(false);
        }).catch((err) => {
            this._setError(err.message);
            this.props.toolbox.loading(false);
        });
    }

    actOnExecution(execution, action) {
        let actions = new Stage.Common.ExecutionActions(this.props.toolbox);
        actions.doAct(execution, action).then(() => {
            this._setError(null);
            this.props.toolbox.getEventBus().trigger('deployments:refresh');
            this.props.toolbox.getEventBus().trigger('executions:refresh');
        }).catch((err) => {
            this._setError(err.message);
        });
    }

    _setDeploymentVisibility(deploymentId, visibility) {
        var actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        this.props.toolbox.loading(true);
        actions.doSetVisibility(deploymentId, visibility)
            .then(()=> {
                this.props.toolbox.loading(false);
                this.props.toolbox.refresh();
            })
            .catch((err)=>{
                this.props.toolbox.loading(false);
                this.setState({error: err.message});
            });
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    _showModal(value, deployment, workflow) {
        this.setState({deployment, workflow:workflow?workflow:{},
                       modalType: workflow?MenuAction.WORKFLOW_ACTION:value, showModal: true});
    }

    _showDeploymentUpdateDetailsModal(deploymentUpdateId) {
        this.setState({deploymentUpdateId, modalType: DeploymentsList.DEPLOYMENT_UPDATE_DETAILS_MODAL, showModal: true});
    }

    _hideModal() {
        this.setState({showModal: false});
    }

    _setError(errorMessage) {
        this.setState({error: errorMessage});
    }

    fetchData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }

    render() {
        const NO_DATA_MESSAGE = '当前没有部署。 点击 "创建部署" 创建。';
        let {ErrorMessage, Confirm} = Stage.Basic;
        let {ExecuteDeploymentModal, UpdateDeploymentModal, UpdateDetailsModal} = Stage.Common;
        let showTableComponent = this.props.widget.configuration['displayStyle'] === 'table';

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                {showTableComponent ?
                    <DeploymentsTable widget={this.props.widget} data={this.props.data}
                                      fetchData={this.fetchData.bind(this)}
                                      onSelectDeployment={this._selectDeployment.bind(this)}
                                      onShowLogs={this._showLogs.bind(this)}
                                      onShowUpdateDetails={this._showDeploymentUpdateDetailsModal.bind(this)}
                                      onMenuAction={this._showModal.bind(this)}
                                      onActOnExecution={this.actOnExecution.bind(this)}
                                      onError={this._setError.bind(this)}
                                      onSetVisibility={this._setDeploymentVisibility.bind(this)}
                                      noDataMessage={NO_DATA_MESSAGE}
                                      showExecutionStatusLabel={this.props.widget.configuration.showExecutionStatusLabel} />
                    :
                    <DeploymentsSegment widget={this.props.widget} data={this.props.data}
                                        fetchData={this.fetchData.bind(this)}
                                        onSelectDeployment={this._selectDeployment.bind(this)}
                                        onShowLogs={this._showLogs.bind(this)}
                                        onShowUpdateDetails={this._showDeploymentUpdateDetailsModal.bind(this)}
                                        onMenuAction={this._showModal.bind(this)}
                                        onActOnExecution={this.actOnExecution.bind(this)}
                                        onError={this._setError.bind(this)}
                                        onSetVisibility={this._setDeploymentVisibility.bind(this)}
                                        noDataMessage={NO_DATA_MESSAGE}
                                        showExecutionStatusLabel={this.props.widget.configuration.showExecutionStatusLabel} />
                }

                <Confirm content={`是否删除部署 ${this.state.deployment.id}?`}
                         open={this.state.modalType === MenuAction.DELETE_ACTION && this.state.showModal}
                         onConfirm={this._deleteDeployment.bind(this)}
                         onCancel={this._hideModal.bind(this)} />

                <Confirm content={`建议先卸载软件以停止活动节点，然后运行删除。
								强制删除将忽略任何现有的活节点。
								您确定要忽略活动节点并删除部署吗?
                                                                ${this.state.deployment.id}?`}
                         open={this.state.modalType === MenuAction.FORCE_DELETE_ACTION && this.state.showModal}
                         onConfirm={this._forceDeleteDeployment.bind(this)}
                         onCancel={this._hideModal.bind(this)} />

                <ExecuteDeploymentModal
                    open={this.state.modalType === MenuAction.WORKFLOW_ACTION && this.state.showModal}
                    deployment={this.state.deployment}
                    workflow={this.state.workflow}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}/>

                <UpdateDeploymentModal
                    open={this.state.modalType === MenuAction.UPDATE_ACTION && this.state.showModal}
                    deployment={this.state.deployment}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}/>

                <UpdateDetailsModal
                    open={this.state.modalType === DeploymentsList.DEPLOYMENT_UPDATE_DETAILS_MODAL && this.state.showModal}
                    deploymentUpdateId={this.state.deploymentUpdateId}
                    onClose={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox} />
            </div>

        );
    }
}