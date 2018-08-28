import SimpleLineChart from './samples/chart.line.simple';
import FillLineChart from './samples/chart.line.fill';
import StackedLineChart from './samples/chart.line.stack';
import SimpleBarChart from './samples/chart.bar.simple';
import StackedBarChart from './samples/chart.bar.stack';
import HorizontalBarChart from './samples/chart.bar.horizontal';

const components = {
  SimpleLineChart,
  FillLineChart,
  StackedLineChart,
  SimpleBarChart,
  StackedBarChart,
  HorizontalBarChart,
};

const testSamples = {
  ...components,
};

/* eslint-disable */
const install = function (Vue) {
  if (install.installed) return;

  Object.keys(testSamples).forEach((key) => {
    Vue.component(key, testSamples[key]);
  });
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

const Test = {
  install,
  ...components,
};

module.exports.default = module.exports = Test; // eslint-disable-line no-undef
