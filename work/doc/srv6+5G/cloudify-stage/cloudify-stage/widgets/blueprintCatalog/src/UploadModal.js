/**
 * Created by pposel on 07/02/2017.
 */

export default class UploadModal extends React.Component {

    constructor(props,context) {
        super(props,context);
        this.state = UploadModal.initialState;
    }

    /**
     * propTypes
     * @property {object} yamlFiles array containing list of YAML files and repository name
     * @property {string} repositoryName string name of the repository used as a blueprint name
     * @property {boolean} open modal open state
     * @property {function} onHide function called when modal is closed
     * @property {object} toolbox Toolbox object
     * @property {object} actions Actions object
     */
    static propTypes = {
        repositoryName: PropTypes.string.isRequired,
        yamlFiles: PropTypes.array.isRequired,
        open: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        toolbox: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired
    };

    static initialState = {
        loading: false,
        blueprintName: '',
        blueprintYamlFile: '',
        yamlFiles: [],
        visibility: Stage.Common.Consts.defaultVisibility,
        errors: {}
    }

    onApprove () {
        this._submitUpload();
        return false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.open && this.props.open) {
            if (!_.isEmpty(this.props.yamlFiles)) {
                const defaultBlueprintYamlFile = Stage.Common.UploadBlueprintModal.DEFAULT_BLUEPRINT_YAML_FILE;
                let yamlFiles = this.props.yamlFiles;
                let blueprintName = this.props.repositoryName;
                let blueprintYamlFile
                    = _.includes(yamlFiles, defaultBlueprintYamlFile)
                    ? defaultBlueprintYamlFile
                    : yamlFiles[0];

                this.setState({
                    ...UploadModal.initialState,
                    blueprintName,
                    blueprintYamlFile,
                    yamlFiles
                });
            } else {
                this.setState(UploadModal.initialState);
            }
        }
    }

    _submitUpload() {
        let errors = {};

        if (_.isEmpty(this.state.blueprintName)) {
            errors['blueprintName']='请输入模版名称';
        }

        if (_.isEmpty(this.state.blueprintYamlFile)) {
            errors['blueprintYamlFile']='请输入YAML文件';
        }

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});

        this.props.actions.doUpload(this.state.blueprintName,
                                    this.state.blueprintYamlFile,
                                    this.props.zipUrl,
                                    this.props.imageUrl,
                                    this.state.visibility
        ).then(()=>{
            this.setState({errors: {}, loading: false});
            this.props.toolbox.getEventBus().trigger('blueprints:refresh');
            this.props.onHide();
        }).catch((err)=>{
            this.setState({errors: {error: err.message}, loading: false});
        });
    }

    _handleInputChange(proxy, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    render() {
        let {Modal, CancelButton, ApproveButton, Icon, Form, VisibilityField} = Stage.Basic;
        let yamlFiles = _.map(this.state.yamlFiles, item => { return {text: item, value: item} });

        return (
            <div>
                <Modal open={this.props.open} onClose={()=>this.props.onHide()} className="uploadModal">
                    <Modal.Header>
                        <Icon name="upload"/> 上传模版来自 {this.props.repositoryName}
                        <VisibilityField visibility={this.state.visibility} className="rightFloated"
                                      onVisibilityChange={(visibility)=>this.setState({visibility: visibility})}/>
                    </Modal.Header>

                    <Modal.Content>
                        <Form loading={this.state.loading} errors={this.state.errors}
                              onErrorsDismiss={() => this.setState({errors: {}})}>
                            <Form.Field label='Blueprint name' required
                                        error={this.state.errors.blueprintName}
                                        help='包将被上传到管理作为模板资源，在这里指定的名称.'>
                                <Form.Input name='blueprintName'
                                            value={this.state.blueprintName} onChange={this._handleInputChange.bind(this)}/>
                            </Form.Field>
                            <Form.Field label='模版YAML文件名' required
                                        error={this.state.errors.blueprintYamlFile}
                                        help='在存档中拥有多个配置文件，您需要指定哪个是您的应用程序的主要文件.'>
                                <Form.Dropdown name='blueprintYamlFile' search selection options={yamlFiles}
                                               value={this.state.blueprintYamlFile} onChange={this._handleInputChange.bind(this)}/>
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                        <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content="上传" icon="upload" color="green"/>
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
};
