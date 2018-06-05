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
      path: '/dock/dockframeSample',
      component: resolve => require(['./routers/dock/dockframeSample'], resolve),
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
      path: '/selectbox',
      component: resolve => require(['./routers/selectbox'], resolve),
    },
    {
      path: '/table',
      component: resolve => require(['./routers/table'], resolve),
    },
    {
      path: '/table2',
      component: resolve => require(['./routers/table2'], resolve),
    },
  ],
});

const app = new Vue({
  el : '#app',
  router,
  render: h => h(App),
});
