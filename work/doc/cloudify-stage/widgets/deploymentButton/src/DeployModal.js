
/**
 * Created by kinneretzin on 05/10/2016.
 */

export default class DeployModal extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = DeployModal.initialState;
    }

    static initialState = {
        loading: false,
        errors: {},
        blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT,
        deploymentName: '',
        yamlFile: null,
        fileLoading: false,
        deploymentInputs: [],
        visibility: Stage.Common.Consts.defaultVisibility,
        skipPluginsValidation: false
    };

    static propTypes = {
        toolbox: PropTypes.object.isRequired,
        open: PropTypes.bool.isRequired,
        blueprints: PropTypes.object.isRequired,
        onHide: PropTypes.func
    };

    static defaultProps = {
        onHide: _.noop
    };

    componentDidUpdate(prevProps) {
        if (!prevProps.open && this.props.open) {
            this.setState(DeployModal.initialState);
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

    _selectBlueprint(proxy, data){
        if (!_.isEmpty(data.value)) {
            this.setState({loading: true});

            var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
            actions.doGetFullBlueprintData({id: data.value}).then((blueprint)=>{
                let deploymentInputs = Stage.Common.InputsUtils.getInputsInitialValuesFrom(blueprint.plan.inputs);
                this.setState({deploymentInputs, blueprint, errors: {}, loading: false});
            }).catch((err)=> {
                this.setState({blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT, loading: false, errors: {error: err.message}});
            });
        } else {
            this.setState({blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT, errors: {}});
        }
    }

    _handleInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState(fieldNameValue);
    }

    _handleDeploymentInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState({deploymentInputs: {...this.state.deploymentInputs, ...fieldNameValue}});
    }

    _submitDeploy () {
        let {InputsUtils} = Stage.Common;
        let errors = {};

        if (_.isEmpty(this.state.blueprint.id)) {
            errors['blueprintName']='请从列表中选择部署';
        }

        if (_.isEmpty(this.state.deploymentName)) {
            errors['deploymentName']='请提供部署的名称';
        }

        let inputsWithoutValue = {};
        const deploymentInputs = InputsUtils.getInputsToSend(this.state.blueprint.plan.inputs,
                                                             this.state.deploymentInputs,
                                                             inputsWithoutValue);
        InputsUtils.addErrors(inputsWithoutValue, errors);

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});

        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        actions.doDeploy(this.state.blueprint, this.state.deploymentName, deploymentInputs, this.state.visibility, this.state.skipPluginsValidation)
            .then((/*deployment*/)=> {
                this.setState({loading: false, errors: {}});
                this.props.toolbox.getEventBus().trigger('deployments:refresh');
                this.props.onHide();
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
            let deploymentInputs = InputsUtils.getUpdatedInputs(this.state.blueprint.plan.inputs, this.state.deploymentInputs, yamlInputs);
            this.setState({errors: {}, deploymentInputs, fileLoading: false});
        }).catch((err) => {
            const errorMessage = `读取YAML文件失败: ${_.isString(err) ? err : err.message}`;
            this.setState({errors: {yamlFile: errorMessage}, fileLoading: false});
        });
    }

    render() {
        let {ApproveButton, CancelButton, Form, Icon, Message, Modal, VisibilityField} = Stage.Basic;
        let {InputsHeader, InputsUtils, YamlFileButton} = Stage.Common;

        let blueprints = Object.assign({},{items:[]}, this.props.blueprints);
        let options = _.map(blueprints.items, blueprint => { return { text: blueprint.id, value: blueprint.id } });

        return (
            <Modal open={this.props.open} onClose={()=>this.props.onHide()}>
                <Modal.Header>
                    <Icon name="rocket"/> 创建新部署
                    <VisibilityField visibility={this.state.visibility} className="rightFloated"
                                     onVisibilityChange={(visibility)=>this.setState({visibility:visibility})} />
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors} scrollToError={true}
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field error={this.state.errors.deploymentName} label='部署名称' required>
                            <Form.Input name='deploymentName'
                                        value={this.state.deploymentName}
                                        onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field error={this.state.errors.blueprintName} label='模板' required>
                            <Form.Dropdown search selection value={this.state.blueprint.id}
                                           name="blueprintName" options={options} onChange={this._selectBlueprint.bind(this)}/>
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
                                    <Message content="所选模板没有输入"/>
                                }
                            </React.Fragment>
                        }

                        {
                            InputsUtils.getInputFields(this.state.blueprint.plan.inputs,
                                                       this._handleDeploymentInputChange.bind(this),
                                                       this.state.deploymentInputs,
                                                       this.state.errors)
                        }
                        <Form.Field className='skipPluginsValidationCheckbox'>
                            <Form.Checkbox toggle
                                           label="跳过插件验证"
                                           name='skipPluginsValidation'
                                           checked={this.state.skipPluginsValidation}
                                           onChange={this._handleInputChange.bind(this)}
                            />
                        </Form.Field>
                        {
                            this.state.skipPluginsValidation && <Message>推荐路径用于插件上传到Github。该选项仅用于插件开发和高级用户.</Message>
                        }
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content="部署" icon="rocket" className="green"/>
                </Modal.Actions>
            </Modal>
        );
    }
};
