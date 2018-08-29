import EvButton from '@/components/button';
import EvChart from '@/components/chart';
import EvCheckbox from '@/components/checkbox';
import EvCheckboxGroup from '@/components/checkbox-group';
import EvIcon from '@/components/icon';
import EvInput from '@/components/input';
import EvLoadingMask from '@/components/loadingmask';
import EvRadio from '@/components/radio';
import EvRadioGroup from '@/components/radio-group';
import EvSelectBox from '@/components/selectbox';
import EvTable from '@/components/table';
import EvTimePicker from '@/components/timepicker';
import EvToggle from '@/components/toggle';
import EvDocking from '@/components/dock';
import EvLabel from '@/components/label';
import EvWindow from '@/components/window';
import Vuex from 'vuex';

const components = {
  EvButton,
  EvChart,
  EvCheckbox,
  EvCheckboxGroup,
  EvIcon,
  EvInput,
  EvLoadingMask,
  EvRadio,
  EvRadioGroup,
  EvSelectBox,
  EvTable,
  EvTimePicker,
  EvToggle,
  EvDocking,
  EvLabel,
  EvWindow,
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
  Vue.prototype.$dockBus = new Vue();
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

