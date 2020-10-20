/**
 * Created by woody on 06/11/2019.
 */

import TemplateButtons from './TemplateButtons';

Stage.defineWidget({
    id: 'init',
    name: '初始化按钮',
    description: '提供初始化操作的按钮',
    color : 'orange',
    showHeader: true,
    showBorder: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],


    render: function(widget,data,error,toolbox) {
        return (<div>
                <TemplateButtons data={data} widget={widget} toolbox={toolbox} id={'1'} content={"pa模板一"}/>
                <TemplateButtons data={data} widget={widget} toolbox={toolbox} id={'2'} content={"log模板二"}/>
                </div>
    );
    }
});