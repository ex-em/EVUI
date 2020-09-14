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
      .end()
      .test(/\.vue$/)
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
