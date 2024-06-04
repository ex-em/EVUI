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
import EvTabs from './components/tabs';
import EvTabPanel from './components/tabPanel';
import EvRadio from './components/radio';
import EvRadioGroup from './components/radioGroup';
import EvPagination from './components/pagination';
import EvSelect from './components/select';
import EvGrid from './components/grid';
import EvTreeGrid from './components/treeGrid';

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
  EvTabs,
  EvTabPanel,
  EvRadio,
  EvRadioGroup,
  EvPagination,
  EvSelect,
  EvGrid,
  EvTreeGrid,
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
  EvTabs,
  EvTabPanel,
  EvRadio,
  EvRadioGroup,
  EvPagination,
  EvSelect,
  EvGrid,
  EvTreeGrid,
];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });
  },
};
