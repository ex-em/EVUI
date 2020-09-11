const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  devServer: {
    overlay: false,
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
