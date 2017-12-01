const baseConfig = require('./build/webpack.base.conf.js')
const merge = require('webpack-merge')
const { theme, styles } = require('./docStyles')

module.exports = {
    title: 'Evui Docs',
    styleguideDir: 'src/docs',
    showUsage:true,
    theme: theme,
    styles: styles,
    webpackConfig: merge(baseConfig, {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader'
                }
            ]
        }
    }),
    sections: [
        {
            // content: 'README.md'
        },
        /*{
            name: 'Components',
            content: '',
            components: 'src/vue/components/!*.vue'
        },
        {
            name: 'Chart',
            content: '',
            components: 'src/vue/chart/!*.vue'
        },
        {
            name: 'ChartT',
            content: '',
            components: 'src/vue/chartT/!*.vue'
        },*/
        {
            name: 'Grid',
            content: '',
            components: function(){return['src/vue/grid/Grid.vue','src/vue/grid/GridHeaderCell.vue']}
        },
        {
            name: 'Tree',
            content: '',
            components: function(){return['src/vue/tree/Tree.vue', 'src/vue/tree/TreeHeaderCell.vue']}
        }
    ]
}
