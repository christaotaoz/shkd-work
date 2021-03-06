/**
 * Created by Tamer on 30/07/2017.
 */

import Actions from './Actions';
import PluginsCatalogList from './PluginsCatalogList';

Stage.defineWidget ({
  id: 'pluginsCatalog',
  name: '插件目录',
  description: '展示插件目录',
  initialWidth: 12,
  initialHeight: 20,
  color: 'teal',
  isReact: true,
  hasReadme: true,
  permission: Stage.GenericConfig.WIDGET_PERMISSION('pluginsCatalog'),
  initialConfiguration: [
    {
      id: 'jsonPath',
      name: 'Plugins Catalog JSON Source',
      placeHolder: '输出json路径',
      default: '//repository.cloudifysource.org/cloudify/wagons/plugins.json',
      type: Stage.Basic.GenericField.STRING_TYPE,
    },
    {
      id: 'sortByName', name: 'Sort by name',
      description: 'If set to true, then plugins will be sorted by name.',
      default: false,
      type: Stage.Basic.GenericField.BOOLEAN_TYPE
    }
  ],

  /**
   * fetch data from source
   * 
   * @param {any} widget 
   * @param {any} toolbox 
   * @param {any} params 
   * @returns 
   */
  fetchData (widget, toolbox, params) {
    let actions = new Actions ({
      toolbox,
      ...widget.configuration,
    });

    return actions.doGetPluginsList ();
  },

  /**
   * render widget
   * 
   * @param {any} widget 
   * @param {any} data 
   * @param {any} error 
   * @param {any} toolbox 
   * @returns 
   */
  render: function (widget, data, error, toolbox) {
    if (_.isEmpty (data)) {
      return <Stage.Basic.Loading />;
    }

    let actions = new Actions ({
      toolbox,
      ...widget.configuration,
    });

    if (_.get(widget.configuration, 'sortByName', false)) {
      data = _.sortBy(data, 'title');
    }

    return (
      <PluginsCatalogList
        widget={widget}
        items={data}
        toolbox={toolbox}
        actions={actions}
      />
    );
  },
});
