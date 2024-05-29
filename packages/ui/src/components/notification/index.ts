import { h, render } from 'vue';
import Notification from './Notification.vue';
import type { Props } from './notification.type';
import type { App } from 'vue';

const rootId = 'ev-notification-modal';
const root = document.createElement('div');
root.id = rootId;

const positionList = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

const notification = (options: Props | string) => {
  const position = typeof options === 'string' ? 'top-right' : options.position ?? 'top-right';
  if (!positionList.includes(position)) {
    console.warn('[EVUI][Notification] The position value is incorrectly entered.');
    return;
  }

  const hasRoot = document.getElementById(rootId);
  if (!hasRoot) {
    document.body.appendChild(root);
  }
  const modals = root.getElementsByClassName(`modal-${position}`);
  let wrapper: Element | HTMLCollectionOf<Element>;
  const hasElem = modals.length;
  if (hasElem) {
    wrapper = modals[0];
  } else {
    wrapper = document.createElement('div');
    wrapper.classList.add(`modal-${position}`);
    root.appendChild(wrapper);
  }

  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    Notification,
    msgOption,
  );
  render(instance, container);
  wrapper.appendChild(instance.el as Node);
};

notification.install = (app: App) => {
  const global = app.config.globalProperties;
  global.$notify = notification;
};

export default notification;
