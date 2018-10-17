'use strict'
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.conf.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { VueLoaderPlugin } =  require ('vue-loader');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  entry: {
    app: './liteplus/main.js',
    vendors: ['vue'],
  },
  output: {
    path: path.resolve(__dirname, '../dist_liteplus'),
    publicPath: '/',
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    rules:[
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('liteplus')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true,
          failOnError: true,
          failOnWarning : true,
        }
      }
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
    port: '7777',
    compress: false,
  },
  plugins: [
    new CleanWebpackPlugin(['dist_liteplus']),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      filename: './index.html',
      template: './liteplus/index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../liteplus/'),
        to: './liteplus/'
      },
    ]),
    new FriendlyErrorsPlugin(),
    new VueLoaderPlugin()
  ]
});
