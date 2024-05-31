import type { App } from 'vue';
import EvCheckbox from './Checkbox.vue';

EvCheckbox.install = (app: App) => {
  app.component(EvCheckbox.name!, EvCheckbox);
};

export default EvCheckbox;
