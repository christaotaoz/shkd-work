import BlueprintsList from "../../blueprints/src/BlueprintsList";
import FirewallTable from "./FirewallTable";

/**
 * Created by zhengqin on 08/25/2019.
 */

Stage.defineWidget({
    id: 'firewall',
    name: '防火墙',
    description: '显示防火墙策略',
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
        Stage.GenericConfig.SORT_COLUMN_CONFIG('policy_number'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(true)
    ],

    fetchUrl:'[manager]/firewall[params]',

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
                <FirewallTable widget={widget} data={formattedData} toolbox={toolbox}/>
               );
    }
});

