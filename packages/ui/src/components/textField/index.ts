import type { App } from 'vue';
import EvTextField from './TextField.vue';

EvTextField.install = (app: App) => {
  app.component(EvTextField.name!, EvTextField);
};

export default EvTextField;
