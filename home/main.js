import Vue from 'vue';
import Axios from 'axios';
import VueRouter from 'vue-router';
import App from './app';
import EVUI from '../src/index';

require('codemirror/mode/vue/vue');

Vue.use(VueRouter);
Vue.use(EVUI);
Vue.prototype.$http = Axios;
Vue.config.debug = true;

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: resolve => require(['./guide/views/intro'], resolve),
    },
    {
      path: '/container',
      component: resolve => require(['./guide/views/examples/container/container-view'], resolve),
    },
    {
      path: '/dock',
      component: resolve => require(['./guide/views/examples/dock/dockframe-view'], resolve),
    },
    {
      path: '/chart',
      component: resolve => require(['./guide/views/examples/chart/chart-view'], resolve),
    },
    {
      path: '/checkbox',
      component: resolve => require(['./guide/views/examples/checkbox/checkbox-view'], resolve),
    },
    {
      path: '/selectbox',
      component: resolve => require(['./guide/views/examples/selectbox/selectbox-view'], resolve),
    },
    {
      path: '/table',
      component: resolve => require(['./guide/views/examples/table/table-view'], resolve),
    },
    {
      path: '/menu',
      component: resolve => require(['./guide/views/examples/menu/menu-view'], resolve),
    },
  ],
});

const app = new Vue({
  el: '#app',
  router,
  render: h => h(App),
});

export default app;
