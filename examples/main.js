import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import EVUI from '../src/index';


Vue.use(VueRouter);
Vue.use(EVUI);
Vue.config.debug = true;

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/Container',
      component: resolve => require(['./routers/Container'], resolve),
    },
    {
      path: '/Chart',
      component: resolve => require(['./routers/Chart'], resolve),
    }
  ],
});

const app = new Vue({
  el : '#app',
  router,
  render: h => h(App),
});
