'use strict'
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.conf.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');


function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = merge(webpackBaseConfig, {
  entry: {
    app: './home/main.js',
    vendors: ['vue']
  },
  output: {
    path:path.resolve(__dirname, '../demo'),
    publicPath: '/',
    filename: '[name].js',
  },
  devtool: '#eval-source-map',
  module: {
    rules:[
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('home')],
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
    open: true,
    hot: true,
    inline: true,
    host: '10.10.102.67',
    port: '8888',
    compress: false,
  },
  plugins: [
    new CleanWebpackPlugin(['demo']),
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      filename: './index.html',
      template: './home/index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../home/guide/'),
        to: './guide/'
      }
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common'
    }),
  ]
});
