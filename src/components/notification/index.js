import { defineComponent, h, render } from 'vue';
import Component from './Notification.vue';

const componentObj = defineComponent(Component);

const root = document.createElement('div');
root.classList.add('ev-notification-modal');
document.body.appendChild(root);

const positionList = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const notification = (options = {}) => {
  const position = options.position || 'top-right';
  if (!positionList.includes(position)) {
    return;
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

export default notification;
