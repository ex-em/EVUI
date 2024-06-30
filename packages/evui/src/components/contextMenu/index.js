import EvContextMenu from './ContextMenu';

EvContextMenu.install = (app) => {
  app.component(EvContextMenu.name, EvContextMenu);
};

export default EvContextMenu;
