import '@/style/lib/icon.css';
import EvIcon from './Icon';

EvIcon.install = (app) => {
  app.component(EvIcon.name, EvIcon);
};

export default EvIcon;
