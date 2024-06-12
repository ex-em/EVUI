import type { App } from 'vue';
import EvInputNumber from './InputNumber.vue';

EvInputNumber.install = (app: App) => {
  app.component(EvInputNumber.name!, EvInputNumber);
};

export default EvInputNumber;
