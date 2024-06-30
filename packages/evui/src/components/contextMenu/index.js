import EvContextMenu from './ContextMenu.vue';

EvContextMenu.install = (app) => {
  app.component(EvContextMenu.name, EvContextMenu);
};

export default EvContextMenu;
