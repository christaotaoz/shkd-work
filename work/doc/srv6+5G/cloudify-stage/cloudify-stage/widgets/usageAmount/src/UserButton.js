/**
 * Created by woody on 25/08/2019.
 */
export default class UserButton extends React.Component {
    static UPDATE_ACTION = 'edit';
    static DELETE_ACTION = 'delete';
    static WORKFLOW_ACTION = 'workflow';

    constructor(props, context) {
        super(props, context);
        this.state = {
            showDeploymentModal: false,
            showModal: false,
            modalType: '',
            loading: false,
            blueprint: {},
            deployment:{},
            error: null,
            inputField:'',
            item: {id: ''},
            confirmDelete:false,
            force: false

        }
    }




    _isShowModal(type) {
        return this.state.modalType === type && this.state.showModal;
    }

    _hideModal() {
        this.setState({showModal: false});
    }


    _setValue(item,result){
        let user_name = _.get(item, 'id', '');
        if(_.get(item, 'user_group', '')){}
            else{_.set(item, 'user_group', 'low_speed')}
        let user_group = _.get(item, 'user_group', '');


        if (_.has(result, 'inputs.password')){
            _.set(result, 'inputs.password',"88888888");
                 };
        if (_.has(result, 'inputs.user_name')){
            _.set(result, 'inputs.user_name',user_name);
                };
        if (_.has(result, 'inputs.groupname')){
            _.set(result, 'inputs.groupname',user_group);
                };

    }

    DeleteUser(item){
        let user_name = (_.get(item, 'id', ''))
        console.log(user_name)
        let deploymentId = "delete_user";
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`)
        deployment.then((result)=>{
            _.unset(result,['inputs',this.state.inputField]);
            this._setValue(item,result);
            this.setState({deployment:result});
            this.setState({modalType: UserButton.DELETE_ACTION, showModal: true});
        })
    }


    UpdateUser(item){
        let deploymentId = "update_user";
        let deployment =  this.props.toolbox.getManager().doGet(`/deployments/${deploymentId}`)
        deployment.then((result)=>{
            _.unset(result,['inputs',this.state.inputField]);
            this._setValue(item,result);
            this.setState({deployment:result});
            this.setState({modalType: UserButton.UPDATE_ACTION, showModal: true});
        })
    }


    render(){
        const {DataTable,Button} = Stage.Basic;
        let {DeleteUser,UpdateUser} = Stage.Common;

        let toolbox = this.props.toolbox;
        let item = this.props.data;

        return(
            <div>
                <i className="redo icon link bordered" title="更新"
                    onClick={(event)=>{event.stopPropagation();this.UpdateUser(item)}}></i>
                <i  className="trash icon link bordered"
                    title="账号删除"
                    onClick={(event)=>{event.stopPropagation();this.DeleteUser(item)}}></i>
                <DeleteUser open={this._isShowModal(UserButton.DELETE_ACTION)}
                                       deployment={this.state.deployment}
                                       inputField={this.state.inputField}
                                       onHide={this._hideModal.bind(this)}
                                       toolbox={this.props.toolbox}/>
                <UpdateUser open={this._isShowModal(UserButton.UPDATE_ACTION)}
                                       deployment={this.state.deployment}
                                       inputField={this.state.inputField}
                                       onHide={this._hideModal.bind(this)}
                                       toolbox={this.props.toolbox}/>

        </div>
            )


        }
}

