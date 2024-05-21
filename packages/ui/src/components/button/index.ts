import type { App } from 'vue';
import EvButton from './Button.vue';

EvButton.install = (app: App) => {
  app.component(EvButton.name!, EvButton);
}

export { EvButton };
export default EvButton;
