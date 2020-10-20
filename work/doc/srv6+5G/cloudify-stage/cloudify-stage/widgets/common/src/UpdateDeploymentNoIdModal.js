/**
 * Created by pposel on 18/01/2017.
 */

class UpdateDeploymentNoIdModal extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = UpdateDeploymentNoIdModal.initialState(props);
    }
    
    static initialState = (props) => ({
        loading: false,
        errors: {},
        blueprints: [],
        yamlFile: null,
        fileLoading: false,
        blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT,
        deploymentInputs: {...props.deployment.inputs},
        installWorkflow: true,
        uninstallWorkflow: true,
        installWorkflowFirst: false,
        ignoreFailure: false,
        automaticReinstall: true,
        reinstallList: [],
        showPreview: false,
        previewData: {},
        force: false
    });

    static propTypes = {
        toolbox: PropTypes.object.isRequired,
        open: PropTypes.bool.isRequired,
        inputField:PropTypes.string.isRequired,
        deployment: PropTypes.object.isRequired,
        onHide: PropTypes.func.isRequired
    };

    componentDidUpdate(prevProps) {
        if (!prevProps.open && this.props.open) {
            this.setState({loading: true});
            let actions = new Stage.Common.BlueprintActions(this.props.toolbox);
            actions.doGetBlueprints().then((blueprints) => {
                this.setState({...UpdateDeploymentNoIdModal.initialState(this.props), blueprints});
            }).catch((err)=> {
                this.setState({loading: false, error: err.message});
            }).then(()=> {
                this._selectBlueprint({}, {value: this.props.deployment.blueprint_id});
            });
        }
    }

    onUpdate () {
        this.setState({errors: {}, loading: true, showPreview: false}, () => this._submitUpdate(false));
        return false;
    }

    onPreview () {
        this.setState({errors: {}, loading: true, showPreview: false}, () => this._submitUpdate(true));
        return true;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    _submitUpdate(preview) {
        let {InputsUtils} = Stage.Common;
        let errors = {};

        if (_.isEmpty(this.state.blueprint.id)) {
            errors['blueprintName']='请选择模板';
        }

        let inputsWithoutValue = {};
        let inputsValueError = {};
        const inputsPlanForUpdate = InputsUtils.getPlanForUpdate(this.state.blueprint.plan.inputs,
                                                                 this.props.deployment.inputs);
        const deploymentInputs = InputsUtils.getInputsToSendAndValidate(inputsPlanForUpdate,
                                                             this.state.deploymentInputs,
                                                             inputsWithoutValue,
                                                             inputsValueError);
        InputsUtils.addErrors(inputsWithoutValue, errors);
        InputsUtils.addValueErrors(inputsValueError,errors);

        if (!_.isEmpty(errors)) {
            this.setState({errors, loading: false});
            return false;
        }

        let actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        actions.doUpdate(this.props.deployment.id,
                         this.state.blueprint.id,
                         deploymentInputs,
                         this.state.installWorkflow,
                         this.state.uninstallWorkflow,
                         this.state.installWorkflowFirst,
                         this.state.ignoreFailure,
                         this.state.automaticReinstall,
                         this.state.reinstallList,
                         this.state.force,
                         preview)
            .then((data) => {
                if (preview) {
                    this.setState({errors: {}, loading: false, showPreview: true, previewData: data});
                } else {
                    this.setState({errors: {}, loading: false});
                    this.props.toolbox.refresh();
                    this.props.onHide();
                    this.props.toolbox.getEventBus().trigger('nodes:refresh');
                    this.props.toolbox.getEventBus().trigger('inputs:refresh');
                    this.props.toolbox.getEventBus().trigger('outputs:refresh');
                    this.props.toolbox.getEventBus().trigger('executions:refresh');
                }
            }).catch((err) => this.setState({errors: {error: err.message}, loading: false}));
    }

    _handleInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState(fieldNameValue);
    }

    _handleDeploymentInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState({deploymentInputs: {...this.state.deploymentInputs, ...fieldNameValue}});
    }

    _handleYamlFileChange(file) {
        if (!file) {
            return;
        }

        let {FileActions, InputsUtils} = Stage.Common;
        let actions = new FileActions(this.props.toolbox);
        this.setState({fileLoading: true});

        actions.doGetYamlFileContent(file).then((yamlInputs) => {
            let deploymentInputs = InputsUtils.getUpdatedInputs(this.state.blueprint.plan.inputs, this.state.deploymentInputs, yamlInputs);
            this.setState({errors: {}, deploymentInputs, fileLoading: false});
        }).catch((err) => {
            const errorMessage = `读取YAML文件失败: ${_.isString(err) ? err : err.message}`;
            this.setState({errors: {yamlFile: errorMessage}, fileLoading: false});
        });
    }

    _selectBlueprint(proxy, data){
        if (!_.isEmpty(data.value)) {
            this.setState({loading: true});

            let actions = new Stage.Common.BlueprintActions(this.props.toolbox);
            actions.doGetFullBlueprintData({id: data.value}).then((blueprint)=>{
                let deploymentInputs = {};
                let currentDeploymentInputs = this.props.deployment.inputs;
                _.unset(blueprint.plan.inputs,[this.props.inputField]);
                _.forEach(blueprint.plan.inputs, (inputObj, inputName) => {
                    deploymentInputs[inputName]
                        = Stage.Common.InputsUtils.getInputFieldInitialValue(currentDeploymentInputs[inputName], inputObj.type);
                });

                this.setState({deploymentInputs, blueprint, errors: {}, loading: false});
            }).catch((err)=> {
                this.setState({blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT, loading: false, errors: {error: err.message}});
            });
        } else {
            this.setState({blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT, errors: {}});
        }
    }

    render() {
        let {ApproveButton, CancelButton, Form, Header, Icon, Message, Modal, NodeInstancesFilter} = Stage.Basic;
        let {InputsHeader, InputsUtils, YamlFileButton, UpdateDetailsModal} = Stage.Common;

        let blueprints = Object.assign({},{items:[]}, this.state.blueprints);
        let blueprintsOptions = _.map(blueprints.items, blueprint => { return { text: blueprint.id, value: blueprint.id } });
        const executionParameters = this.state.showPreview
        ?
            {
                skip_install: !this.state.installWorkflow,
                skip_uninstall: !this.state.uninstallWorkflow,
                skip_reinstall: !this.state.automaticReinstall,
                reinstall_list: this.state.reinstallList
            }
        : {};

        return (
            <Modal open={this.props.open} onClose={()=>this.props.onHide()} className="updateDeploymentModal">
                <Modal.Header>
                    <Icon name="edit"/> 更新部署 {this.props.deployment.id}
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors} scrollToError
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field error={this.state.errors.blueprintName} label='Blueprint' required hidden>
                            <Form.Dropdown search selection value={this.state.blueprint.id} placeholder="选择模板"
                                           name="blueprintName" options={blueprintsOptions} onChange={this._selectBlueprint.bind(this)}/>
                        </Form.Field>

                        {
                            this.state.blueprint.id &&
                            <React.Fragment>
                                {
                                    !_.isEmpty(this.state.blueprint.plan.inputs) &&
                                    <YamlFileButton onChange={this._handleYamlFileChange.bind(this)}
                                                    dataType="deployment's inputs"
                                                    fileLoading={this.state.fileLoading}/>
                                }
                                <InputsHeader/>
                                {
                                    _.isEmpty(this.state.blueprint.plan.inputs) &&
                                    <Message content="已选择模板无输入"/>
                                }
                            </React.Fragment>
                        }

                        {
                            InputsUtils.getInputFields(this.state.blueprint.plan.inputs,
                                                       this._handleDeploymentInputChange.bind(this),
                                                       this.state.deploymentInputs,
                                                       this.state.errors)
                        }

                        <Form.Divider hidden>
                            <Header size="tiny">
                                Actions
                            </Header>
                        </Form.Divider>

                        <Form.Field hidden>
                            <Form.Checkbox label="在添加节点上安装工作流" toggle name="installWorkflow"
                                           help='在添加节点上安装工作流'
                                           checked={this.state.installWorkflow} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field hidden>
                            <Form.Checkbox label="在已删除节点上卸载工作流" toggle name="uninstallWorkflow"
                                           help='在已删除节点上卸载工作流'
                                           checked={this.state.uninstallWorkflow} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field hidden>
                            <Form.Checkbox label="先安装工作流"
                                           help='先安装工作流再卸载工作流.
                                                 Default: first uninstall and then install'
                                           toggle name="installWorkflowFirst"
                                           checked={this.state.installWorkflowFirst} onChange={this._handleInputChange.bind(this)} />
                        </Form.Field>

                        <Form.Field hidden>
                            <Form.Checkbox label="卸载工作流忽略错误" toggle name="ignoreFailure"
                                           help='Supply the parameter `ignore_failure` with
                                                 the value `true` to the uninstall workflow'
                                           checked={this.state.ignoreFailure} onChange={this._handleInputChange.bind(this)} />
                        </Form.Field>

                        <Form.Field hidden>
                            <Form.Checkbox label="自动重新安装" name="automaticReinstall" toggle
                                           help='Automatically reinstall node instances
                                                 that their properties has been modified, as
                                                 part of a deployment update. If not set, then node instances
                                                 that were explicitly given to "Reinstall
                                                 node instances list" will still be reinstalled'
                                           checked={this.state.automaticReinstall}
                                           onChange={this._handleInputChange.bind(this)}  />
                        </Form.Field>

                        {/*<NodeInstancesFilter name='reinstallList' deploymentId={this.props.deployment.id}*/}
                        {/*                     label='节点实例表重装' value={this.state.reinstallList}*/}
                        {/*                     placeholder='Choose node instances to reinstall' upward*/}
                        {/*                     onChange={this._handleInputChange.bind(this)}*/}
                        {/*                     help='Node instances ids to be reinstalled as part*/}
                        {/*                           of deployment update. They will be*/}
                        {/*                           reinstalled even if "Run automatic reinstall"*/}
                        {/*                           is not set' />*/}


                        <Form.Field>
                            <Form.Checkbox label="强制更新" name="force" toggle
                                           help='Force running update in case a previous
                                                 update on this deployment has failed to
                                                 finished successfully'
                                           checked={this.state.force} onChange={this._handleInputChange.bind(this)} />
                        </Form.Field>

                    </Form>

                    <UpdateDetailsModal open={this.state.showPreview} isPreview={true}
                                        deploymentUpdate={this.state.previewData}
                                        executionParameters={executionParameters}
                                        onClose={() => this.setState({showPreview: false})}
                                        onUpdate={this.onUpdate.bind(this)}
                                        toolbox={this.props.toolbox} />
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onPreview.bind(this)} disabled={this.state.loading} content="预览" icon="zoom" color="blue" />
                    <ApproveButton onClick={this.onUpdate.bind(this)} disabled={this.state.loading} content="更新" icon="edit" color="green" />

                </Modal.Actions>
            </Modal>
        );
    }
};

Stage.defineCommon({
    name: 'UpdateDeploymentNoIdModal',
    common: UpdateDeploymentNoIdModal
});
