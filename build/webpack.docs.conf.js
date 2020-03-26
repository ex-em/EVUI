const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackBaseConfig = require('./webpack.base.conf.js');

const resolve = (dir) => path.join(__dirname, '..', dir);

module.exports = merge(webpackBaseConfig, {
  devtool: 'eval-source-map',
  entry: {
    app: './docs/main.js',
    vendors: ['vue', 'vue-router']
  },
  output: {
    path: resolve('./dist_docs'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  module: {
    rules:[
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('docs')],
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
    port: '8888',
    compress: false,
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
    new HtmlWebpackPlugin({
      inject: true,
      filename: './index.html',
      template: './docs/index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../docs/'),
        to: './docs/',
        copyUnmodified: true,
      }
    ]),
    new FriendlyErrorsPlugin(),
    // new CleanWebpackPlugin(),
    // new CleanWebpackPlugin([resolve('./demo')], {allowExternal : true }),
  ]
});
