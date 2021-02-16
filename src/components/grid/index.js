import VueResizeObserver from 'vue-resize-observer';
import EvGrid from './Grid';

EvGrid.install = (app) => {
  app.component(EvGrid.name, EvGrid);
  app.use(VueResizeObserver);
};

export default EvGrid;
