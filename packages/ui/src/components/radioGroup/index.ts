import type { App } from 'vue';
import EvRadioGroup from './RadioGroup.vue';

EvRadioGroup.install = (app: App) => {
  app.component('EvRadioGroup', EvRadioGroup);
};

export default EvRadioGroup;
