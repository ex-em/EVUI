import EvButton from '@/components/button/Button.vue';
import EvButtonGroup from '@/components/buttonGroup/ButtonGroup.vue';
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
import EvCalendar from '@/components/calendar/Calendar.vue';
import EvTimePicker from '@/components/datePicker/DatePicker.vue';
import EvMessage from '@/components/message/';
import { version } from '../package.json';

const components = [
  EvButton,
  EvButtonGroup,
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
  EvCalendar,
  EvTimePicker,
];

const install = (app) => {
  if (!app) {
    return;
  }
  components.forEach((component) => {
    app.component(component.name, component);
  });

  const global = app.config.globalProperties;
  global.$message = EvMessage;
  global.$messagebox = () => {};
  global.$notify = () => {};
};

const EVUI = {
  version,
  install,
};

export {
  EvButton,
  EvButtonGroup,
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
  EvCalendar,
  EvTimePicker,
};

export default EVUI;
