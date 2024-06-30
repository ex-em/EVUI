import EvMenu from './Menu.vue';

EvMenu.install = (app) => {
  app.component(EvMenu.name, EvMenu);
};

export default EvMenu;
