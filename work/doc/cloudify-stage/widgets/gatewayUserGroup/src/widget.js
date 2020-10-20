/**
 * Created by jakubniezgoda on 22/05/2018.
 */


import UserGroupTable from "./UserGroupTable";

Stage.defineWidget({
    id: 'gatewayUserGroup',
    name: '网关用户组',
    description: '网关用户组列表',
    initialWidth: 2,
    initialHeight: 4,
    color : 'orange',
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

    // fetchUrl: '[manager]/user_groups',
    fetchData(widget,toolbox,params) {
        return toolbox.getManager().doGet('/user_groups',params)
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
         return <UserGroupTable widget={widget} data={formattedData} toolbox={toolbox}/>
    }
});