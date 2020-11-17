import EvWindow from './Window';

EvWindow.install = (app) => {
  app.component(EvWindow.name, EvWindow);
};

export default EvWindow;
