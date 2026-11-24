import type { App } from 'vue';
import EvButton from './Button.vue';

const button: typeof EvButton & { install(app: App): void } = Object.assign(EvButton, {
  install(app: App) {
    app.component(EvButton.name!, EvButton);
  },
});

export default button;
