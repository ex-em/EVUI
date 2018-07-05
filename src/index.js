import Button from '@/components/button';
import Chart from '@/components/chart';
import Container from '@/components/container';
import Table from '@/components/table';
import Loadingmask from '@/components/loadingmask';
import TimePicker from '@/components/timepicker';

const components = {
  Button,
  Container,
  Chart,
  Table,
  Loadingmask,
  TimePicker,
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

