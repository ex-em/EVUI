import './style/index.scss';
import EvButton from './components/button';
import EvMessage from './components/message';
import EvLoading from './components/loading';
import type { App } from 'vue';

export { EvButton, EvMessage, EvLoading };

const components = [EvButton, EvMessage, EvLoading];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });
  },
};
