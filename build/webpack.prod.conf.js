const path = require('path');
const webpack = require('webpack');

const merge = require('webpack-merge');
const CompressionPlugin = require('compression-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const baseWebpackConfig = require('./webpack.base.conf');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const webpackConfig = merge(baseWebpackConfig, {
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new CleanWebpackPlugin([resolve('./dist')], { allowExternal : true }),
    new VueLoaderPlugin(),
  ]
});

module.exports = webpackConfig;
