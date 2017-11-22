import Vue from 'vue';
import Icon from 'vue-awesome/components/Icon.vue';
import App from './vue/App.vue';
import router from './router.js';

Vue.use(Icon);
Vue.component('icon', Icon);

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
