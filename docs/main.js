import { createApp } from 'vue';
import EVUI from '@/main';
import Example from './components/Example.vue';
import ResizableWrapper from './components/ResizableWrapper.vue';

import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

app.component('Example', Example);
app.component('ResizableWrapper', ResizableWrapper);

app.use(store)
  .use(router)
  .use(EVUI)
  .mount('#app');
