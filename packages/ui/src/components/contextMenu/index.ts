import type { App } from 'vue';
import EvContextMenu from './ContextMenu.vue';

EvContextMenu.install = (app: App) => {
  app.component('EvContextMenu', EvContextMenu);
};

export default EvContextMenu;
