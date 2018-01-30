import Vue from 'vue';
import App from '../src/App.vue';
import router from '../src/router';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
