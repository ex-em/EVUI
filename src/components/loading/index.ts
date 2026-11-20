import type { App } from 'vue';
import EvLoading from './Loading.vue';

const loading: typeof EvLoading & { install(app: App): void } = Object.assign(EvLoading, {
  install(app: App) {
    app.component(EvLoading.name!, EvLoading);
  },
});

export default loading;
