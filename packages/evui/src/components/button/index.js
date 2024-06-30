import EvButton from './Button.vue';

EvButton.install = (app) => {
  app.component(EvButton.name, EvButton);
};

export default EvButton;
