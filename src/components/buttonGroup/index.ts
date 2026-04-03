import type { App } from 'vue';
import EvButtonGroup from './ButtonGroup.vue';

EvButtonGroup.install = (app: App) => {
  app.component(EvButtonGroup.name!, EvButtonGroup);
};

export default EvButtonGroup;
