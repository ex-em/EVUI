import Vue from 'vue';
import MessageBoxVue from './message-box.vue';

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
    const MsgVue = Vue.extend(MessageBoxVue);
    instance = new MsgVue({
      data: dataOptions,
    });
    instance.$mount();

    const root = document.createElement('div');
    root.classList.add('ev-message-box-root');
    document.body.appendChild(root);
    root.appendChild(instance.$el);
  }

  Object.assign(instance._data, dataOptions);
  instance.visible = true;
}
