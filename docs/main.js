import { createApp } from 'vue';
import EVUI, { EvMessageBox, EvMessage, EvNotification } from '../dist';
import '../dist/style.css';
import Example from './components/Example.vue';

import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

app.component('Example', Example);

app.config.globalProperties.$messagebox = EvMessageBox;
app.config.globalProperties.$messagex = EvMessage;
app.config.globalProperties.$notify = EvNotification;

app.use(store)
.use(router)
.use(EVUI)
.mount('#app');
