Stage.defineWidget({
    id: 'backupSettings',
    name: 'backupSettings',
    description: 'test backupSettings',
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
                <Button color="violet" icon='add' content='配置传输资源' labelPosition='left' className='widgetButton'
                       onClick={()=>window.alert('正在配置传输资源')} />
            </div>
        )
    }
});

