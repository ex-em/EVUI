import { h, render } from 'vue';
import type { Props } from './message.type';
import type { App } from 'vue';
import EvMessage from './Message.vue';

const rootId = 'ev-message-box-modal';
const root = document.createElement('div');
root.id = rootId;

const message = (options: Props | string) => {
  const hasRoot = document.getElementById(rootId);
  if (!hasRoot) {
    document.body.appendChild(root);
  }

  const container = document.createElement('div');
  const unmount = () => render(null, container);
  const msgOption = (typeof options === 'string') ? { message: options, unmount } : { ...options, unmount };
  const instance = h(
    EvMessage,
    msgOption,
  );

  render(instance, container);

  return instance.component?.exposed;
};

message.install = (app: App) => {
  const global = app.config.globalProperties;
  global.$message = message;
};

export default message;
