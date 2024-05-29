import './style/index.scss';
import EvButton from './components/button';
import EvMessage from './components/message';
import EvLoading from './components/loading';
import EvProgress from './components/progress';
import EvMessageBox from './components/messageBox';
import type { App } from 'vue';

export { EvButton, EvMessage, EvLoading, EvProgress, EvMessageBox };

const components = [EvButton, EvMessage, EvLoading, EvProgress, EvMessageBox];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });
  },
};
