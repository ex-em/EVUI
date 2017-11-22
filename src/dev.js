import Vue from 'vue';
import Axios from 'axios'
import App from './vue/App.vue';
import router from './router.js';

Vue.prototype.$http = Axios;

new Vue({
    el: '#index-app',
    router,
    render: h => h(App)
});
