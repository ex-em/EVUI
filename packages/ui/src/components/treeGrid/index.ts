import ObserveVisibility from 'vue3-observe-visibility';
import EvTreeGrid from './TreeGrid.vue';
import type { App } from 'vue';

EvTreeGrid.install = (app: App) => {
  app.component('EvTreeGrid', EvTreeGrid);
  app.use(ObserveVisibility);
};

export default EvTreeGrid;
