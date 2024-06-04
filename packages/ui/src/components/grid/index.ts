//@ts-ignore TODO: vue-resize-observer is not typed
import VueResizeObserver from 'vue-resize-observer';
import ObserveVisibility from 'vue3-observe-visibility';
import EvGrid from './Grid.vue';
import type { App } from 'vue';

EvGrid.install = (app: App) => {
  app.component('EvGrid', EvGrid);
  app.use(VueResizeObserver);
  app.use(ObserveVisibility);
};

export default EvGrid;
