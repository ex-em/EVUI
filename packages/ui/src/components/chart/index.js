import EvChart from './Chart.vue';

EvChart.install = (app) => {
  app.component(EvChart.name, EvChart);
};

export default EvChart;
