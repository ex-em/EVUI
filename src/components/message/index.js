import { defineComponent, h, render } from 'vue';
import Component from './Message.vue';

const componentObj = defineComponent(Component);

const root = document.createElement('div');
root.classList.add('ev-message-modal');
document.body.appendChild(root);

const message = (options = {}) => {
  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    componentObj,
    msgOption,
  );
  render(instance, container);
  root.appendChild(instance.el);
};

export default message;
