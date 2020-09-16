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
