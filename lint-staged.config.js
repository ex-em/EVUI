export default {
  '*': ['prettier --write --ignore-unknown'],
  '*.{js,ts,vue}': ['eslint'],
  '*.{css,scss,vue}': ['stylelint'],
};
