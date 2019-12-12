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
      path: '/button',
      component: resolve => require(['./routers/button'], resolve),
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
      path: '/slider',
      component: resolve => require(['./routers/slider'], resolve),
    },
    {
      path: '/table',
      component: resolve => require(['./routers/table'], resolve),
    },
    {
      path: '/table2',
      component: resolve => require(['./routers/table2'], resolve),
    },
    {
      path: '/menu',
      component: resolve => require(['./routers/menu'], resolve),
    },
    {
      path: '/code',
      component: resolve => require(['./routers/code'], resolve),
    },
    {
      path: '/table3',
      component: resolve => require(['./routers/table3'], resolve),
    },
    {
      path: '/loadingmask',
      component: resolve => require(['./routers/loadingmask'], resolve),
    },
    {
      path: '/timepicker',
      component: resolve => require(['./routers/timepicker'], resolve),
    },
    {
      path: '/toggle',
      component: resolve => require(['./routers/toggle'], resolve),
    },
    {
      path: '/message',
      component: resolve => require(['./routers/message'], resolve),
    },
    {
      path: '/notification',
      component: resolve => require(['./routers/notification'], resolve),
    },
    {
      path: '/message-box',
      component: resolve => require(['./routers/message-box'], resolve),
    },
  ],
});

const app = new Vue({
  el : '#app',
  router,
  render: h => h(App),
});
