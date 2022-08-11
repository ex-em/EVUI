import VueResizeObserver from 'vue-resize-observer';
import EvChartZoom from './ChartZoom';

EvChartZoom.install = (app) => {
  app.component(EvChartZoom.name, EvChartZoom);
  app.use(VueResizeObserver);
};

export default EvChartZoom;
