import Vue from 'vue';
import Axios from 'axios';
import VueRouter from 'vue-router';
import App from './app';
import EVUI from '../src/index';
import rowdata from '@/components/table/data.json';

require('codemirror/mode/vue/vue');

Vue.use(VueRouter);
Vue.use(EVUI);
Vue.prototype.$http = Axios;
Vue.config.debug = true;
Vue.prototype.$tableData = rowdata;
Vue.prototype.$Vue = Vue;

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
      component: resolve => require(['./guide/views/examples/dock/dock-view'], resolve),
    },
    {
      path: '/window',
      component: resolve => require(['./guide/views/examples/window/window-view'], resolve),
    },
    {
      path: '/contextmenu',
      component: resolve => require(['./guide/views/examples/contextmenu/contextmenu-view'], resolve),
    },
    {
      path: '/barchart',
      component: resolve => require(['./guide/views/examples/chart/chart-bar-view'], resolve),
    },
    {
      path: '/linechart',
      component: resolve => require(['./guide/views/examples/chart/chart-line-view'], resolve),
    },
    {
      path: '/piechart',
      component: resolve => require(['./guide/views/examples/chart/chart-pie-view'], resolve),
    },
    {
      path: '/combochart',
      component: () => import(/* webpackChunkName: 'combochart' */ './guide/views/examples/chart/chart-combo-view'),
    },
    {
      path: '/combochart',
      component: () => import(/* webpackChunkName: 'combochart' */ './guide/views/examples/chart/chart-combo-view'),
    },
    {
      path: '/checkbox',
      component: resolve => require(['./guide/views/examples/checkbox/checkbox-view'], resolve),
    },
    {
      path: '/radio',
      component: resolve => require(['./guide/views/examples/radio/radio-view'], resolve),
    },
    {
      path: '/inputnumber',
      component: resolve => require(['./guide/views/examples/inputnumber/input-number-view'], resolve),
    },
    {
      path: '/button',
      component: resolve => require(['./guide/views/examples/button/button-view'], resolve),
    },
    {
      path: '/selectbox',
      component: resolve => require(['./guide/views/examples/selectbox/selectbox-view'], resolve),
    },
    {
      path: '/slider',
      component: resolve => require(['./guide/views/examples/slider/slider-view'], resolve),
    },
    {
      path: '/table',
      component: resolve => require(['./guide/views/examples/table/table-view'], resolve),
    },
    {
      path: '/tree',
      component: resolve => require(['./guide/views/examples/tree/tree-table-view'], resolve),
    },
    {
      path: '/menu',
      component: resolve => require(['./guide/views/examples/menu/menu-view'], resolve),
    },
    {
      path: '/loadingmask',
      component: resolve => require(['./guide/views/examples/loadingmask/loadingmask-view'], resolve),
    },
    {
      path: '/timepicker',
      component: resolve => require(['./guide/views/examples/timepicker/timepicker-view'], resolve),
    },
    {
      path: '/datepicker',
      component: resolve => require(['./guide/views/examples/datepicker/datepicker-view'], resolve),
    },
    {
      path: '/toggle',
      component: resolve => require(['./guide/views/examples/toggle/toggle-view'], resolve),
    },
    {
      path: '/label',
      component: resolve => require(['./guide/views/examples/label/label-view'], resolve),
    },
    {
      path: '/textfield',
      component: resolve => require(['./guide/views/examples/textfield/textfield-view'], resolve),
    },
    {
      path: '/tab',
      component: resolve => require(['./guide/views/examples/tab/tab-view'], resolve),
    },
    {
      path: '/icon',
      component: resolve => require(['./guide/views/examples/icon/icon-view'], resolve),
    },
  ],
});

const app = new Vue({
  el: '#app',
  router,
  render: h => h(App),
});

export default app;
