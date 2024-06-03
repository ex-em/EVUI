import type { App } from 'vue';
import EvPagination from './Pagination.vue';

EvPagination.install = (app: App) => {
  app.component('EvPagination', EvPagination);
};

export default EvPagination;
