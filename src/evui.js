import Chart from './vue/chartT/Chart.vue'
import Grid from './vue/grid/Grid.vue'
import Tree from './vue/tree/Tree.vue'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
const EVUI = {};

EVUI.install = function (Vue) {
    Vue.use(Icon);
    Vue.component('icon', Icon);
    Vue.component('Chart', Chart);
    Vue.component('Grid', Grid);
    Vue.component('Tree', Tree);
};


if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(EVUI)
}

export default EVUI;
