import EvTabs from './Tabs.vue';
import VueResizeObserver from 'vue-resize-observer';
import ObserveVisibility from 'vue3-observe-visibility';

EvTabs.install = (app) => {
  app.component(EvTabs.name, EvTabs);
  app.use(VueResizeObserver);
  app.use(ObserveVisibility);
};

export default EvTabs;
