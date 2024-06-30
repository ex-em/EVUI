import EvWindow from './Window.vue';

EvWindow.install = (app) => {
  app.component(EvWindow.name, EvWindow);
};

export default EvWindow;
