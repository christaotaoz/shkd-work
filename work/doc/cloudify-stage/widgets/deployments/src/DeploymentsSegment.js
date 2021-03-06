/**
 * Created by kinneretzin on 18/10/2016.
 */

import MenuAction from './MenuAction';
import DeploymentUpdatedIcon from './DeploymentUpdatedIcon';

export default class DeploymentsSegment extends React.Component {

    static propTypes = {
        data: PropTypes.object.isRequired,
        widget: PropTypes.object.isRequired,
        fetchData: PropTypes.func,
        onSelectDeployment: PropTypes.func,
        onShowLogs: PropTypes.func,
        onShowUpdateDetails: PropTypes.func,
        onActOnExecution: PropTypes.func,
        onMenuAction: PropTypes.func,
        onError: PropTypes.func,
        onSetVisibility: PropTypes.func,
        allowedSettingTo: PropTypes.array,
        noDataMessage: PropTypes.string,
        showExecutionStatusLabel: PropTypes.bool
    };

    static defaultProps = {
        fetchData: ()=>{},
        onSelectDeployment: ()=>{},
        onShowLogs: ()=>{},
        onShowUpdateDetails: ()=>{},
        onActOnExecution: ()=>{},
        onMenuAction: ()=>{},
        onError: ()=>{},
        onSetVisibility: ()=>{},
        allowedSettingTo: ['tenant', 'global'],
        noDataMessage: '',
        showExecutionStatusLabel: false
    };

    render() {
        let {DataSegment, Divider, Grid, Header, ResourceVisibility} = Stage.Basic;
        let {NodeInstancesConsts, LastExecutionStatusIcon} = Stage.Common;

        return (
            <DataSegment totalSize={this.props.data.total}
                         pageSize={this.props.widget.configuration.pageSize}
                         fetchData={this.props.fetchData}
                         searchable={true}
                         noDataMessage={this.props.noDataMessage}>
                {
                    this.props.data.items.map((item) => {
                        return (
                            <DataSegment.Item key={item.id} selected={item.isSelected} className={item.id}
                                              onClick={()=>this.props.onSelectDeployment(item)}>

                                <Grid stackable>
                                    <Grid.Row>
                                        <Grid.Column width={4}>
                                            <LastExecutionStatusIcon execution={item.lastExecution}
                                                                     onShowLogs={() => this.props.onShowLogs(item.id, item.lastExecution.id)}
                                                                     onShowUpdateDetails={this.props.onShowUpdateDetails}
                                                                     onActOnExecution={this.props.onActOnExecution}
                                                                     showLabel={this.props.showExecutionStatusLabel} />
                                            <ResourceVisibility visibility={item.visibility} className='rightFloated'
                                                                onSetVisibility={(visibility) =>
                                                                    this.props.onSetVisibility(item.id, visibility)}
                                                                allowedSettingTo={this.props.allowedSettingTo} />
                                            {
                                                this.props.showExecutionStatusLabel &&
                                                <Divider hidden />
                                            }
                                            <Header as='h3' textAlign='center'
                                                    style={this.props.showExecutionStatusLabel ? {} : {marginTop: 5}}>
                                                <a href="javascript:void(0)" className="breakWord">{item.id}</a>
                                            </Header>
                                        </Grid.Column>

                                        <Grid.Column width={3}>
                                            <Header as='h5'>模板</Header>
                                            <span>{item.blueprint_id}</span>
                                        </Grid.Column>

                                        <Grid.Column width={2}>
                                            <Header as='h5'>创建时间</Header>
                                            <span>{item.created_at}
                                            <DeploymentUpdatedIcon deployment={item} /></span>
                                        </Grid.Column>

                                        <Grid.Column width={2}>
                                            <Header as='h5'>创建者</Header>
                                            <span>{item.created_by}</span>
                                        </Grid.Column>

                                        <Grid.Column width={4}>
                                            <Header as='h5'>节点实例 ({item.nodeInstancesCount})</Header>
                                            <Grid columns={4}>
                                                <Grid.Row>
                                                {
                                                    _.map(NodeInstancesConsts.groupStates, (groupState) =>
                                                        <Grid.Column key={groupState.name} textAlign='center'>
                                                            <NodeState icon={groupState.icon} title={groupState.name}
                                                                       state={_.join(groupState.states, ', ')}
                                                                       color={groupState.colorSUI}
                                                                       value={_.sum(_.map(groupState.states, (state) =>
                                                                           _.isNumber(item.nodeInstancesStates[state])
                                                                               ? item.nodeInstancesStates[state]
                                                                               : 0))} />
                                                        </Grid.Column>
                                                    )
                                                }
                                                </Grid.Row>
                                            </Grid>
                                        </Grid.Column>

                                        <Grid.Column width={1}>
                                            <MenuAction item={item} onSelectAction={this.props.onMenuAction}/>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>

                            </DataSegment.Item>
                        );
                    })
                }

            </DataSegment>
        );
    }
}

function NodeState(props) {
    let { Segment, Icon, Popup } = Stage.Basic;
    let value = props.value ? props.value : 0;
    let disabled = value === 0;
    let color = disabled ? 'grey' : props.color;
    const areManyStates = _.size(_.words(props.state)) > 1;

    return (
        <Popup header={_.capitalize(props.title)}
               content={<span><strong>{value}</strong> 节点实例在 <strong>{props.state}</strong> state{areManyStates && 's'}</span>}
               trigger={
                   <Segment.Group className='nodeState' disabled={disabled}>
                       <Segment color={color} disabled={disabled} inverted>
                           <Icon name={props.icon} />
                       </Segment>
                       <Segment color={color} disabled={disabled} tertiary inverted>
                           {value}
                       </Segment>
                   </Segment.Group>
               }
        />
    )
}