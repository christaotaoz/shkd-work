/**
 * Created by pposel on 06/02/2017.
 */

import RepositoryList from './RepositoryList';
import Actions from './actions';
import Consts from './consts';

Stage.defineWidget({
    id: 'blueprintCatalog',
    name: '模版目录',
    description: '显示模版目录',
    initialWidth: 8,
    initialHeight: 16,
    color: 'teal',
    hasStyle: true,
    isReact: true,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('blueprintCatalog'),
    categories: [Stage.GenericConfig.CATEGORY.BLUEPRINTS],
    
    initialConfiguration: [
        Stage.GenericConfig.PAGE_SIZE_CONFIG(3),
        {
            id: 'jsonPath', name: 'Blueprints Examples URL', placeHolder: '输入部署 JSON 文件URL',
            description: 'If set, then GitHub options are not used for fetching data.',
            default: '//repository.cloudifysource.org/cloudify/blueprints/4.4/examples.json',
            type: Stage.Basic.GenericField.STRING_TYPE,
        },
        {
            id: 'username', name: 'GitHub User', placeHolder: '输入 GitHub 用户或者组织名',
            description: 'GitHub user or organization account name which is the owner of the repositories to fetch. ' +
                         'Used only if Blueprints Examples URL is not set.',
            default: 'cloudify-examples',
            type: Stage.Basic.GenericField.STRING_TYPE},
        {
            id: 'filter', name: 'GitHub Filter', placeHolder: '输入GitHub 副本的过滤条件',
            description: 'Optional filter for GitHub repositories. See GitHub\'s web page \'Searching repositories\' for more details. ' +
                         'Used only if Blueprints Examples URL is not set.',
            default: 'blueprint in:name NOT local',
            type: Stage.Basic.GenericField.STRING_TYPE
        },
        {
            id: 'displayStyle', name: 'Display style',
            items: [{name:'Table', value:'table'}, {name:'Catalog', value:'catalog'}],
            default: 'catalog',
            type: Stage.Basic.GenericField.LIST_TYPE
        },
        {
            id: 'sortByName', name: 'Sort by name',
            description: 'If set to true, then blueprints will be sorted by name.',
            default: false,
            type: Stage.Basic.GenericField.BOOLEAN_TYPE
        }
    ],

    mapGridParams: function(gridParams) {
        return {
            page: gridParams.currentPage,
            per_page: gridParams.pageSize
        }
    },

    fetchData: function(widget, toolbox, params) {
        const actions = new Actions(toolbox, widget.configuration.username, widget.configuration.filter, widget.configuration.jsonPath);

        return actions.doGetRepos(params)
            .then(data => {
                const defaultImagePath = Stage.Utils.Url.widgetResourceUrl('blueprintCatalog', Consts.DEFAULT_IMAGE, false, false);
                let repos = data.items;
                let source = data.source;
                let total = data.total_count;
                if (data.source === Consts.GITHUB_DATA_SOURCE) {
                    let isAuthenticated = data.isAuth;

                    let fetches = _.map(repos, repo => actions.doFindImage(repo.name, defaultImagePath)
                        .then(imageUrl => Promise.resolve(Object.assign(repo, {image_url: imageUrl}))));

                    return Promise.all(fetches).then((items) =>
                        Promise.resolve({items, total, source, isAuthenticated})
                    );
                } else {
                    repos = _.map(repos, repo => _.isEmpty(repo.image_url)
                        ? ({...repo, image_url: defaultImagePath})
                        : ({...repo, image_url: `/external/content?url=${encodeURIComponent(repo.image_url)}`}));

                    if (_.get(widget.configuration, 'sortByName', false)) {
                        repos = _.sortBy(repos, 'name');
                    }

                    return Promise.resolve({items: repos, total, source});
                }
            });
    },

    render: function(widget, data, error, toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        var selectedCatalogId = toolbox.getContext().getValue('blueprintCatalogId');
        var formattedData = Object.assign({},data,{
            items: _.map (data.items,(item)=>{
                return Object.assign({},item,{
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    url: item.url,
                    created_at: Stage.Utils.Time.formatTimestamp(item.created_at),
                    updated_at: Stage.Utils.Time.formatTimestamp(item.updated_at),
                    image_url: item.image_url,
                    readme_url: data.source === Consts.GITHUB_DATA_SOURCE
                        ? `/github/content/${widget.configuration.username}/${item.name}/master/README.md`
                        : `/external/content?url=${encodeURIComponent(item.readme_url)}`,
                    zip_url: data.source === Consts.GITHUB_DATA_SOURCE
                        ? `https://github.com/${widget.configuration.username}/${item.name}/archive/master.zip`
                        : item.zip_url,
                    isSelected: selectedCatalogId === item.id
                })
            })
        });

        var actions = new Actions(toolbox, widget.configuration.username, widget.configuration.password);
        return (
            <RepositoryList widget={widget} data={formattedData} toolbox={toolbox} actions={actions}/>
        );
    }
});
