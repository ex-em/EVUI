const path = require('path');

module.exports = async ({ config }) => {
  config.module.rules.push({
    test: [/\.stories\.js$/, /index\.js$/],
    loaders: [require.resolve('@storybook/source-loader')],
    include: [path.resolve(__dirname, '../examples_story')],
    enforce: 'pre',
  });

  config.module.rules.push({
    test: /\.(css|sass|scss)$/,
    use: [
      'vue-style-loader',
      'css-loader',
      'sass-loader',
    ],
  });

  config.resolve.extensions.push(...['.js', '.vue']);
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "../src"),
  };

  return config;
};
