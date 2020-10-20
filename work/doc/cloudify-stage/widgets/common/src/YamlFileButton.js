/**
 * Created by jakubniezgoda on 05/07/2018.
 * Cranslate by woody on 29/10/2019
 */

class YamlFileButton extends React.Component {

    constructor(props,context) {
        super(props,context);
    }

    static propTypes = {
        dataType: PropTypes.string,
        fileLoading: PropTypes.bool,
        onChange: PropTypes.func,
    };

    static defaultProps = {
        dataType: 'values',
        fileLoading: false,
        onChange: _.noop
    };

    render () {
        let {Form} = Stage.Basic;

        return (
            <Form.File name='yamlFile' showInput={false} showReset={false}
                       openButtonParams={{className: 'rightFloated', content: '加载数据', labelPosition: 'left'}}
                       onChange={this.props.onChange}
                       help={`您可以使用YAML文件，来自动填写表单.`}
                       loading={this.props.fileLoading} disabled={this.props.fileLoading} />
        );
    }
}

Stage.defineCommon({
    name: 'YamlFileButton',
    common: YamlFileButton
});