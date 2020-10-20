/**
 * Created by pawelposel on 13/02/2017.
 */

Stage.defineWidget({
    id: "buttonLink",
    name: "链接按钮",
    description: '在新窗口中打开设置的url',
    initialWidth: 2,
    initialHeight: 4,
    showHeader: false,
    showBorder: false,
    categories: [Stage.GenericConfig.CATEGORY.BUTTONS_AND_FILTERS],

    initialConfiguration: [
        {id: "label",name: "按钮标签", default: "按钮链接", type: Stage.Basic.GenericField.STRING},
        {id: "url",name: "URL地址", default: "", type: Stage.Basic.GenericField.STRING}
    ],
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('buttonLink'),

    render: function(widget,data,error,toolbox) {
        var Button = Stage.Basic.Button;

        return (
            <Button className="labeled icon" color="green" fluid icon="external" disabled={!widget.configuration.url}
                    onClick={()=>{window.open(widget.configuration.url, '_blank')}}
                    content={widget.configuration.label}/>
        );

    }

});