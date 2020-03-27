import Vue from 'vue';
import NotiVue from './notification.vue';

const NotiConstructor = Vue.extend(NotiVue);

let seq = 1;
const root = document.createElement('div');
root.classList.add('ev-notification-root');
document.body.appendChild(root);

const notificationManager = {
  items: {
    'top-right': [],
    'bottom-right': [],
    'bottom-left': [],
    'top-left': [],
  },
  increaseOffsetVal: 10,
  getNextOffset(position) {
    const list = this.items[position];
    let result = 0;
    if (!list) {
      return result;
    }
    for (let ix = 0; ix < list.length - 1; ix++) {
      result += (list[ix].height || 0) + this.increaseOffsetVal;
    }
    return result;
  },
  pushItem(item) {
    if (!item.position || !this.items[item.position]) {
      return;
    }
    this.items[item.position].push(item);
  },
  removeItem(notiList, id) {
    const index = notiList.findIndex(v => id === v.id);
    if (index !== -1) {
      notiList.splice(index, 1);
    }
  },
  onBeforeClosed(instance) {
    const notiList = this.items[instance.position];
    if (!notiList) {
      return;
    }
    this.removeItem(notiList, instance.id);
    let el;
    const positionStyle = instance.position.split('-')[0];
    for (let ix = 0; ix < notiList.length; ix++) {
      el = notiList[ix].$el;
      el.style[positionStyle] = `${parseInt(el.style[positionStyle], 10) - notiList[ix].height - this.increaseOffsetVal}px`;
    }
  },
  closeAll() {
    for (let ix = 0; ix < this.items.length; ix++) {
      this.items[ix].close();
    }
  },
};

export default function notification(options = {}) {
  const instance = new NotiConstructor({
    data: options,
    methods: {
      onBeforeClosed: notificationManager.onBeforeClosed.bind(notificationManager),
    },
  });
  instance.id = `ev-notification-${seq++}`;
  instance.$mount();
  root.appendChild(instance.$el);
  instance.visible = true;
  notificationManager.pushItem(instance);
  instance.offsetY = notificationManager.getNextOffset(options.position);
}
