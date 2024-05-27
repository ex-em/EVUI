import './style/index.scss';
import EvButton from './components/button';
import EvMessage from './components/message';
import type { App } from 'vue';

export { EvButton, EvMessage };

const components = [EvButton, EvMessage];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });
  },
};
