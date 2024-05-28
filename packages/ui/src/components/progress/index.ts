import type { App } from 'vue';
import EvProgress from './Progress.vue';

EvProgress.install = (app: App) => {
  app.component(EvProgress.name!, EvProgress);
}

export default EvProgress;
