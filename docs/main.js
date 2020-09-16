import { createApp } from 'vue';
import EVUI from '@/main';
import Example from './components/Example.vue';

import App from './App.vue';
import router from './router';
import store from './store';
import 'highlight.js/styles/github.css';

const app = createApp(App);

app.component('Example', Example);

app.use(store)
  .use(router)
  .use(EVUI)
  .mount('#app');
