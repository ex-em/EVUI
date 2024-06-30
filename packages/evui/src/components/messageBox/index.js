import { defineComponent, h, render } from 'vue';
import Component from './MessageBox.vue';

const componentObj = defineComponent(Component);

const messageBox = (options = {}) => {
  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    componentObj,
    msgOption,
  );
  render(instance, container);
};

messageBox.install = (app) => {
  const global = app.config.globalProperties;
  global.$messagebox = messageBox;
};

export default messageBox;
