import '@/style/lib/icon.css';
import EvIcon from './Icon.vue';
export * from './icon-list';

EvIcon.install = (app) => {
  app.component(EvIcon.name, EvIcon);
};

export default EvIcon;
