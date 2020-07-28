const path = require('path');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.conf.js');
const merge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const resolve = (dir) => path.join(__dirname, '..', dir);

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'source-map',
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
        include: [resolve('src'), resolve('examples')],
          options: {
          formatter: require('eslint-formatter-friendly'),
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
    port: '8888',
    compress: false,
  },
  optimization: {
    concatenateModules: true,
    splitChunks: {
      chunks: 'all', // all, async, initial
      name: true,
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
      },
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      filename: './index.html',
      template: './examples/index.html',
    }),
    new FriendlyErrorsPlugin(),
  ]
});
