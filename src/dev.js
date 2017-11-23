import Vue from 'vue';
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue';
import Axios from 'axios'
import App from './vue/App.vue';
import router from './router.js';

Vue.use(Icon);
Vue.component('icon', Icon);

Vue.prototype.$http = Axios;

new Vue({
    el: '#index-app',
    router,
    render: h => h(App)
});
