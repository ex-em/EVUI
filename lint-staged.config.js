export default {
  '*': ['prettier --write .'],
  '*.{js,ts,vue}': ['eslint .'],
};
