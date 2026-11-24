import type { App } from 'vue';
import EvProgress from './Progress.vue';

const progress: typeof EvProgress & { install(app: App): void } = Object.assign(EvProgress, {
  install(app: App) {
    app.component(EvProgress.name!, EvProgress);
  },
});

export default progress;
