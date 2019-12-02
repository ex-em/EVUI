import Vue from 'vue';
import MessageVue from './message.vue';

const MsgVue = Vue.extend(MessageVue);

let seq = 1;
const root = document.createElement('div');
root.classList.add('ev-message-root');
document.body.appendChild(root);

const messageManager = {
  items: [],
  increaseOffsetVal: 10,
  boxHeight: 0,
  lastOffset: {
    x: 0,
    y: 0,
  },
  getNextOffset() {
    return {
      x: this.lastOffset.x,
      y: this.lastOffset.y,
    };
  },
  pushItem(item) {
    this.items.push(item);
    if (this.boxHeight === 0) {
      this.boxHeight = item.height + this.increaseOffsetVal;
    }
    this.lastOffset.y += this.boxHeight;
  },
  removeItem() {
    this.lastOffset.y -= this.boxHeight;
  },
  onBeforeClosed() {
    this.removeItem();
    let el;
    for (let ix = 0; ix < this.items.length; ix++) {
      el = this.items[ix].$el;
      el.style.top = `${parseInt(el.style.top, 10) - this.boxHeight}px`;
    }
  },
  closeAll() {
    for (let ix = 0; ix < this.items.length; ix++) {
      this.items[ix].close();
    }
  },
};

export default function message(options = {}) {
  const instance = new MsgVue({
    data: options,
    methods: {
      onBeforeClosed: messageManager.onBeforeClosed.bind(messageManager),
    },
  });
  instance.id = `ev-message-${seq++}`;
  instance.$mount();
  root.appendChild(instance.$el);
  instance.visible = true;
  messageManager.pushItem(instance);
  instance.offset = messageManager.getNextOffset();
}
