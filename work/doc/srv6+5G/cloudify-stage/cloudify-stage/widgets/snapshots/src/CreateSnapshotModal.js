/**
 * Created by kinneretzin on 05/10/2016.
 */

import Actions from './actions';

export default class CreateModal extends React.Component {

    constructor(props,context) {
        super(props, context);

        this.state = {...CreateModal.initialState, open: false}
    }

    static initialState = {
        loading: false,
        snapshotId: '',
        includeMetrics: false,
        includeCredentials: false,
        excludeLogs: false,
        excludeEvents: false,
        errors: {}
    };

    onApprove () {
        this._submitCreate();
        return false;
    }

    onCancel () {
        this.setState({open: false});
        return true;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.open && this.state.open) {
            this.setState(CreateModal.initialState);
        }
    }

    _submitCreate() {
        let errors = {};

        if (_.isEmpty(this.state.snapshotId)) {
            errors['snapshotId']='请提供快照id';
        } else {
            const URL_SAFE_CHARACTERS_RE = /^[0-9a-zA-Z\$\-\_\.\+\!\*\'\(\)\,]+$/;
            if (!URL_SAFE_CHARACTERS_RE.test(this.state.snapshotId)) {
                errors['snapshotId'] = '请使用安全字符规则，允许字母, 母子和以下 ' +
                                       "特殊字符 $-_.+!*'()。";
            }
        }

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});

        // Call create method
        var actions = new Actions(this.props.toolbox);
        actions.doCreate(this.state.snapshotId, this.state.includeMetrics, this.state.includeCredentials, this.state.excludeLogs, this.state.excludeEvents).then(()=>{
            this.props.toolbox.getContext().setValue(this.props.widget.id + 'createSnapshot',null);
            this.props.toolbox.getEventBus().trigger('snapshots:refresh');
            this.setState({errors: {}, loading: false, open: false});
        }).catch((err)=>{
            this.setState({errors: {error: err.message}, loading: false});
        });
    }

    _handleInputChange(proxy, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    render() {
        var {Modal, Button, Icon, Form, ApproveButton, CancelButton} = Stage.Basic;
        const createButton = <Button content='创建' icon='add' labelPosition='left' />;

        return (
            <Modal trigger={createButton} open={this.state.open} onOpen={()=>this.setState({open:true})} onClose={()=>this.setState({open:false})}>
                <Modal.Header>
                    <Icon name="add"/> 创建 快照
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors}
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field error={this.state.errors.snapshotId}>
                            <Form.Input name='snapshotId' placeholder="快照 ID"
                                        value={this.state.snapshotId} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field>
                            <Form.Checkbox toggle label="InfluxDB存储metrics" name="includeMetrics"
                                           checked={this.state.includeMetrics} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field help='上传模板时包含指定SSH keys'>
                            <Form.Checkbox toggle label="包含认证" name="includeCredentials"
                                           checked={this.state.includeCredentials} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field>
                            <Form.Checkbox toggle label="不记录日志" name="excludeLogs"
                            checked={this.state.excludeLogs} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field>
                            <Form.Checkbox toggle label="不记录事件" name="excludeEvents"
                            checked={this.state.excludeEvents} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content="创建" icon="add" color="green"/>
                </Modal.Actions>
            </Modal>
        );
    }
};
