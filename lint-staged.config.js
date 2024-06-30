export default {
  '*': ['prettier --write'],
  '*.{js,ts,vue}': ['eslint'],
  '*.{css,scss,vue}': ['stylelint'],
};
