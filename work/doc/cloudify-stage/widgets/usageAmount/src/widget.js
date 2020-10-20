/**
 * Created by woody on 25/08/2019.
 */
import UpdateButton from './UpdateButton';
import UsageAmountTable from './UsageAmountTable';
Stage.defineWidget({
    id: 'usageAmount',
    name: '使用量查询',
    description: 'test',
    initialWidth: 12,
    initialHeight: 25,
    color : 'red',
    showHeader: true,
    isReact: true,
    hasReadme: true,
    hasStyle: false,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(10),
        Stage.GenericConfig.PAGE_SIZE_CONFIG(10),
        Stage.GenericConfig.SORT_COLUMN_CONFIG('create_time'),
        Stage.GenericConfig.SORT_ASCENDING_CONFIG(false)
    ],


    fetchData(widget,toolbox,params) {
        return toolbox.getManager().doGet('/usageamout',params)
    },

    // doExecute(toolbox,force = false, dry_run = false, queue = false, scheduled_time = undefined) {
    // return(alert("正在刷新，请稍后……"),
    //         this.click = true,
    //         toolbox.getManager().doPost('/executions',null,{
    //         'deployment_id': 'usageAmount',
    //         'workflow_id' : 'install',
    //         dry_run,
    //         force,
    //         queue,
    //         scheduled_time})),
    //         setInterval(()=>{this.click=false;},15000)},


    _processData(data) {
        return Object.assign({}, data, {
            total: _.get(data, 'metadata.pagination.total', 0)
        });
    },

    render: function(widget,datas,error,toolbox) {
        if (_.isEmpty(datas)) {
            return <Stage.Basic.Loading/>;
        }
        var selecteduser= toolbox.getContext().getValue('userName');
        let data  = this._processData(datas);
        let formattedData = data;
        formattedData = Object.assign({}, formattedData, {
            items: _.map (formattedData.items, (item) => {
                return Object.assign({}, item, {
                    isSelected: item.id === selecteduser
                })
            }),
        });


        return (
            <UsageAmountTable widget={widget}  data={formattedData} toolbox={toolbox} />
                );
            }
        }
    );
