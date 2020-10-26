import EvCheckbox from '@/components/checkbox/Checkbox.vue';
import EvCheckboxGroup from '@/components/checkboxGroup/CheckboxGroup.vue';
import EvRadio from '@/components/radio/Radio.vue';
import EvRadioGroup from '@/components/radioGroup/RadioGroup.vue';
import EvSelect from '@/components/select/Select.vue';
import EvToggle from '@/components/toggle/Toggle.vue';
import EvTextField from '@/components/textField/TextField.vue';
import EvInputNumber from '@/components/inputNumber/InputNumber.vue';
import EvSlider from '@/components/slider/Slider.vue';
import EvIcon from '@/components/icon/Icon.vue';
import { version } from '../package.json';

const components = [
  EvCheckbox,
  EvCheckboxGroup,
  EvRadio,
  EvRadioGroup,
  EvSelect,
  EvToggle,
  EvTextField,
  EvInputNumber,
  EvSlider,
  EvIcon,
];

const install = (app) => {
  if (!app) {
    return;
  }
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

const EVUI = {
  version,
  install,
};

export {
  EvCheckbox,
  EvCheckboxGroup,
  EvRadio,
  EvRadioGroup,
  EvSelect,
  EvToggle,
  EvTextField,
  EvInputNumber,
  EvSlider,
  EvIcon,
};

export default EVUI;
