import type { App } from 'vue';
import EvLoading from './Loading.vue';

EvLoading.install = (app: App) => {
  app.component(EvLoading.name!, EvLoading);
};

export default EvLoading;
