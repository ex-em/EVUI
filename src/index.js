import ExButton from '@/components/button';
import ExChart from '@/components/chart';
import ExContainer from '@/components/container';
import ExTable from '@/components/table';
import ExLoadingmask from '@/components/loadingmask';
import ExTimePicker from '@/components/timepicker';

const components = {
  ExButton,
  ExContainer,
  ExChart,
  ExTable,
  ExLoadingmask,
  ExTimePicker,
};

const evui = {
  ...components,
};
/* eslint-disable */
const install = function (Vue) {
  if (install.installed) return;

  Object.keys(evui).forEach((key) => {
    Vue.component(key, evui[key]);
  });
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

const API = {
  version: '"2.0"', // eslint-disable-line no-undef
  install,
  ...components,
};

module.exports.default = module.exports = API; // eslint-disable-line no-undef

