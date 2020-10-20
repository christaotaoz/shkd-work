
/**
 * Created by zhengqin on 08/25/2019.
 */

export default class InterfaceConf extends React.Component {

    static EDIT_ACTION = 'edit';
    static DELETE_ACTION = 'delete';
    static WORKFLOW_ACTION = 'workflow';

    static EMPTY_WORKFLOW = {name: '', parameters: []};

    constructor(props,context) {
        super(props,context);

        this.state = {
            showModal: false,
            modalType: '',
            workflow: InterfaceConf.EMPTY_WORKFLOW,
            loading: false,
            error: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.deployment, nextProps.deployment);
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
        let {Button, Confirm, ErrorMessage} = Stage.Basic;
        let {UpdateDeploymentNoIdModal} = Stage.Common;
        let deploymentId = 'interface_conf';

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                <Button className="widgetButton" color="blue" icon="sync" labelPosition='left' disabled={_.isEmpty(deploymentId) || this.state.loading}
                        onClick={this._showModal.bind(this, InterfaceConf.EDIT_ACTION)}
                        content="更新接口配置" id="interfaceConfButton"/>

                <UpdateDeploymentNoIdModal
                    open={this._isShowModal(InterfaceConf.EDIT_ACTION)}
                    deployment={this.props.deployment}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}
                    inputField={''}/>

            </div>
        );
    }
}
