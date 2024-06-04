import EvScheduler from './Scheduler.vue';

EvScheduler.install = (app) => {
  app.component(EvScheduler.name, EvScheduler);
};

export default EvScheduler;
