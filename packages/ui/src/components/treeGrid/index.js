import ObserveVisibility from 'vue3-observe-visibility';
import EvTreeGrid from './TreeGrid.vue';

EvTreeGrid.install = (app) => {
  app.component(EvTreeGrid.name, EvTreeGrid);
  app.use(ObserveVisibility);
};

export default EvTreeGrid;
