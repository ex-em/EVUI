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
import EvSlider from '@/components/slider';
import EvTable from '@/components/table';
import EvTimePicker from '@/components/timepicker';
import EvToggle from '@/components/toggle';
import EvLabel from '@/components/label';

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
  EvSlider,
  EvTable,
  EvTimePicker,
  EvToggle,
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

