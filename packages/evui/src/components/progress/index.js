import EvProgress from './Progress.vue';

EvProgress.install = (app) => {
  app.component(EvProgress.name, EvProgress);
};

export default EvProgress;
