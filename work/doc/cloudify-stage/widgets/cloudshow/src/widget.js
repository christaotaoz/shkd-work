/**
 * Created by liuhui on 04/06/2019.
 */

Stage.defineWidget({
    id: 'cloudshow',
    name: 'cloudshow',
    description: 'test cloudshow',
    initialWidth: 800,
    initialHeight: 800,
    color : 'teal',
    showHeader: false,
    isReact: true,
    hasReadme: false,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],

    render: function(widget,data,error,toolbox) {
            return <iframe  width="100%" height="800px" src="https://47.102.113.238/Maintain/cloud_ex.php?grp=0"></iframe>;
        }

});
