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
import EvContextMenu from './components/contextMenu';
import EvWindow from './components/window';
import EvButtonGroup from './components/buttonGroup';
import EvCalendar from './components/calendar';
import EvChart from './components/chart';
import EvMenu from './components/menu';
import EvScheduler from './components/scheduler';
import EvSlider from './components/slider';
import EvTimePicker from './components/timePicker';
import EvTree from './components/tree';
import pkg from '../package.json' with { type: 'json' };
// @ts-expect-error ts 지원하지 않습니다.
import VueResizeObserver from 'vue-resize-observer';
import ObserveVisibility from 'vue3-observe-visibility';

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
  EvContextMenu,
  EvWindow,
  EvButtonGroup,
  EvCalendar,
  EvChart,
  EvMenu,
  EvScheduler,
  EvSlider,
  EvTimePicker,
  EvTree,
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
  EvContextMenu,
  EvWindow,
  EvButtonGroup,
  EvCalendar,
  EvChart,
  EvMenu,
  EvScheduler,
  EvSlider,
  EvTimePicker,
  EvTree,
];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });

    app.use(VueResizeObserver);
    app.use(ObserveVisibility);

    app.config.globalProperties.$message = EvMessage;
    app.config.globalProperties.$messageBox = EvMessageBox;
    app.config.globalProperties.$notification = EvNotification;
  },
  version: pkg.version,
};
