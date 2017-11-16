import Chart from './vue/chartT/Chart.vue'
import Grid from './vue/grid/Grid.vue'
import Tree from './vue/tree/Tree.vue'

const EVUI = {};

EVUI.install = function (Vue) {
    Vue.component('Chart', Chart);
    Vue.component('Grid', Grid);
    Vue.component('Tree', Tree);
};


if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(EVUI)
}

export default EVUI;