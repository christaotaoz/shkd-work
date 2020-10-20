/**
 * Created by liuhui on 04/06/2019.
 */

Stage.defineWidget({
    id: 'gatewayInterface',
    name: '网关接口',
    description: 'test baidu',
    initialWidth: 12,
    initialHeight: 2,
    color : 'red',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    hasStyle: false,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        {id: 'confText', name: 'Conf Item',  placeHolder: 'Configuration text item', default: 'Conf text', type: Stage.Basic.GenericField.STRING_TYPE}
    ],


    fetchUrl:  '[manager]/gatewayinterface',

    render: function(widget,data,error,toolbox) {
        let {KeyIndicator, Checkmark,DataTable,CopyToClipboardButton,Dropdown,Form,EditableLabel,ErrorMessage,
            ExecutionStatus,HighlightText,Loading,MetricFilter,NodeFilter,NodeInstancesFilter,NodesTree,ParameterValue,
            Popup,Label,PopupHelp,Icon,PopupMenu,Menu,ResourceVisibility,RevertToDefaultIcon,TimeFilter,TimePicker,VisibilityField


            } = Stage.Basic;

        let options = [
                      {text: 'Option 1', value: 'option1'},
                      {text: 'Option 2', value: 'option2'},
                      {text: 'Option 3', value: 'option3'}
                    ];
        let value = {blueprintId: '', deploymentId: '', nodeId: '', nodeInstance: ''}

        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }
        return data.items.map((item)=>{
            return <p>{item.id}</p>;
        });

        // return (

     // <DataTable selectable={true} className="deploymentTable">
     //
     //         <DataTable.Column label="Name" name="id" width="25%"/>
     //         <DataTable.Column label="Blueprint" name="blueprint_id" width="50%"/>
     //         <DataTable.Column label="Created" name="created_at" width="25%"/>

        // <DataTable.Row  >
        //              <DataTable.Data><a className='deploymentName' href="javascript:void(0)">aaa</a></DataTable.Data>
        //              <DataTable.Data>{data.items.id}</DataTable.Data>
        //              <DataTable.Data>bbb</DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row  >
        //             <DataTable.Data><a className='deploymentName' href="javascript:void(0)">vvv</a></DataTable.Data>
        //             <DataTable.Data><Checkmark value='true'/></DataTable.Data>
        //             <DataTable.Data>bbb</DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
        //             <DataTable.Data><CopyToClipboardButton text='WWWWWWW' content='WWWWWWW' /></DataTable.Data>
        //             <DataTable.Data><ErrorMessage header="没错" error="这不是一个错误" /></DataTable.Data>
        //             <DataTable.Data><HighlightText className="javascript" children={"if ( arguments.length == 0 ) \n   console.log('undefined');"}/></DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
        //             <DataTable.Data>
        //                 <Form  ref="createForm">
        //                     <Dropdown search selection options={options} value={options[0].value}/>
        //                 </Form>
        //             </DataTable.Data>
        //             <DataTable.Data>
        //             <EditableLabel isEditEnable='ture' text="Sample Text"/>
        //             </DataTable.Data>
        //             <DataTable.Data>
        //             <Loading />
        //             </DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
        //             <DataTable.Data>
        //                <MetricFilter name='metricFilter' value='' filterContextName='nodeFilter' />
        //             </DataTable.Data>
        //             <DataTable.Data>
        //                 <NodeFilter name='nodeFilter' value={value} />
        //             </DataTable.Data>
        //             <DataTable.Data>
        //                 <NodeInstancesFilter name='nodeFilter' value={[]} onChange={()=>{}} deploymentId='nodecellar' />
        //             </DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
        //             <DataTable.Data>
        //                 <NodesTree defaultExpandAll>
        //                     <NodesTree.Node title='root' key="0">
        //                             <NodesTree.Node title='1' key="1"></NodesTree.Node>
        //                             <NodesTree.Node title='2' key="2">
        //                                 <NodesTree.Node title='5' key="5"></NodesTree.Node>
        //                                 <NodesTree.Node title='6' key="6"></NodesTree.Node>
        //                             </NodesTree.Node>
        //                             <NodesTree.Node title='3' key="3"></NodesTree.Node>
        //                             <NodesTree.Node title='4' key="4">
        //                                 <NodesTree.Node title='7' key="7"></NodesTree.Node>
        //                             </NodesTree.Node>
        //                     </NodesTree.Node>
        //                 </NodesTree>
        //             </DataTable.Data>
        //             <DataTable.Data>
        //                 <ParameterValue value='aaaaa' />
        //             </DataTable.Data>
        //             <DataTable.Data>
        //                 <Popup>
        //                     <Popup.Trigger>
        //                         <Label icon="comment">Popup</Label>
        //                     </Popup.Trigger>
        //                       <div>Popupcontent</div>
        //                 </Popup>
        //             </DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
        //             <DataTable.Data>
        //                 <PopupHelp trigger={<Icon name='help' />} content={'Help information'}/>
        //             </DataTable.Data>
        //             <DataTable.Data>
        //                 <PopupMenu>
        //                     <Menu pointing vertical>
        //                         <Menu.Item icon='users' content="Edit group's users" name='users' />
        //                         <Menu.Item icon='user' content="Edit group's tenants" name='tenants' />
        //                         <Menu.Item icon='trash' content='Delete' name='delete' />
        //                     </Menu>
        //                 </PopupMenu>
        //             </DataTable.Data>
        //             <DataTable.Data>
        //                 <ResourceVisibility visibility='private'/>
        //                 <ResourceVisibility visibility='tenant'/>
        //                 <ResourceVisibility visibility='global'/>
        //             </DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
                    // <DataTable.Data>
                    //      <Form.Input icon={<RevertToDefaultIcon value='a' defaultValue='b' /> } value='c' />
                    // </DataTable.Data>
                    // <DataTable.Data>
                    //     <TimeFilter name='timeFilter' defaultValue={TimeFilter.EMPTY_VALUE} />
                    // </DataTable.Data>
                    // <DataTable.Data>
                        // <TimePicker
                        // name='scheduledTime'
                        // defaultValue=''
                        // minDate={moment()} maxDate={moment().add(1, 'Y')}
                        // onChange={(event, field) => this.setState({scheduledTime: field.value, queue: false})}
                        // />
        //             </DataTable.Data>
        // </DataTable.Row>
        // <DataTable.Row>
        //             <DataTable.Data>
        //                 <VisibilityField visibility="a" disallowGlobal='true' className='ANY_CLASS_NAME'/>
        //             </DataTable.Data>
        //             <DataTable.Data>
        //
        //             </DataTable.Data>
        //             <DataTable.Data>
        //
        //             </DataTable.Data>
        // </DataTable.Row>

// </DataTable>
//     );
    }
}
);
