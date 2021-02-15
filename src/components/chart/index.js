import VueResizeObserver from 'vue-resize-observer';
import EvChart from './Chart';

EvChart.install = (app) => {
    app.component(EvChart.name, EvChart);
    app.use(VueResizeObserver);
};

export default EvChart;
