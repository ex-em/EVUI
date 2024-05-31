import './style/index.scss';
import type { App } from 'vue';
import EvButton from './components/button';
import EvMessage from './components/message';
import EvLoading from './components/loading';
import EvProgress from './components/progress';
import EvMessageBox from './components/messageBox';
import EvNotification from './components/notification';
import EvIcon, { iconList } from './components/icon';
import EvTextField from './components/textField';
import EvToggle from './components/toggle';
import EvCheckbox from './components/checkbox/checkbox';
import EvCheckboxGroup from './components/checkbox/checkboxGroup';
import EvInputNumber from './components/inputNumber';

export {
  EvButton,
  EvMessage,
  EvLoading,
  EvProgress,
  EvMessageBox,
  EvNotification,
  EvIcon,
  iconList,
  EvTextField,
  EvToggle,
  EvCheckbox,
  EvCheckboxGroup,
  EvInputNumber,
};

const components = [
  EvButton,
  EvMessage,
  EvLoading,
  EvProgress,
  EvMessageBox,
  EvNotification,
  EvIcon,
  EvTextField,
  EvToggle,
  EvCheckbox,
  EvCheckboxGroup,
  EvInputNumber,
];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });
  },
};
