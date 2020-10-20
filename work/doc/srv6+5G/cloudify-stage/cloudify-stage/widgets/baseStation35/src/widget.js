import BaseStationButton35 from './BaseStationButton35';

Stage.defineWidget({
    id: 'baseStation35',
    name: 'baseStation35',
    description: 'test synchronization',
    initialWidth: 2,
    initialHeight: 3,
    showHeader: false,
    showBorder: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    render: function(widget,data,error,toolbox) {
        return <BaseStationButton35 toolbox={toolbox}/>
    }
});

