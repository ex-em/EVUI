import Vue from 'vue';
import Axios from 'axios';
import VueRouter from 'vue-router';
import App from './app';
import EVUI from '../src/index';
import 'codemirror/lib/codemirror.css';

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
      component: resolve => require(['./guide/components/container'], resolve),
    },
    {
      path: '/dock/dockframeSample',
      component: resolve => require(['./guide/components/dock/dockframeSample'], resolve),
    },
    {
      path: '/chart',
      component: resolve => require(['./guide/components/chart'], resolve),
    },
    {
      path: '/checkbox',
      component: resolve => require(['./guide/components/checkbox'], resolve),
    },
    {
      path: '/selectbox',
      component: resolve => require(['./guide/components/selectbox'], resolve),
    },
    {
      path: '/table',
      component: resolve => require(['./guide/components/table'], resolve),
    },
    {
      path: '/table2',
      component: resolve => require(['./guide/components/table2'], resolve),
    },
    {
      path: '/menu',
      component: resolve => require(['./guide/components/menu'], resolve),
    },
    {
      path: '/code',
      component: resolve => require(['./guide/components/code'], resolve),
    },
  ],
});

const app = new Vue({
  el: '#app',
  router,
  render: h => h(App),
});

export default app;
