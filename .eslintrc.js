// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: ['plugin:vue/recommended', 'airbnb-base'],
  // required to lint *.vue files
  plugins: [
    'vue',
    'html'
  ],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: 'build/webpack.base.conf.js'
      }
    },
    'html/html-extensions': ['.html'],  // don't include .vue
  },
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'state', // for vuex state
        'acc', // for reduce accumulators
        'e', // for e.returnvalue
        'series' // for chart
      ]
    }],
    'indent': 'off',
    'linebreak-style': 0,
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      optionalDependencies: ['test/unit/index.js']
    }],
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console' : ['error', { allow : ['log']}],
    'class-methods-use-this': 'off',

    // need to check the list
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue-i18n/no-v-html': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'vue/no-unused-vars': 'off',
    'vue/no-unused-components': 'off',
    'vue/no-v-html': 'off',
    'vue/no-template-shadow': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/attributes-order': 'off',
    'vue/html-indent': 'off',

    'object-curly-newline': 'off',
    'import/order': 'off',
    'operator-linebreak': 'off',
    'prefer-destructuring': 'off',
    'switch-colon-spacing': 'off',
    'arrow-parens': 'off',
    'no-else-return': 'off',
    'no-restricted-globals': 'off',
    'prefer-object-spread': 'off',
    'no-multiple-empty-lines': 'off',
    'keyword-spacing': 'off',
    'lines-between-class-members': 'off',
    'function-paren-newline': 'off',
  }
};
