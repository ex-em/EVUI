import { createApp } from 'vue';
import EVUI, { EvMessageBox, EvMessage, EvNotification } from '@/main';
import Example from './components/Example.vue';
import ResizableWrapper from './components/ResizableWrapper.vue';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.component('Example', Example);
app.component('ResizableWrapper', ResizableWrapper);

app.config.globalProperties.$messagebox = EvMessageBox;
app.config.globalProperties.$messagex = EvMessage;
app.config.globalProperties.$notify = EvNotification;

app.use(router).use(EVUI).mount('#app');
