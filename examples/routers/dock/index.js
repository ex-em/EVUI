import SimpleLine from './samples/chart.line.simple';
import FillLine from './samples/chart.line.fill';
import StackedLine from './samples/chart.line.stack';
import SimpleBar from './samples/chart.bar.simple';
import StackedBar from './samples/chart.bar.stack';
import HorizontalBar from './samples/chart.bar.horizontal';

const components = {
  SimpleLine,
  FillLine,
  StackedLine,
  SimpleBar,
  StackedBar,
  HorizontalBar,
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
