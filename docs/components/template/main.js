/* eslint-disable */
import Vue from "vue";
import EVUI from "evui";
import App from "./App.vue";

Vue.use(EVUI);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount('#app');
