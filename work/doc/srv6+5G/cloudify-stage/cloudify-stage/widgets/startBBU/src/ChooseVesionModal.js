import React from "react";
import {Form} from "../../../app/components/basic";

export default class ChooseVesionModal extends React.Component {
    constructor(props,context) {
        super(props,context);
        this.state = ChooseVesionModal.initialState;

    }

    static initialState = {
        open:true,
        loading: false,
        role: '',
        errors: {},
        value: '2.5',

    };
    onHide() {
        this.props.open = false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    onApprove () {
        let executionActions = new Stage.Common.ExecutionActions(this.props.toolbox);
        if ( this.state.value === '2.5'){
            window.alert('当前选择基站版本是2.5G');
        }
        if ( this.state.value === '2.6'){
            window.alert('当前选择基站版本是2.6G');
            this.props.onCallable();
            this.props.toolbox.getManager().doPost('/executions',null,{
                'deployment_id': 'bbu26d',
                'workflow_id' : 'install',
            })
			.then((exe)=>{
                console.log(exe.id);
                executionActions.waitUntilFinished(exe.id,2000)
                    .then((res)=>{
                        console.log(res);
                        if(res[0].status === 'terminated'){
                            window.alert('启动BBU完成');
                            this.props.onCallable();
                        }
                    });
            });
        }
        if ( this.state.value === '3.5'){
            window.alert('当前选择基站版本是3.5G');
            this.props.onCallable();
            this.props.toolbox.getManager().doPost('/executions',null,{
                'deployment_id': 'bbu36d',
                'workflow_id' : 'install',
            })
			.then((exe)=>{
                console.log(exe.id);
                executionActions.waitUntilFinished(exe.id,2000)
                    .then((res)=>{
                        console.log(res);
                        if(res[0].status === 'terminated'){
                            window.alert('启动BBU完成');
                            this.props.onCallable();
                        }
                    });
            });
        }
        this.props.onHide();
        return true;
    }

    _handleInputChange(proxy, field) {
        const {name,value,type} = field;
        this.setState({value:value});
    }

     render() {
        let {ApproveButton, CancelButton, Form, Icon, Modal} = Stage.Basic;
        let options = [
              {text: '2.5G基站', value: '2.5'},
              {text: '2.6G基站', value: '2.6'},
              {text: '3.5G基站', value: '3.5'}
            ];
         return (
                <Modal open={this.props.open} onClose={()=>this.onHide()} >
                    <Modal.Header>
                        <Icon name="question circle outline"/> 选择基站版本
                    </Modal.Header>

                    <Modal.Content>
                        <Form loading={this.state.loading} errors={this.state.errors}
                              onErrorsDismiss={() => this.setState({errors: {}})}>
                            <Form.Field error={this.state.errors.role}>
                                <Form.Dropdown selection
                                               search
                                               name='role'
                                               options={options}
                                               value={this.state.value}
                                               onChange={this._handleInputChange.bind(this)}/>
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                        <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} icon="save" color="green" />
                    </Modal.Actions>
                </Modal>
         );
     }
}