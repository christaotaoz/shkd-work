/**
 * Created by jakubniezgoda on 22/05/2018.
 */

Stage.defineWidget({
    id: 'blueprintNum',
    name: '模板数量',
    description: '模板的数量',
    initialWidth: 2,
    initialHeight: 8,
    color : 'blue',
    showHeader: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('blueprintNum'),
    categories: [Stage.GenericConfig.CATEGORY.BLUEPRINTS, Stage.GenericConfig.CATEGORY.CHARTS_AND_STATISTICS],
    
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(10),
        {id: 'page', name: '本地模板', description: '本地模板',
         type: Stage.Basic.GenericField.CUSTOM_TYPE, default: 'local_blueprints', component: Stage.Basic.PageFilter}
    ],
    fetchUrl: '[manager]/blueprints?_include=id&_size=1',

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        const {KeyIndicator, Link} = Stage.Basic;

        const num = _.get(data, 'metadata.pagination.total', 0);
        const to = widget.configuration.page ? `/page/5_go_c状态` : '/';
        // const to = widget.configuration.page ? `/page/${widget.configuration.page}` : '/';

        return (
            <Link to={to}>
                <KeyIndicator title="5GoC状态" icon="signal"/>
            </Link>
        );
    }
});
