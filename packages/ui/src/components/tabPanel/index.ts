import type { App } from 'vue';
import EvTabPanel from './TabPanel.vue';

EvTabPanel.install = (app: App) => {
  app.component(EvTabPanel.name!, EvTabPanel);
};

export default EvTabPanel;
