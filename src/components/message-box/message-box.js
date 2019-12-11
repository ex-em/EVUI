import Vue from 'vue';
import MessageVue from './message-box.vue';

const MsgVue = Vue.extend(MessageVue);

// let seq = 1;
const root = document.createElement('div');
root.classList.add('ev-message-box-root');
document.body.appendChild(root);

// const messageManager = {
//   items: [],
//   pushItem(item) {
//     this.items.push(item);
//     if (this.boxHeight === 0) {
//       this.boxHeight = item.height + this.increaseOffsetVal;
//     }
//     this.lastOffset.y += this.boxHeight;
//   },
//   removeItem() {
//     this.lastOffset.y -= this.boxHeight;
//   },
// };

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
  // instance.id = `ev-message-box-${seq++}`;
  instance.visible = true;
}
