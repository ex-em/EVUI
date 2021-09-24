import VueResizeObserver from 'vue-resize-observer';
import ObserveVisibility from 'vue3-observe-visibility';
import EvGrid from './Grid';

EvGrid.install = (app) => {
  app.component(EvGrid.name, EvGrid);
  app.use(VueResizeObserver);
  app.use(ObserveVisibility);
};

export default EvGrid;
