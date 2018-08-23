import EvButton from '@/components/button';
import EvChart from '@/components/chart';
import EvCheckbox from '@/components/checkbox';
import EvCheckboxGroup from '@/components/checkbox-group';
import EvIcon from '@/components/icon';
import EvInput from '@/components/input';
import EvLoadingmask from '@/components/loadingmask';
import EvMenu from '@/components/menu';
import EvRadio from '@/components/radio';
import EvRadioGroup from '@/components/radio-group';
import EvSelectbox from '@/components/selectbox';
import EvTable from '@/components/table';
import EvTimePicker from '@/components/timepicker';
import EvToggle from '@/components/toggle';
import EvDocking from '@/components/dock';
import EvLabel from '@/components/label';
import Vuex from 'vuex';

const components = {
  EvButton,
  EvChart,
  EvCheckbox,
  EvCheckboxGroup,
  EvIcon,
  EvInput,
  EvLoadingmask,
  EvMenu,
  EvRadio,
  EvRadioGroup,
  EvSelectbox,
  EvTable,
  EvTimePicker,
  EvToggle,
  EvDocking,
  EvLabel,
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

  Vue.use(Vuex);
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

