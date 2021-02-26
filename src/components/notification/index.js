import { defineComponent, h, render } from 'vue';
import Component from './Notification.vue';

const componentObj = defineComponent(Component);

const rootId = 'ev-notification-modal';
const root = document.createElement('div');
root.id = rootId;

const positionList = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const notification = (options = {}) => {
  const position = options.position || 'top-right';
  if (!positionList.includes(position)) {
    console.warn('[EVUI][Notification] The position value is incorrectly entered.');
    return;
  }

  const hasRoot = document.getElementById(rootId);
  if (!hasRoot) {
    document.body.appendChild(root);
  }
  let wrapper = root.getElementsByClassName(`modal-${position}`);
  const hasElem = wrapper.length;
  if (hasElem) {
    wrapper = wrapper[0];
  } else {
    wrapper = document.createElement('div');
    wrapper.classList.add(`modal-${position}`);
    root.appendChild(wrapper);
  }

  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    componentObj,
    msgOption,
  );
  render(instance, container);
  wrapper.appendChild(instance.el);
};

notification.install = (app) => {
  const global = app.config.globalProperties;
  global.$notify = notification;
};

export default notification;
