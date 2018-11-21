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
      component: () => import(/* webpackChunkName: 'intro' */ './guide/views/intro'),
    },
    {
      path: '/container',
      component: () => import(/* webpackChunkName: 'container' */ './guide/views/examples/container/container-view'),
    },
    {
      path: '/dock',
      component: () => import(/* webpackChunkName: 'dock' */ './guide/views/examples/dock/dock-view'),
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
      component: () => import(/* webpackChunkName: 'barchart' */ './guide/views/examples/chart/chart-bar-view'),
    },
    {
      path: '/linechart',
      component: () => import(/* webpackChunkName: 'linechart' */ './guide/views/examples/chart/chart-line-view'),
    },
    {
      path: '/piechart',
      component: () => import(/* webpackChunkName: 'piechart' */ './guide/views/examples/chart/chart-pie-view'),
    },
    {
      path: '/checkbox',
      component: () => import(/* webpackChunkName: 'checkbox' */ './guide/views/examples/checkbox/checkbox-view'),
    },
    {
      path: '/radio',
      component: () => import(/* webpackChunkName: 'radio' */ './guide/views/examples/radio/radio-view'),
    },
    {
      path: '/inputnumber',
      component: () => import(/* webpackChunkName: 'inputnumber' */ './guide/views/examples/inputnumber/input-number-view'),
    },
    {
      path: '/button',
      component: () => import(/* webpackChunkName: 'button' */ './guide/views/examples/button/button-view'),
    },
    {
      path: '/selectbox',
      component: () => import(/* webpackChunkName: 'selectbox' */ './guide/views/examples/selectbox/selectbox-view'),
    },
    {
      path: '/slider',
      component: () => import(/* webpackChunkName: 'slider' */ './guide/views/examples/slider/slider-view'),
    },
    {
      path: '/table',
      component: () => import(/* webpackChunkName: 'table' */ './guide/views/examples/table/table-view'),
    },
    {
      path: '/tree',
      component: resolve => require(['./guide/views/examples/tree/tree-table-view'], resolve),
    },
    {
      path: '/menu',
      component: () => import(/* webpackChunkName: 'menu' */ './guide/views/examples/menu/menu-view'),
    },
    {
      path: '/loadingmask',
      component: () => import(/* webpackChunkName: 'loadingmask' */ './guide/views/examples/loadingmask/loadingmask-view'),
    },
    {
      path: '/timepicker',
      component: () => import(/* webpackChunkName: 'timepicker' */ './guide/views/examples/timepicker/timepicker-view'),
    },
    {
      path: '/datepicker',
      component: () => import(/* webpackChunkName: 'datepicker' */ './guide/views/examples/datepicker/datepicker-view'),
    },
    {
      path: '/toggle',
      component: () => import(/* webpackChunkName: 'toggle' */ './guide/views/examples/toggle/toggle-view'),
    },
    {
      path: '/label',
      component: () => import(/* webpackChunkName: 'label' */ './guide/views/examples/label/label-view'),
    },
    {
      path: '/textfield',
      component: () => import(/* webpackChunkName: 'textfield' */ './guide/views/examples/textfield/textfield-view'),
    },
    {
      path: '/tab',
      component: () => import(/* webpackChunkName: 'tab' */ './guide/views/examples/tab/tab-view'),
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
