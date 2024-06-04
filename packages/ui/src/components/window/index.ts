import type { App } from 'vue';
import EvWindow from './Window.vue';

EvWindow.install = (app: App) => {
  app.component('EvWindow', EvWindow);
};

export default EvWindow;
