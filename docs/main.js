import Vue from 'vue';
import rowdata from '@/components/table/data.json';
import App from './app';
import EVUI from '../src/';
import router from './router';

import ApiView from './components/api-view';
import Example from './components/example';

Vue.use(EVUI);
Vue.config.debug = true;
Vue.prototype.$tableData = rowdata;

Vue.component('ApiView', ApiView);
Vue.component('Example', Example);

const app = new Vue({
  el: '#app',
  router,
  render: h => h(App),
});

export default app;
