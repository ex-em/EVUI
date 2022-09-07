import VueResizeObserver from 'vue-resize-observer';
import EvChartGroup from './ChartGroup';

EvChartGroup.install = (app) => {
  app.component(EvChartGroup.name, EvChartGroup);
  app.use(VueResizeObserver);
};

export default EvChartGroup;
