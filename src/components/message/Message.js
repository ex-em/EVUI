import { defineComponent, h, render } from 'vue';
import MessageVue from './Message.vue';

const MsgVue = defineComponent(MessageVue);

const root = document.createElement('div');
root.classList.add('ev-message-modal');
document.body.appendChild(root);

export default function message(options = {}) {
  const msgOption = (typeof options === 'string') ? { message: options } : options;
  const instance = h(
    MsgVue,
    msgOption,
  );
  const container = document.createElement('div');
  render(instance, container);
}
