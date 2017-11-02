import Vue from 'vue';
import Router from 'vue-router';
import Navi from './vue/Navigation.vue';
import Grid from './vue/grid/GridView.vue';
import TGrid from './vue/tgrid/TGridView.vue';
import Tree from './vue/tree/TreeView.vue';
import Chart from './vue/chart/examples/BarExample.vue';



Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Navi
        }, {
            path: '/grid',
            component: Grid
        }, {
            path: '/tgrid',
            component: TGrid
        }, {
            path: '/tree',
            component: Tree
        }, {
            path: '/chart',
            component: Chart
        }
    ]
});
