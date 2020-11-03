import { createRouter, createWebHistory } from 'vue-router';
import Intro from 'docs/views/Intro.vue';
import PageView from 'docs/views/PageView';
import buttonProps from 'docs/views/button/props';
import checkboxProps from 'docs/views/checkbox/props';
import selectProps from 'docs/views/select/props';
import toggleProps from 'docs/views/toggle/props';
import radioProps from 'docs/views/radio/props';
import textFieldProps from 'docs/views/textField/props';
import inputNumberProps from 'docs/views/inputNumber/props';
import sliderProps from 'docs/views/slider/props';
import iconProps from 'docs/views/icon/props';
import datePickerProps from 'docs/views/datePicker/props';
import calendarProps from 'docs/views/calendar/props';
import messageProps from 'docs/views/message/props';
import notificationProps from 'docs/views/notification/props';
import schedulerProps from 'docs/views/scheduler/props';

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
    component: PageView,
    props: buttonProps,
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
    component: PageView,
    props: radioProps,
  },
  {
    path: '/select',
    name: 'Select',
    component: PageView,
    props: selectProps,
  },
  {
    path: '/textField',
    name: 'TextField',
    component: PageView,
    props: textFieldProps,
  },
  {
    path: '/inputNumber',
    name: 'InputNumber',
    component: PageView,
    props: inputNumberProps,
  },
  {
    path: '/slider',
    name: 'Slider',
    component: PageView,
    props: sliderProps,
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
    path: '/calendar',
    name: 'Calendar',
    component: PageView,
    props: calendarProps,
  },
  {
    path: '/datePicker',
    name: 'DatePicker',
    component: PageView,
    props: datePickerProps,
  },
  {
    path: '/toggle',
    name: 'Toggle',
    component: PageView,
    props: toggleProps,
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
    component: PageView,
    props: iconProps,
  },
  {
    path: '/message',
    name: 'Message',
    component: PageView,
    props: messageProps,
  },
  {
    path: '/notification',
    name: 'Notification',
    component: PageView,
    props: notificationProps,
  },
  {
    path: '/scheduler',
    name: 'Scheduler',
    component: PageView,
    props: schedulerProps,
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
