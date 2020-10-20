import React from "react";
import {Form} from "../../../app/components/basic";
import ErrorCausesIcon from "../../events/src/ErrorCausesIcon";

export default class IperfModal extends React.Component {
    constructor(props,context) {
        super(props,context);
        this.state = IperfModal.initialState;

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

    }

    _handleInputChange(proxy, field) {
        const {name,value,type} = field;
        this.setState({value:value});
    }

    fetchGridData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }

    render() {
        let {ApproveButton,DataTable, CancelButton, Form, Icon, Modal,Popup,HighlightText} = Stage.Basic;
        let {Json} = Stage.Utils;
        const NO_DATA_MESSAGE = '当前没有 事件/日志。';

        if (_.isEmpty(this.props.data)) {
            return <Stage.Basic.Loading/>;
        } else{
            return (
                <Modal open={this.props.open} onClose={()=>this.onHide()} >
                    <Modal.Header>
                        <Icon name="question circle outline"/> Iperf测试
                    </Modal.Header>

                    <Modal.Content >
                        <DataTable  fetchData={this.fetchGridData.bind(this)} noDataMessage={NO_DATA_MESSAGE}>
                             <DataTable.Column label="测试结果"/>
                             {
                                 this.props.data.items.map((item, index) => {
                                    if (this.props.id === item.execution_id && item.message.indexOf('shell_result.stdout') > 0){

                                        let target_str = item.message.replace('<out>     "shell_result.stdout": ','').trim();
                                        let targetStr = target_str.replace(new RegExp('"','g'),'');
                                        let target_array = targetStr.split('\\n');

                                        console.log('my stdout test');
                                        console.log(item);
                                        console.log(index);
                                        console.log(target_array.length);
                                        console.log(this.props.id);
                                        console.log(item.execution_id);
                                        console.log('my stdout test');

                                        return target_array.map(function (e,i,err) {
                                            return (
                                                <DataTable.Row  key={ i }>
                                                    <DataTable.Data className="alignCenter noWrap">{e}</DataTable.Data>
                                                </DataTable.Row>
                                             )
                                        })
                                    }
                                })
                            }
                        </DataTable>
                    </Modal.Content>

                    <Modal.Actions>
                        <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    </Modal.Actions>
                </Modal>
         );
        }


     }
}