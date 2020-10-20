import WebAppFirewallTable from "./WebAppFirewallTable";

/**
 * Created by zhengqin on 08/25/2019.
 */

Stage.defineWidget({
    id: 'webAppFirewall',
    name: '弹窗限制',
    description: '显示弹窗限制信息',
    initialWidth: 800,
    initialHeight: 800,
    color : 'green',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],

    initialConfiguration: [
        Stage.GenericConfig.PAGE_SIZE_CONFIG(5),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('id'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(true)
    ],

    fetchUrl:'[manager]/web_app_firewall[params]',

    _processData(data,toolbox) {
        return Object.assign({}, data, {
            total: _.get(data, 'metadata.pagination.total', 0)
        });
    },

    render: function(widget,data,error,toolbox) {
       if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
       }

       var formattedData = this._processData(data,toolbox);
       return (
                <WebAppFirewallTable widget={widget} data={formattedData} toolbox={toolbox}/>
              );
    }
});

