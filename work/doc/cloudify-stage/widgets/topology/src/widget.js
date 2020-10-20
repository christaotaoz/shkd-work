/**
 * Created by kinneretzin on 07/09/2016.
 */

import Topology from './Topology';
import DataFetcher from './DataFetcher';

Stage.defineWidget({
    id: 'topology',
    name: "拓扑图",
    description: '显示模版和部署拓扑图',
    initialWidth: 8,
    initialHeight: 16,
    color: "yellow",
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('topology'),
    hasStyle: true,
    categories: [Stage.GenericConfig.CATEGORY.BLUEPRINTS],
    
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(10),
        {id: 'enableNodeClick', name: '节点使能', default:true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: 'enableGroupClick', name: '组使能', default:true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: 'enableZoom', name: '缩放使能', default:true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: 'enableDrag', name: '拖拽使能', default:true, type: Stage.Basic.GenericField.BOOLEAN_TYPE},
        {id: 'showToolbar', name: '工具条可见', default:true, type: Stage.Basic.GenericField.BOOLEAN_TYPE}
    ],

    fetchData: function(widget,toolbox) {
        var deploymentId = toolbox.getContext().getValue('deploymentId');
        var blueprintId = toolbox.getContext().getValue('blueprintId');

        return DataFetcher.fetch(toolbox,blueprintId,deploymentId);
    },

    render: function(widget,data,error,toolbox) {
        var topologyConfig = {
            enableNodeClick: widget.configuration.enableNodeClick,
            enableGroupClick: widget.configuration.enableGroupClick,
            enableZoom: widget.configuration.enableZoom,
            enableDrag: widget.configuration.enableDrag,
            showToolbar: widget.configuration.showToolbar
        };

        var deploymentId = toolbox.getContext().getValue('deploymentId');
        var blueprintId = toolbox.getContext().getValue('blueprintId');

        var formattedData = Object.assign({},data,{
            deploymentId,
            blueprintId,
            topologyConfig
        });
        return <Topology widget={widget} data={formattedData} toolbox={toolbox}/>;

    }

});