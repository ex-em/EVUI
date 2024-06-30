import EvScheduler from './Scheduler';

EvScheduler.install = (app) => {
  app.component(EvScheduler.name, EvScheduler);
};

export default EvScheduler;
