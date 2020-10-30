import { defineComponent, h, render } from 'vue';
import Component from './Message.vue';

const componentObj = defineComponent(Component);

const root = document.createElement('div');
root.classList.add('ev-message-modal');
document.body.appendChild(root);

export default function message(options = {}) {
  const msgOption = (typeof options === 'string') ? { message: options } : options;
  const instance = h(
    componentObj,
    msgOption,
  );
  const container = document.createElement('div');
  render(instance, container);
}
