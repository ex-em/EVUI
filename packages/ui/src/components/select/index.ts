import type { App } from 'vue';
import EvSelect from './Select.vue';

EvSelect.install = (app: App) => {
  app.component('EvSelect', EvSelect);
};

export default EvSelect;
