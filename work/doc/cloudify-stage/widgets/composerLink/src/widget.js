/**
 * Created by Alex on 29/06/2017.
 */
const { Button } = Stage.Basic;

Stage.defineWidget({
    id: "composerLink",
    name: "图形化创建模版",
    description: '打开图形化创建模版界面',
    initialWidth: 2,
    initialHeight: 5,
    showHeader: false,
    showBorder: false,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('composerLink'),
    categories: [Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    render: function(widget,data,error,toolbox) {
        const composerUrl = `${location.protocol}//${location.hostname}/composer`;

        return (
            <Button labelPosition='left' color='blue' className='widgetButton' icon='external'
                    onClick={()=>{window.open(composerUrl, '_blank')}}
                    content="图像化创建模版" />
        );

    }

});
