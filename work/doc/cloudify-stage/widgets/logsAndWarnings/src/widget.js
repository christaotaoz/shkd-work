Stage.defineWidget({
    id: 'logsAndWarnings',
    name: 'logsAndWarnings',
    description: 'test logsAndWarnings',
    initialWidth: 800,
    initialHeight: 800,
    color : 'red',
    showHeader: true,
    isReact: true,
    hasReadme: true,

    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(1),
    ],

    render: function(widget,data,error,toolbox) {
        const {DataTable,Button} = Stage.Basic;
        return (
            <div>
                <iframe src="http://192.168.16.226:34567"
                    height="700"
                    width="1600"
                    frameBorder="0"
                    >
                </iframe>
            </div>
        )
    }
});

