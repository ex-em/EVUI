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
      path: '/helloworld',
      component: resolve => require(['./routers/HelloWorld'], resolve),
    },
    {
      path: '/textbox',
      component: resolve => require(['./routers/TextBox'], resolve),
    },
  ],
});

const app = new Vue({
  el : '#app',
  router,
  render: h => h(App),
});
