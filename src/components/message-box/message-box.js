import Vue from 'vue';
import MessageBoxVue from './message-box.vue';

const MsgVue = Vue.extend(MessageBoxVue);

const root = document.createElement('div');
root.classList.add('ev-message-box-root');
document.body.appendChild(root);

let instance;
export default function messageBox(options = {}) {
  const dataOptions = Object.assign(
    {
      title: '',
      message: '',
      type: 'info',
      onClosed: null,
    },
    options,
  );

  if (!instance) {
    instance = new MsgVue({
      data: dataOptions,
    });
    instance.$mount();
    root.appendChild(instance.$el);
  }
  Object.assign(instance._data, dataOptions);
  instance.visible = true;
}
