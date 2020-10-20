/**
 * Created by Tamer on 14/08/2017.
 */

import MyResourcesCheckbox from './MyResourcesCheckbox';

Stage.defineWidget ({
  id: 'onlyMyResources',
  name: '我的资源',
  description: '展示我的资源复选框（插件、快照、模板、开发）',
  initialWidth: 12,
  initialHeight: 4,
  color: 'yellow',
  showHeader: false,
  showBorder: false,
  isReact: true,
    hasReadme: true,
  permission: Stage.GenericConfig.WIDGET_PERMISSION('onlyMyResources'),

  render: function (widget, data, error, toolbox) {
    return <MyResourcesCheckbox widget={widget} toolbox={toolbox} />;
  },
});
