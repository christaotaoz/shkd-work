/**
 * Created by kinneretzin on 05/10/2016.
 */

class DeployAndInstallBlueprintModal extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = DeployAndInstallBlueprintModal.initialState;
    }

    static EMPTY_BLUEPRINT = {id: '', plan: {inputs: {}}};

    static initialState = {
        loading: false,
        errors: {},
        deploymentName: '',
        yamlFile: null,
        fileLoading: false,
        deploymentInputs: [],
        visibility: Stage.Common.Consts.defaultVisibility,
        skipPluginsValidation: true
    };

    static propTypes = {
        toolbox: PropTypes.object.isRequired,
        open: PropTypes.bool.isRequired,
        blueprint: PropTypes.object.isRequired,
        onHide: PropTypes.func
    };

    static defaultProps = {
        onHide: ()=>{}
    };

    componentDidUpdate(prevProps) {
        if (!prevProps.open && this.props.open) {
            let deploymentInputs = Stage.Common.InputsUtils.getInputsInitialValuesFrom(this.props.blueprint.plan.inputs);
            this.setState({...DeployAndInstallBlueprintModal.initialState, deploymentInputs});
        }
    }

    onApprove () {
        this.setState({errors: {}}, this._submitDeploy);
        return false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
      }
    async _submitDeploy() {
        let {InputsUtils} = Stage.Common;
        let errors = {};

        if (!this.props.blueprint) {
            errors['error'] = '未选择模版';
        }

        // if (_.isEmpty(this.state.deploymentName)) {
        //     errors['deploymentName']='请提供部署的名字';
        // }

        let inputsWithoutValue = {};
        let inputsValueError = {};
        const deploymentInputs = InputsUtils.getInputsToSendAndValidate(this.props.blueprint.plan.inputs,
                                                             this.state.deploymentInputs,
                                                             inputsWithoutValue,
                                                             inputsValueError);

        let createDeploymentName = this.props.deploymentPrefix + deploymentInputs[this.props.inputField];

        await this.setStateAsync({deploymentName: createDeploymentName});

        if (_.isEmpty(this.state.deploymentName)) {
            errors['deploymentName']='请提供部署的名字';
        }
        // console.log("#######" + this.state.deploymentName);
        const executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        InputsUtils.addErrors(inputsWithoutValue, errors);
        InputsUtils.addValueErrors(inputsValueError,errors);

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});
        const waitForDeploymentIsCreated = async () => {
            const maxNumberOfRetries = 60;
            const waitingInterval = 1000; //ms

            let deploymentCreated = false;
            for (let i = 0; i < maxNumberOfRetries && !deploymentCreated; i++) {
                await new Promise(resolve => {
                        // console.log('Waiting for deployment is created...', i);
                        setTimeout(resolve, waitingInterval);
                    })
                    .then(() => executionActions.doGetExecutions(this.state.deploymentName))
                    .then(({items}) => {
                        deploymentCreated = !_.isEmpty(items) && _.isUndefined(_.find(items, {ended_at: null}));
                    });
            }
            if (deploymentCreated) {
                console.log("Deployment created successfully!!!");
                return Promise.resolve();
            } else {
                console.log("Timeout exceeded. Deployment was not created!!");
                const timeout = Math.floor(maxNumberOfRetries * waitingInterval / 1000);
                return Promise.reject(`Timeout exceeded. Deployment was not created after ${timeout} seconds.`);
            }
        };
        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);
        actions.doDeploy(this.props.blueprint, this.state.deploymentName, deploymentInputs, this.state.visibility, this.state.skipPluginsValidation)
            .then((/*deployment*/)=> {
                // this.setState({loading: false, errors: {}});
                this.props.toolbox.getEventBus().trigger('deployments:refresh');
                this.props.onHide();
            })
            .then(() => waitForDeploymentIsCreated())
            .then(() => {
                let executePromises = deploymentActions.doExecute({id: this.state.deploymentName}, {name: 'install'}, {}, false);
                return executePromises.then((results) => {
                    return executionActions.waitUntilFinished(results.id, 2000)
                        .then((installation) =>{
                            if(installation[0].status == 'failed'){
                                console.log("Execution install failed, delete deployment");
                                deploymentActions.doForceDelete({id: this.state.deploymentName}).then(() => {
                                    this.props.toolbox.getEventBus().trigger('deployments:refresh');
                                })
                            }
                            this.props.toolbox.getEventBus().trigger('gatewayUserGroup:refresh');
                            this.props.toolbox.getEventBus().trigger('qos:refresh');
                            this.props.toolbox.getEventBus().trigger('firewall:refresh');
                            this.props.toolbox.getEventBus().trigger('webAppFirewall:refresh');
                            this.setState({loading: false, errors: {}});
                        })
                })
            })
            .catch((err)=>{
                this.setState({loading: false, errors: {error: err.message}});
            });
    }

    _handleYamlFileChange(file) {
        if (!file) {
            return;
        }

        let {FileActions, InputsUtils} = Stage.Common;
        let actions = new FileActions(this.props.toolbox);
        this.setState({fileLoading: true});

        actions.doGetYamlFileContent(file).then((yamlInputs) => {
            let deploymentInputs = InputsUtils.getUpdatedInputs(this.props.blueprint.plan.inputs, this.state.deploymentInputs, yamlInputs);
            this.setState({errors: {}, deploymentInputs, fileLoading: false});
        }).catch((err) => {
            const errorMessage = `读取YAML文件失败: ${_.isString(err) ? err : err.message}`;
            this.setState({errors: {yamlFile: errorMessage}, fileLoading: false});
        });
    }

    _handleInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState(fieldNameValue);
    }

    _handleDeploymentInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState({deploymentInputs: {...this.state.deploymentInputs, ...fieldNameValue}});
    }

    render() {
        let {ApproveButton, CancelButton, Form, Icon, Message, Modal, VisibilityField} = Stage.Basic;
        let {InputsHeader, InputsUtils, YamlFileButton} = Stage.Common;

        let blueprint = Object.assign({}, DeployAndInstallBlueprintModal.EMPTY_BLUEPRINT, this.props.blueprint);

        return (
            <Modal open={this.props.open} onClose={()=>this.props.onHide()} className="deployBlueprintModal">
                <Modal.Header>
                    <Icon name="rocket"/> 部署模板 {blueprint.id}
                    <VisibilityField visibility={this.state.visibility} className="rightFloated"
                                     onVisibilityChange={(visibility)=>this.setState({visibility: visibility})} />
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors} scrollToError
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field error={this.state.errors.deploymentName} label="Deployment name" required hidden>
                            <Form.Input name='deploymentName'
                                        value={this.state.deploymentName}
                                        onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>


                        {
                            blueprint.id &&
                            <React.Fragment>
                                {
                                    !_.isEmpty(blueprint.plan.inputs) &&
                                    <YamlFileButton onChange={this._handleYamlFileChange.bind(this)}
                                                    dataType="deployment's inputs"
                                                    fileLoading={this.state.fileLoading}/>
                                }
                                <InputsHeader/>
                                {
                                    _.isEmpty(blueprint.plan.inputs) &&
                                    <Message content="No inputs available for the blueprint"/>
                                }
                            </React.Fragment>
                        }

                        {
                            InputsUtils.getInputFields(blueprint.plan.inputs,
                                                       this._handleDeploymentInputChange.bind(this),
                                                       this.state.deploymentInputs,
                                                       this.state.errors)
                        }
                        {/*<Form.Field className='skipPluginsValidationCheckbox'>*/}
                        {/*    <Form.Checkbox toggle*/}
                        {/*                   label="跳过插件认证"*/}
                        {/*                   name='skipPluginsValidation'*/}
                        {/*                   checked={this.state.skipPluginsValidation}*/}
                        {/*                   onChange={this._handleInputChange.bind(this)}*/}
                        {/*    />*/}
                        {/*</Form.Field>*/}
                        {/*{*/}
                        {/*    this.state.skipPluginsValidation && <Message>推荐路径用于插件上传到官方网站,该选项仅用于插件开发和高级用户.</Message>*/}
                        {/*}*/}
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content="部署" icon="rocket" color="green"/>
                </Modal.Actions>
            </Modal>
        );
    }
};

Stage.defineCommon({
    name: 'DeployAndInstallBlueprintModal',
    common: DeployAndInstallBlueprintModal
});