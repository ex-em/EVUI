import { h, render, } from 'vue';
import { type App } from 'vue';
import EvMessageBox from './MessageBox.vue';
import type { Props } from './messageBox.type';

const rootId = 'ev-message-modal';
const root = document.createElement('div');
root.id = rootId;

const messageBox = (options: Props | string) => {
  const hasRoot = document.getElementById(rootId);
  if (!hasRoot) {
    document.body.appendChild(root);
  }

  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    EvMessageBox,
    msgOption,
  );
  render(instance, container);
};

messageBox.install = (app: App) => {
  const global = app.config.globalProperties;
  global.$messagebox = messageBox;
};

export default messageBox;
