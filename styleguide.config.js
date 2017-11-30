const baseConfig = require('./build/webpack.base.conf.js')
const merge = require('webpack-merge')
const { theme, styles } = require('./docStyles')

module.exports = {
    title: 'Evui Docs',
    styleguideDir: 'src/docs',
    highlightTheme: 'dracula',
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
            content: 'README.md'
        },
        {
            name: 'Components',
            content: '',
            components: 'src/vue/components/*.vue'
        },
        {
            name: 'Chart',
            content: '',
            components: 'src/vue/chart/*.vue'
        },
        {
            name: 'ChartT',
            content: '',
            components: 'src/vue/chartT/*.vue'
        },
        {
            name: 'Grid',
            content: '',
            components: 'src/vue/grid/*.vue'
        },
        {
            name: 'Tree',
            content: '',
            components: 'src/vue/tree/*.vue'
        }
    ]
    //propsParser: function(file) {
    //    const doc = vueDocs.parse(file);
    //    doc.displayName = doc.displayName.replace(/([A-Z])/g, function ($1) { return '-' + $1.toLowerCase() });
    //    return doc;
    //}
}
