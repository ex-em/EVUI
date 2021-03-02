import { defineComponent, h, render } from 'vue';
import Component from './Message.vue';

const componentObj = defineComponent(Component);

const rootId = 'ev-message-modal';
const root = document.createElement('div');
root.id = rootId;

const message = (options = {}) => {
  const hasRoot = document.getElementById(rootId);
  if (!hasRoot) {
    document.body.appendChild(root);
  }

  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    componentObj,
    msgOption,
  );
  render(instance, container);
};

message.install = (app) => {
  const global = app.config.globalProperties;
  global.$message = message;
};

export default message;
