/**
 * Created by jakubniezgoda on 07/11/2018.
 */

class DeleteConfirm extends React.Component {

    constructor(props,context) {
        super(props,context);
    }

    static propTypes = {
        resourceName: PropTypes.string.isRequired,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        loading: PropTypes.bool,
        className: PropTypes.string,
        force: PropTypes.bool,
        onForceChange: PropTypes.func
    };

    static defaultProps = {
        className: '',
        force: false,
        onForceChange: _.noop
    };

    render () {
        let {Confirm, Form, Segment} = Stage.Basic;

        return <Confirm className={this.props.className}
                        header={`是否移除 ${this.props.resourceName}?`}
                        content={
                            <Segment basic loading={this.props.loading}>
                                <Form.Field hidden>
                                    <Form.Checkbox name='force' toggle label='Force'
                                                   checked={this.props.force}
                                                   onChange={this.props.onForceChange} />
                                </Form.Field>
                            </Segment>
                        }
                        open={this.props.open}
                        onConfirm={this.props.onConfirm}
                        onCancel={this.props.onCancel} />
    }
}

Stage.defineCommon({
    name: 'DeleteConfirm',
    common: DeleteConfirm
});