Stage.defineWidget({
    id: 'systemUpgrade',
    name: 'systemUpgrade',
    description: 'test systemUpgrade',
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


                <a href="http://192.168.4.82:34567" >
                    <Button color="violet" icon='add' content='系统升级' labelPosition='left' className='widgetButton'
                       onClick={()=> ''}/>
                </a>

            </div>
        )
    }
});

