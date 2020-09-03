const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  devServer: {
    overlay: false,
  },
  css: {
    extract: {
      filename: 'app.css',
    },
    loaderOptions: {
      scss: {
        prependData: '@import "~@/stylesheets/default.scss";',
      },
    },
  },
  configureWebpack: {
    plugins: [
      new StyleLintPlugin({
        files: ['src/**/*.{vue,scss}'],
        emitError: true,
        emitWarning: true,
        failOnError: false,
        failOnWarning: false,
      }),
    ],
  },
};
