import ObserveVisibility from 'vue3-observe-visibility';
import EvTreeGrid from './TreeGrid';

EvTreeGrid.install = (app) => {
  app.component(EvTreeGrid.name, EvTreeGrid);
  app.use(ObserveVisibility);
};

export default EvTreeGrid;
