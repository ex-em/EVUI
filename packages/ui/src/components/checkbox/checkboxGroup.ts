import type { App } from 'vue';
import EvCheckboxGroup from './CheckboxGroup.vue';

EvCheckboxGroup.install = (app: App) => {
  app.component(EvCheckboxGroup.name!, EvCheckboxGroup);
};

export default EvCheckboxGroup;
