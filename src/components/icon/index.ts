import type { App } from 'vue';
import EvIcon from './Icon.vue';

const icon: typeof EvIcon & { install(app: App): void } = Object.assign(EvIcon, {
  install(app: App) {
    app.component(EvIcon.name!, EvIcon);
  },
});

export default icon;
