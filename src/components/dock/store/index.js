import Vue from 'vue';
import Vuex from 'vuex';
import nodes from './modules/nodes';
import windows from './modules/windows';
import splitters from './modules/splitters';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    nodes,
    windows,
    splitters,
  },
});
