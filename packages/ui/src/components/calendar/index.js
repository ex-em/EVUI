import EvCalendar from './Calendar.vue';

EvCalendar.install = (app) => {
  app.component(EvCalendar.name, EvCalendar);
};

export default EvCalendar;
