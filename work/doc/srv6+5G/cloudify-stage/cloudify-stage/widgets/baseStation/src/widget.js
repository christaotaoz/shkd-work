import BaseStationButton from './BaseStationButton';

Stage.defineWidget({
    id: 'baseStation',
    name: 'baseStation',
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
        return <BaseStationButton toolbox={toolbox}/>
    }
});

