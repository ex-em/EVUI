import EvTabs from '@/components/tabs/';
import EvTabPanel from '@/components/tabPanel/';
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
import EvDatePicker from '@/components/datePicker/';
import EvMessage from '@/components/message/';
import EvNotification from '@/components/notification/';
import EvMessageBox from '@/components/messageBox/';
import EvScheduler from '@/components/scheduler/';
import EvContextMenu from '@/components/contextMenu/';
import EvWindow from '@/components/window/';
import EvLoading from '@/components/loading/';
import EvProgress from '@/components/progress/';
import EvMenu from '@/components/menu/';
import EvTree from '@/components/tree/';
import EvTimePicker from '@/components/timePicker/';
import EvGrid from '@/components/grid/';
import EvChart from '@/components/chart/';
import EvChartGroup from '@/components/chartGroup/';
import EvChartBrush from '@/components/chartBrush/';
import EvTreeGrid from '@/components/treeGrid/';
import EvPagination from '@/components/pagination/';
import VueResizeObserver from 'vue-resize-observer';
import ObserveVisibility from 'vue3-observe-visibility';
import { version } from '../package.json';

const components = [
  EvTabs,
  EvTabPanel,
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
  EvDatePicker,
  EvScheduler,
  EvContextMenu,
  EvWindow,
  EvLoading,
  EvProgress,
  EvMenu,
  EvTree,
  EvTimePicker,
  EvGrid,
  EvChart,
  EvChartGroup,
  EvChartBrush,
  EvMessage,
  EvNotification,
  EvMessageBox,
  EvTreeGrid,
  EvPagination,
];

const install = (app) => {
  if (!app) {
    return;
  }

  components.forEach((component) => {
    app.use(component);
  });

  app.use(VueResizeObserver);
  app.use(ObserveVisibility);
};

const EVUI = {
  version,
  install,
};

export {
  EvTabs,
  EvTabPanel,
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
  EvDatePicker,
  EvScheduler,
  EvContextMenu,
  EvWindow,
  EvLoading,
  EvProgress,
  EvMenu,
  EvTree,
  EvTimePicker,
  EvGrid,
  EvChart,
  EvMessage,
  EvNotification,
  EvMessageBox,
  EvTreeGrid,
  EvPagination,
};

export default EVUI;
