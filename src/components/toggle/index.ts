import type { App } from 'vue';
import EvToggle from './Toggle.vue';

const toggle: typeof EvToggle & { install(app: App): void } = Object.assign(EvToggle, {
  install(app: App) {
    app.component(EvToggle.name!, EvToggle);
  },
});

export default toggle;
