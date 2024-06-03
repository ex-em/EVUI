import type { App } from 'vue';
import EvRadio from './Radio.vue';

EvRadio.install = (app: App) => {
  app.component('EvRadio', EvRadio);
};

export default EvRadio;
