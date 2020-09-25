import { createRouter, createWebHistory } from 'vue-router';
import Intro from 'docs/views/Intro.vue';
import PageView from 'docs/components/PageView';
import checkboxProps from 'docs/views/checkbox/props';

const routes = [
  {
    path: '/',
    name: 'Intro',
    component: Intro,
  },
  {
    path: '/tab',
    name: 'Tab',
    component: () => import(/* webpackChunkName: "tab" */ '../views/tab'),
  },
  {
    path: '/contextMenu',
    name: 'ContextMenu',
    component: () => import(/* webpackChunkName: "contextMenu" */ '../views/contextMenu'),
  },
  {
    path: '/button',
    name: 'Button',
    component: () => import(/* webpackChunkName: "button" */ '../views/button'),
  },
  {
    path: '/checkbox',
    name: 'Checkbox',
    component: PageView,
    props: checkboxProps,
  },
  {
    path: '/radio',
    name: 'Radio',
    component: () => import(/* webpackChunkName: "radio" */ '../views/radio'),
  },
  {
    path: '/inputNumber',
    name: 'InputNumber',
    component: () => import(/* webpackChunkName: "inputNumber" */ '../views/inputNumber'),
  },
  {
    path: '/select',
    name: 'Select',
    component: () => import(/* webpackChunkName: "select" */ '../views/select'),
  },
  {
    path: '/slider',
    name: 'Slider',
    component: () => import(/* webpackChunkName: "slider" */ '../views/slider'),
  },
  {
    path: '/grid',
    name: 'Grid',
    component: () => import(/* webpackChunkName: "grid" */ '../views/grid'),
  },
  {
    path: '/tree',
    name: 'Tree',
    component: () => import(/* webpackChunkName: "tree" */ '../views/tree'),
  },
  {
    path: '/treeTable',
    name: 'TreeTable',
    component: () => import(/* webpackChunkName: "treeTable" */ '../views/treeTable'),
  },
  {
    path: '/datePicker',
    name: 'DatePicker',
    component: () => import(/* webpackChunkName: "datePicker" */ '../views/datePicker'),
  },
  {
    path: '/toggle',
    name: 'Toggle',
    component: () => import(/* webpackChunkName: "toggle" */ '../views/toggle'),
  },
  {
    path: '/textField',
    name: 'TextField',
    component: () => import(/* webpackChunkName: "textField" */ '../views/textField'),
  },
  {
    path: '/barChart',
    name: 'BarChart',
    component: () => import(/* webpackChunkName: "barChart" */ '../views/barChart'),
  },
  {
    path: '/lineChart',
    name: 'LineChart',
    component: () => import(/* webpackChunkName: "lineChart" */ '../views/lineChart'),
  },
  {
    path: '/scatterChart',
    name: 'ScatterChart',
    component: () => import(/* webpackChunkName: "scatterChart" */ '../views/scatterChart'),
  },
  {
    path: '/pieChart',
    name: 'PieChart',
    component: () => import(/* webpackChunkName: "pieChart" */ '../views/pieChart'),
  },
  {
    path: '/comboChart',
    name: 'ComboChart',
    component: () => import(/* webpackChunkName: "comboChart" */ '../views/comboChart'),
  },
  {
    path: '/reactivityChart',
    name: 'ReactivityChart',
    component: () => import(/* webpackChunkName: "reactivityChart" */ '../views/reactivityChart'),
  },
  {
    path: '/icon',
    name: 'Icon',
    component: () => import(/* webpackChunkName: "icon" */ '../views/icon'),
  },
  {
    path: '/:catchAll(.*)',
    name: 'PageNotFound',
    component: () => import(/* webpackChunkName: "pageNotFound" */ '../views/PageNotFound'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
