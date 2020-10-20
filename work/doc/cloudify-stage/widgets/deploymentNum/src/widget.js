/**
 * Created by pawelposel on 03/11/2016.
 */

Stage.defineWidget({
    id: "deploymentNum",
    name: "部署数量",
    description: '显示部署数量',
    initialWidth: 2,
    initialHeight: 8,
    color : "green",
    showHeader: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('deploymentNum'),
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.CHARTS_AND_STATISTICS],
    
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(10),
        {id: 'page', name: '部署', description: '部署',
         type: Stage.Basic.GenericField.CUSTOM_TYPE, default: 'deployments', component: Stage.Basic.PageFilter}
    ],
    fetchUrl: '[manager]/deployments?_include=id&_size=1',

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        const {KeyIndicator, Link} = Stage.Basic;

        const num = _.get(data, 'metadata.pagination.total', 0);
        const to = widget.configuration.page ? `/page/${widget.configuration.page}` : '/';

        return (
            <Link to={to}>
                <KeyIndicator title="设备功能部署" icon="cube"/>
            </Link>
        );
    }
});
