/**
 * Created by woody on 01/03/2017.
 */

export default class DeploymentActionButtons extends React.Component {

    static EDIT_ACTION = 'edit';
    static DELETE_ACTION = 'delete';
    static WORKFLOW_ACTION = 'workflow';

    static EMPTY_WORKFLOW = {name: '', parameters: []};

    constructor(props,context) {
        super(props,context);

        this.state = {
            showModal: false,
            modalType: '',
            workflow: DeploymentActionButtons.EMPTY_WORKFLOW,
            loading: false,
            error: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.deployment, nextProps.deployment);
    }



    _showExecuteWorkflowModal(workflow) {
        this.setState({workflow});
        this._showModal(DeploymentActionButtons.WORKFLOW_ACTION);
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

    render() {
        let {Button, ErrorMessage} = Stage.Basic;
        let {UpdateDeploymentNoInputModal} = Stage.Common;
        let deploymentId = 'reset_password';

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                <Button className="widgetButton" color="blue" icon="sync" labelPosition='left' disabled={_.isEmpty(deploymentId) || this.state.loading}
                        onClick={this._showModal.bind(this, DeploymentActionButtons.EDIT_ACTION)}
                        content="账号密码重置" id="updateDeploymentButton"/>

                <UpdateDeploymentNoInputModal
                    open={this._isShowModal(DeploymentActionButtons.EDIT_ACTION)}
                    deployment={this.props.deployment}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}/>

            </div>
        );
    }
}
