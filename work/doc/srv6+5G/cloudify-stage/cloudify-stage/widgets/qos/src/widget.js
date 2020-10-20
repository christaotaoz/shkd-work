/**
 * Created by jakubniezgoda on 22/05/2018.
 */

import QosRuleTable from "./QosRuleTable";

Stage.defineWidget({
    id: 'qos',
    name: 'qos规则',
    description: 'qos规则列表',
    initialWidth: 2,
    initialHeight: 4,
    color : 'blue',
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],

    initialConfiguration: [
        // Stage.GenericConfig.POLLING_TIME_CONFIG(3600),
        Stage.GenericConfig.PAGE_SIZE_CONFIG(5),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('id'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(true)
    ],

    fetchParams: (widget, toolbox) =>
        toolbox.getContext().getValue('onlyMyResources') ? {created_by: toolbox.getManager().getCurrentUsername()} : {},

    // fetchUrl: '[manager]/qos',
    fetchData(widget,toolbox,params) {
        return toolbox.getManager().doGet('/qos',params)
    },

    _processData(data,toolbox) {
        return Object.assign({}, data, {
            total: _.get(data, 'metadata.pagination.total', 0)
        });
    },

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

         let formattedData = this._processData(data,toolbox);
         return <QosRuleTable widget={widget} data={formattedData} toolbox={toolbox}/>
    }
});