import type { App } from 'vue';
import EvIcon from './Icon.vue';

export { iconList } from './icon-list';

EvIcon.install = (app: App) => {
  app.component(EvIcon.name!, EvIcon);
}

export default EvIcon;
