import Vue from 'vue';
import MessageBoxVue from './message-box.vue';

const MsgVue = Vue.extend(MessageBoxVue);

const root = document.createElement('div');
root.classList.add('ev-message-box-root');
document.body.appendChild(root);

let instance;
export default function messageBox(options = {}) {
  if (!instance) {
    instance = new MsgVue({
      data: options,
    });
    instance.$mount();
    root.appendChild(instance.$el);
  }
  instance._data = Object.assign(instance._data, options);
  instance.visible = true;
}
