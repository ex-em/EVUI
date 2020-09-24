const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  devServer: {
    overlay: false,
  },
  chainWebpack: (config) => {
    config.module
      .rule('raw')
      .include
      .add('/docs/views/*/example')
      .add('/docs/views/*/api')
      .end()
      .test(/\.(vue|md)$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/'),
        docs: path.join(__dirname, 'docs/'),
      },
    },
    plugins: [
      new StyleLintPlugin({
        files: [
          'src/**/*.{vue,scss}',
          'docs/**/*.{vue,scss}',
        ],
        emitError: true,
        emitWarning: true,
        failOnError: false,
        failOnWarning: false,
      }),
    ],
  },
};
