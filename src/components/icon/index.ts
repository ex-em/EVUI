import type { App } from 'vue';
import '@/style/lib/icon.css';
import EvIcon from './Icon.vue';

EvIcon.install = (app: App) => {
  app.component(EvIcon.name!, EvIcon);
};

export default EvIcon;
