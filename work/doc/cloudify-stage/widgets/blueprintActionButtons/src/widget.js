/**
 * Created by jakubniezgoda on 28/02/2017.
 */

import BlueprintActionButtons from './BlueprintActionButtons';

Stage.defineWidget({
    id: 'blueprintActionButtons',
    name: '模版操作按钮',
    description: '提供模版操作的按钮',
    initialWidth: 3,
    initialHeight: 5,
    showHeader: false,
    showBorder: false,
    initialConfiguration: [],
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('blueprintActionButtons'),
    categories: [Stage.GenericConfig.CATEGORY.BLUEPRINTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    fetchData: function(widget,toolbox) {
        let blueprintId = toolbox.getContext().getValue('blueprintId');

        if (!_.isEmpty(blueprintId)) {
            toolbox.loading(true);
            return toolbox.getManager().doGet(`/blueprints/${blueprintId}`)
                .then(blueprint => {
                    toolbox.loading(false);
                    return Promise.resolve(blueprint);
                });
        }

        return Promise.resolve(BlueprintActionButtons.EMPTY_BLUEPRINT);
    },

    fetchParams: function(widget, toolbox) {
        let blueprintId = toolbox.getContext().getValue('blueprintId');

        return {blueprint_id: blueprintId};
    },

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }


        return (
            <BlueprintActionButtons blueprint={data} widget={widget} toolbox={toolbox} />
        );
    }
});