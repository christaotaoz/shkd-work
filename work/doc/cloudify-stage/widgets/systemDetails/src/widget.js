Stage.defineWidget({
    id: 'systemDetails',
    name: 'systemDetails',
    description: 'test systemDetails',
    initialWidth: 2,
    initialHeight: 3,
    showHeader: false,
    showBorder: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    render: function(widget,data,error,toolbox) {
        const {DataTable,Button} = Stage.Basic;
        return (
            <div>
                <Button color="violet" icon='add' content='Hinoc网络' labelPosition='left' className='widgetButton' onClick={()=> ''} />
            </div>
        )}

});

