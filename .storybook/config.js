import { configure, addParameters, addDecorator } from '@storybook/vue';
import Centered from '@storybook/addon-centered/vue';
import {withKnobs} from "@storybook/addon-knobs";
// import Vue from 'vue';
// import Vuex from 'vuex';
// import { withA11y } from '@storybook/addon-a11y';
// import MyButton from '../src/stories/Button.vue';

// addDecorator(withA11y);
// Vue.component('my-button', MyButton);
// Vue.use(Vuex);

addParameters({
  options: {
    hierarchyRootSeparator: /\|/,
    panelPosition: 'right',
  },
  docs: {
    iframeHeight: '60px',
  },
});

addDecorator(Centered);

configure([
  // require.context('../examples_story', true, /\.stories\.mdx$/),
  require.context('../examples_story', true, /\.stories\.js$/),
], module);
