import EvButton from '@/components/button/';
import EvButtonGroup from '@/components/buttonGroup/';
import EvCheckbox from '@/components/checkbox/';
import EvCheckboxGroup from '@/components/checkboxGroup/';
import EvRadio from '@/components/radio/';
import EvRadioGroup from '@/components/radioGroup/';
import EvSelect from '@/components/select/';
import EvToggle from '@/components/toggle/';
import EvTextField from '@/components/textField/';
import EvInputNumber from '@/components/inputNumber/';
import EvSlider from '@/components/slider/';
import EvIcon from '@/components/icon/';
import EvCalendar from '@/components/calendar/';
import EvTimePicker from '@/components/datePicker/';
import EvMessage from '@/components/message/';
import EvNotification from '@/components/notification/';
import EvMessageBox from '@/components/messageBox/';
import EvScheduler from '@/components/scheduler/';
import EvContextMenu from '@/components/contextMenu/';
import EvWindow from '@/components/window/';
import EvLoading from '@/components/loading/';
import EvGrid from '@/components/grid/';
import EvProgress from '@/components/progress/';
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
  EvScheduler,
  EvContextMenu,
  EvWindow,
  EvLoading,
  EvGrid,
  EvProgress,
];

const install = (app) => {
  if (!app) {
    return;
  }
  components.forEach((component) => {
    app.use(component);
  });

  const global = app.config.globalProperties;
  global.$message = EvMessage;
  global.$messagebox = EvMessageBox;
  global.$notify = EvNotification;
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
  EvScheduler,
  EvContextMenu,
  EvWindow,
  EvLoading,
  EvGrid,
  EvProgress,
};

export default EVUI;
