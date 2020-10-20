
import React from "react";
import ChooseVesionModal from "./ChooseVesionModal";

export default  class StartBBUButton extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isCallable:false,
            open:false,
        };

    }
    onShow() {
        this.setState({open: true});
    }

    _hideModal () {
        this.setState({open: false});
    }
    onCallable () {
        if (this.state.isCallable === false)
        {this.setState({isCallable:true});}
        if (this.state.isCallable === true)
        {this.setState({isCallable:false});}
    }
    render(){
        const {Button} = Stage.Basic;

        return(
            <div>
                <Button
                    disabled={this.state.isCallable}
                    content={!this.state.isCallable ? '启动BBU' :'正在启动中..'}
                    className='widgetButton'
                    color="violet"
                    icon='sync'
                    labelPosition='left'
                    onClick={this.onShow.bind(this)}
                />
                <ChooseVesionModal open={this.state.open} toolbox={this.props.toolbox} onHide={this._hideModal.bind(this)} onCallable={this.onCallable.bind(this)}/>
            </div>
        );
    }
}
