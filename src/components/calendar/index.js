import EvCalendar from './Calendar';

EvCalendar.install = (app) => {
  app.component(EvCalendar.name, EvCalendar);
};

export default EvCalendar;
