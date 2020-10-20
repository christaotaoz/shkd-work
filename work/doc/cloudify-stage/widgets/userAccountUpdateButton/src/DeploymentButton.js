/**
 * Created by kinneretzin on 18/10/2016.
 */



export default class extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
            open: false,
            loading: false,
            error: null,
            errors: {},
            blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT,
            deploymentName: '',
            yamlFile: null,
            fileLoading: false,
            deploymentInputs: [],
            visibility: Stage.Common.Consts.defaultVisibility,
            skipPluginsValidation: false
        }
    }

    _createDeployment(){
        this.setState({open: true});

        this.setState({loading: true});

        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);

        //获取蓝图的初始化参数
        actions.doGetFullBlueprintData({id: 'update'}).then((blueprint)=>{
            let deploymentInputs = Stage.Common.InputsUtils.getInputsInitialValuesFrom(blueprint.plan.inputs);
            this.setState({deploymentInputs, blueprint, errors: {}, loading: false});
        }).catch((err)=> {
            this.setState({blueprint: Stage.Common.DeployBlueprintModal.EMPTY_BLUEPRINT, loading: false, errors: {error: err.message}});
        });
    }

    _hideModal () {
        this.setState({open: false});
    }

    _handleInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState(fieldNameValue);
    }

    _handleDeploymentInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        this.setState({deploymentInputs: {...this.state.deploymentInputs, ...fieldNameValue}});
    }

    onCancel () {
        this._hideModal();
        return true;
    }

    onApprove () {
        this.setState({errors: {}}, this._submitDeploy);
        return false;
    }



    _submitDeploy () {
        let {InputsUtils} = Stage.Common;
        let errors = {};
        const executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
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

        const deploymentActions = new Stage.Common.DeploymentActions(this.props.toolbox);

        actions.doDeploy(this.state.blueprint, this.state.deploymentName, deploymentInputs, this.state.visibility, this.state.skipPluginsValidation)
            .then((/*deployment*/)=> {
                this.setState({loading: false, errors: {}});
                this.props.toolbox.getEventBus().trigger('deployments:refresh');
                this._hideModal()
            })
            .then(() => waitForDeploymentIsCreated())
            .then(() => {
                let executePromises = deploymentActions.doExecute({id: this.state.deploymentName}, {name: 'install'}, {}, false);
                return executePromises.then((results) => {
                    return executionActions.waitUntilFinished(results.id, 2000)
                        .then((installation) =>{
                            if(installation[0].status === 'failed'){
                                window.alert('更新用户失败！');
                                deploymentActions.doForceDelete({id: this.state.deploymentName}).then(() => {
                                    this.props.toolbox.getEventBus().trigger('deployments:refresh');
                                });
                                window.alert('删除无效部署！')
                            }
                            if(installation[0].status === 'terminated'){
                                window.alert('工作流执行完成！');
                            }
                        })
                })
            })
            .catch((err)=>{
                this.setState({loading: false, errors: {error: err.message}});
            });
    }

    render() {
        let {Button, ErrorMessage} = Stage.Basic;
        let {ApproveButton, CancelButton, Form, Icon, Message, Modal, VisibilityField} = Stage.Basic;
        let {InputsHeader, InputsUtils, YamlFileButton} = Stage.Common;

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                <Button color='green' icon='rocket' content='更新用户' labelPosition='left' className='widgetButton'
                        loading={this.state.loading} onClick={this._createDeployment.bind(this)} />

                {/*<DeployModal open={this.state.open} blueprint={this.state.blueprint} deploymentInputs={this.state.deploymentInputs}*/}
                {/*             onHide={this._hideModal.bind(this)} toolbox={this.props.toolbox}/>*/}

                <Modal open={this.state.open} onClose={()=>this._hideModal()}>
                    <Modal.Header>
                        <Icon name="rocket"/> 更新用户界面
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
                                InputsUtils.getInputFields(this.state.blueprint.plan.inputs,
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
            </div>
        );
    }
}