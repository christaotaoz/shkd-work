
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
        blueprint: PropTypes.object.isRequired,
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

            //获取蓝图的初始化参数
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
    getBlueprint(){

        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);

        //获取蓝图的初始化参数
        actions.doGetFullBlueprintData({id: 'mongo'}).then((blueprint)=>{
            let deploymentInputs = Stage.Common.InputsUtils.getInputsInitialValuesFrom(blueprint.plan.inputs);
            this.setState({deploymentInputs, blueprint, errors: {}, loading: false});
        }).catch((err)=> {
            this.setState({blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT, loading: false, errors: {error: err.message}});
        });
    }

    _handleInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState(fieldNameValue);
    }

    _handleDeploymentInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState({deploymentInputs: {...this.props.deploymentInputs, ...fieldNameValue}});
    }

    _submitDeploy () {
        let {InputsUtils} = Stage.Common;
        let errors = {};

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

        return (
            <Modal open={this.props.open} onClose={()=>this.props.onHide()}>
                <Modal.Header>
                    <Icon name="rocket"/> 添加用户界面
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
                        {
                            InputsUtils.getInputFields(this.props.blueprint.plan.inputs,
                                this._handleDeploymentInputChange.bind(this),
                                this.state.deploymentInputs,
                                this.state.errors)
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
