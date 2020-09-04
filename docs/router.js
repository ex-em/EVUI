import Vue from 'vue';
import VueRouter from 'vue-router';


Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [{
      path: '/',
      component: () => import(/* webpackChunkName: 'intro' */ './pages/intro/intro'),
    }, {
      path: '/container',
      component: () => import(/* webpackChunkName: 'container' */ './pages/container/container'),
    }, {
      path: '/window',
      component: () => import(/* webpackChunkName: 'window' */ './pages/window/window'),
    }, {
      path: '/contextmenu',
      component: () => import(/* webpackChunkName: 'contextmenu' */ './pages/contextmenu/contextmenu'),
    }, {
      path: '/barchart',
      component: () => import(/* webpackChunkName: 'barchart' */ './pages/chart/bar/bar'),
    }, {
      path: '/linechart',
      component: () => import(/* webpackChunkName: 'linechart' */ './pages/chart/line/line'),
    }, {
      path: '/piechart',
      component: () => import(/* webpackChunkName: 'piechart' */ './pages/chart/pie/pie'),
    }, {
      path: '/combochart',
      component: () => import(/* webpackChunkName: 'combochart' */ './pages/chart/combo/combo'),
    }, {
      path: '/reactivitychart',
      component: () => import(/* webpackChunkName: 'reactivitychart' */ './pages/chart/reactivity/reactivity'),
    }, {
      path: '/scatterchart',
      component: () => import(/* webpackChunkName: 'scatterchart' */ './pages/chart/scatter/scatter'),
    }, {
      path: '/checkbox',
      component: () => import(/* webpackChunkName: 'checkbox' */ './pages/checkbox/checkbox'),
    }, {
      path: '/radio',
      component: () => import(/* webpackChunkName: 'radio' */ './pages/radio/radio'),
    }, {
      path: '/inputnumber',
      component: () => import(/* webpackChunkName: 'inputnumber' */ './pages/inputnumber/inputnumber'),
    }, {
      path: '/button',
      component: () => import(/* webpackChunkName: 'button' */ './pages/button/button'),
    }, {
      path: '/selectbox',
      component: () => import(/* webpackChunkName: 'selectbox' */ './pages/selectbox/selectbox'),
    }, {
      path: '/slider',
      component: () => import(/* webpackChunkName: 'slider' */ './pages/slider/slider'),
    }, {
      path: '/grid',
      component: () => import(/* webpackChunkName: 'grid' */ './pages/grid/grid'),
    }, {
    path: '/tree',
    component: () => import(/* webpackChunkName: 'tree' */ './pages/tree/tree.vue'),
    }, {
      path: '/treetable',
      component: () => import(/* webpackChunkName: 'tree' */ './pages/tree-table/tree.vue'),
    }, {
      path: '/menu',
      component: () => import(/* webpackChunkName: 'menu' */ './pages/menu/menu'),
    }, {
      path: '/loadingmask',
      component: () => import(/* webpackChunkName: 'loadingmask' */ './pages/loadingmask/loadingmask'),
    }, {
      path: '/timepicker',
      component: () => import(/* webpackChunkName: 'timepicker' */ './pages/timepicker/timepicker'),
    }, {
      path: '/datepicker',
      component: () => import(/* webpackChunkName: 'datepicker' */ './pages/datepicker/datepicker'),
    }, {
      path: '/toggle',
      component: () => import(/* webpackChunkName: 'toggle' */ './pages/toggle/toggle'),
    }, {
      path: '/label',
      component: () => import(/* webpackChunkName: 'label' */ './pages/label/label'),
    }, {
      path: '/textfield',
      component: () => import(/* webpackChunkName: 'textfield' */ './pages/textfield/textfield'),
    }, {
      path: '/tab',
      component: () => import(/* webpackChunkName: 'tab' */ './pages/tab/tab'),
    }, {
      path: '/icon',
      component: () => import(/* webpackChunkName: 'icon' */ './pages/icon/icon'),
    },
  ],
});

export default router;
