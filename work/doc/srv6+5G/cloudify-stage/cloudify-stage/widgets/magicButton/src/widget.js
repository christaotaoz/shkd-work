
import MagicButton from './MagicButton';
Stage.defineWidget({
    id: 'magicButton',
    name: '魔术按钮',
    description: '创建部署按钮',
    initialWidth: 3,
    initialHeight: 3,
    showHeader: false,
    showBorder: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.DEPLOYMENTS, Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    render: function(widget,data,error,toolbox) {
        let blueprint = toolbox.getManager().doGet('/blueprints?_include=id');
        console.log('magic下面是blueprint');
        console.log(blueprint);
        console.log(toolbox);
        let {Button, ErrorMessage} = Stage.Basic;

        return (
           <MagicButton toolbox={toolbox}/>

        );
    }

});