import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import EVUI from '../src/index';

/* eslint-disable */
Vue.use(VueRouter);
Vue.use(EVUI);
Vue.config.debug = true;

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: resolve => require(['./routers/HelloWorld'], resolve),
    },
    {
      path: '/test1',
      component: resolve => require(['./routers/TextBox'], resolve),
    },
  ],
});

const app = new Vue({
  el : '#app',
  router,
  render: h => h(App),
});
