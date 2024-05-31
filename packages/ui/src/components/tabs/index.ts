import type { App } from 'vue';
import EvTabs from './Tabs.vue';

EvTabs.install = (app: App) => {
  app.component(EvTabs.name!, EvTabs);
};

export default EvTabs;
