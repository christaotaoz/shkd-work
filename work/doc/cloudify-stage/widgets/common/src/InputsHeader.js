/**
 * Created by jakubniezgoda on 16/10/2018.
 * Cranslate by woody on 29/10/2019
 */

class InputsHeader extends React.Component {

    constructor(props,context) {
        super(props,context);
    }

    static propTypes = {
        compact: PropTypes.bool,
        dividing: PropTypes.bool,
        header: PropTypes.string
    };

    static defaultProps = {
        compact: false,
        dividing: true,
        header: '部署输入'
    };

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(this.props, nextProps);
    }

    render () {
        let {Form, Header, List, PopupHelp} = Stage.Basic;

        let HeaderWithDescription = () =>
            <Header size="tiny" charSet="utf-8">
                {this.props.header}
                <Header.Subheader>
                    查看值输入详细信息:&nbsp;
                    <PopupHelp flowing header='数值类型' content={
                        <div>
                            值被转换为类型,例如:
                            <List bulleted>
                                <List.Item><strong>[1, 2]</strong> 将被转化成一个数组</List.Item>
                                <List.Item><strong>524</strong>将被转化成一个数字</List.Item>
                            </List>
                            使用<strong>"</strong>包裹的值 将它显式地声明为字符串，例如:
                            <List bulleted>
                                <List.Item><strong>{'"{"a":"b"}"'}</strong> 将作为字符串而不是对象</List.Item>
                                <List.Item><strong>{'"true"'}</strong> 将作为字符串而不是布尔值发送</List.Item>
                            </List>
                            使用 <strong>""</strong> 空字符串。
                        </div>
                    } />
                </Header.Subheader>
            </Header>;

        return this.props.dividing
            ?
                <Form.Divider style={this.props.compact ? {marginTop: 0} : {}}>
                    <HeaderWithDescription />
                </Form.Divider>
            :
                <HeaderWithDescription />
    }
}

Stage.defineCommon({
    name: 'InputsHeader',
    common: InputsHeader
});