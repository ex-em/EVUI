const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const webpackBaseConfig = require('./webpack.base.conf');
const CompressionPlugin = require('compression-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const resolve = (dir) => path.join(__dirname, '..', dir);

const webpackConfig = merge(webpackBaseConfig, {
  mode: 'production',
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
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new FriendlyErrorsPlugin(),
  ]
});

module.exports = webpackConfig;
