import IperfButton from './IperfButton';

Stage.defineWidget({
    id: 'managementAccount',
    name: 'managementAccount',
    description: 'test managementAccount',
    initialWidth: 2,
    initialHeight: 3,
    showHeader: false,
    showBorder: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    //
    fetchUrl: '[manager]/events[params]',

    render: function(widget,data,error,toolbox) {
        return <IperfButton toolbox={toolbox} data={data}/>
    }
});

