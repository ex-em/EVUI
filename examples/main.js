import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app';
import EVUI from '../src/index';

Vue.use(VueRouter);
Vue.use(EVUI);
Vue.config.debug = true;

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/container',
      component: resolve => require(['./routers/container'], resolve),
    },
    {
      path: '/chart',
      component: resolve => require(['./routers/chart'], resolve),
    },
    {
      path: '/checkbox',
      component: resolve => require(['./routers/checkbox'], resolve),
    },
    {
      path: '/table',
      component: resolve => require(['./routers/table'], resolve),
    }
  ],
});

const app = new Vue({
  el : '#app',
  router,
  render: h => h(App),
});
