const path = require('path')
const utils = require('./build/utils')
const vueLoaderConfig = require('./build/vue-loader.conf')

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    //components: 'src/vue/*.vue',
    styleguideDir: 'src/docs',
    sections: [
        {
            name: 'Introduction',
            content: 'README.md'
        },
        {
            name: 'Documentation',
            sections: [
                {
                    name: 'Components',
                    content: '',
                    //content: 'docs/installation.md',
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
        }
    ],
    webpackConfig: {
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: vueLoaderConfig
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    include: [resolve('src'), resolve('test'), resolve('node_modules/vue-awesome')],
                    exclude: /node_modules/
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: utils.assetsPath('img/[name].[hash:7].[ext]')
                    }
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: utils.assetsPath('media/[name].[hash:7].[ext]')
                    }
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                    }
                }
            ]
        }
    }
}
