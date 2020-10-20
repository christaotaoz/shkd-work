/**
 * Created by pposel on 07/02/2017.
 */

import EventFilter from './EventFilter';

Stage.defineWidget({
    id: 'eventsFilter',
    name: "事件/日志 过滤器",
    description: '为事件/日志添加筛选过滤器',
    initialWidth: 12,
    initialHeight: 5,
    color: "pink",
    showHeader: false,
    showBorder: false,
    categories: [Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('eventsFilter'),
    initialConfiguration: [],

    render: function(widget,data,error,toolbox) {
        return (
            <EventFilter data={data} toolbox={toolbox}/>
        );
    }
});