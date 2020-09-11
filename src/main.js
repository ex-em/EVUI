import EvCheckbox from '@/components/checkbox/Checkbox.vue';
import { version } from '../package.json';

const components = [
  EvCheckbox,
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
};

export default EVUI;
