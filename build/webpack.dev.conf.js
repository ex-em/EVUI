const path = require('path');
const webpack = require('webpack');

const merge = require('webpack-merge');
const { VueLoaderPlugin } =  require ('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackBaseConfig = require('./webpack.base.conf.js');

function resolve (dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    main: './examples/main.js',
    vendors: ['vue', 'vue-router']
  },
  output: {
    path: resolve('../examples/dist'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  resolve: {
    alias: {
      'evui': '../../src/index',
      'vue': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules:[
      {
        test: /\.(vue|js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('examples'), resolve('test')],
          options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true,
          failOnError: true,
          failOnWarning : true,
        }
      },
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    contentBase: '/',
    hot: true,
    inline: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    port: '8888'
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // all, async, initial
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      filename: './index.html',
      template: './examples/index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../examples/routers'),
        to: 'static',
        ignore: ['.*']
      }
    ]),
    new FriendlyErrorsPlugin(),
    new VueLoaderPlugin()
  ]
});
