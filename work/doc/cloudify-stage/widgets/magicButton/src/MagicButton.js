import MagicModal from './MagicModal';

export default class extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
            open: false,
            loading: false,
            error: null,
            blueprints: {items:[]}
        }
    }

    _createDeployment(){
        this.setState({loading: true});

        var actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        console.log('调用_createDeployment');
        console.log(actions);
        actions.doGetBlueprints().then((blueprints)=>{
            console.log('调用doGetBlueprints成功');
            console.log(blueprints);
            this.setState({loading: false, error: null, blueprints, open: true});
        }).catch((err)=> {
            console.log('调用doGetBlueprints失败');
            this.setState({loading: false, error: err.message});
        });
    }

    _hideModal () {
        this.setState({open: false});
    }

    render() {
        let {Button, ErrorMessage} = Stage.Basic;
        let {DeleteConfirm, DeployBlueprintModal} = Stage.Common;

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                <Button color='orange' icon='add' content='魔术按钮点击变帅三秒' labelPosition='left' className='widgetButton'
                        loading={this.state.loading} onClick={this._createDeployment.bind(this)} />

                <MagicModal open={this.state.open} blueprints={this.state.blueprints}
                             onHide={this._hideModal.bind(this)} toolbox={this.props.toolbox}/>
            </div>
        );
    }
}