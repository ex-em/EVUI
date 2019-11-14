const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.conf');
const CompressionPlugin = require('compression-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const webpackConfig = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'source-map',
  entry: resolve('./src/index.js'),
  output: {
    path: resolve('./dist'),
    publicPath: './dist',
    filename: 'evui.min.js',
    library: 'evui',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue'
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsPlugin(),
    // new CleanWebpackPlugin([resolve('./dist')], { allowExternal : true }),
    new VueLoaderPlugin(),
  ]
});

module.exports = webpackConfig;
