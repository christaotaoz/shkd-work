/**
 * Created by pawelposel on 04/11/2016.
 */

Stage.defineWidget({
    id: 'pluginsNum',
    name: '插件数量',
    description: '显示插件数量',
    initialWidth: 2,
    initialHeight: 8,
    color : 'yellow',
    showHeader: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('pluginsNum'),
    categories: [Stage.GenericConfig.CATEGORY.CHARTS_AND_STATISTICS],
    
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(30),
        {id: 'page', name: 'Page to open on click', description: 'Page to open when user clicks on widget content',
            type: Stage.Basic.GenericField.CUSTOM_TYPE, default: 'system_resources', component: Stage.Basic.PageFilter}
    ],
    fetchUrl: '[manager]/plugins?_include=id&_size=1',

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        const {KeyIndicator, Link} = Stage.Basic;

        const num = _.get(data, 'metadata.pagination.total', 0);
        const to = widget.configuration.page ? `/page/${widget.configuration.page}` : '/';

        return (
            <Link to={to}>
                <KeyIndicator title="业务运营" icon="plug" />
            </Link>
        );
    }
});