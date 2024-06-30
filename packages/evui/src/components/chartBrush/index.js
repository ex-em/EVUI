import VueResizeObserver from 'vue-resize-observer';
import EvChartBrush from './ChartBrush.vue';

EvChartBrush.install = (app) => {
  app.component(EvChartBrush.name, EvChartBrush);
  app.use(VueResizeObserver);
};

export default EvChartBrush;
