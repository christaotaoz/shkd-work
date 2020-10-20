/**
 * Created by kinneretzin on 03/21/2017.
 */

import Actions from './actions';

export default class RestoreSnapshotModal extends React.Component {

    constructor(props,context) {
        super(props, context);

        this.state = {...RestoreSnapshotModal.initialState, open: false}
    }

    static initialState = {
        loading: false,
        errors: {},
        isFromTenantlessEnv : false,
        shouldForceRestore: false,
        ignorePluginFailure: false
    };

    static propTypes = {
        snapshot: PropTypes.object.isRequired,
        toolbox: PropTypes.object.isRequired,
    };

    static defaultProps = {
        onHide: _.noop
    };

    onApprove () {
        this._submitRestore();
        return false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.open && this.state.open) {
            this.setState(RestoreSnapshotModal.initialState);
        }
    }

    _submitRestore() {
        let errors = {};

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});

        var actions = new Actions(this.props.toolbox);
        actions.doRestore(this.props.snapshot, this.state.shouldForceRestore, this.state.ignorePluginFailure).then(()=>{
            this.setState({errors: {}, loading: false});
            this.props.toolbox.refresh();
            this.props.toolbox.getEventBus().trigger('snapshots:refresh');
            this.props.toolbox.getEventBus().trigger('menu.tenants:refresh');
            this.props.onHide();
        }).catch((err)=>{
            this.setState({errors: {error: err.message}, loading: false});
        });
    }

    _handleFieldChange(proxy, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    render() {
        var {Modal, ApproveButton, CancelButton, Icon, Form, Message} = Stage.Basic;

        return (
            <Modal open={this.props.open} onClose={()=>this.props.onHide()}>
                <Modal.Header>
                    <Icon name="undo"/> Restore snapshot
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors}
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field>
                            <Form.Checkbox toggle
                                           label="无租户环境快照"
                                           name='isFromTenantlessEnv'
                                           checked={this.state.isFromTenantlessEnv}
                                           onChange={this._handleFieldChange.bind(this)}/>
                        </Form.Field>

                        {
                            this.state.isFromTenantlessEnv &&
                            <Message>
                                当从无租户环境恢复时，请确保上传快照的租户没有任何资源。
                            </Message>

                        }
                        <Form.Field>
                            <Form.Checkbox toggle
                                           label="在系统非空时强制恢复（自动清空所有数据）"
                                           name='shouldForceRestore'
                                           checked={this.state.shouldForceRestore}
                                           onChange={this._handleFieldChange.bind(this)}/>
                        </Form.Field>
                        <Form.Field help='忽略插件安装和部署环境缺少插件的创建失败'>
                            <Form.Checkbox toggle
                                           label='忽略插件失败'
                                           name='ignorePluginFailure'
                                           checked={this.state.ignorePluginFailure}
                                           onChange={this._handleFieldChange.bind(this)}/>
                        </Form.Field>

                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content="Restore" icon="undo" color="green"/>
                </Modal.Actions>
            </Modal>
        );
    }
};