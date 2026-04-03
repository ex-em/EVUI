import type { App } from 'vue';
import EvToggle from './Toggle.vue';

EvToggle.install = (app: App) => {
  app.component(EvToggle.name!, EvToggle);
};

export default EvToggle;
