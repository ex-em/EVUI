import './style/index.scss';
import EvButton from './components/button';
import type { App } from 'vue';

export { EvButton };

const components = [EvButton];

export default {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name!, component);
    });
  },
};
