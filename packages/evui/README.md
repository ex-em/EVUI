# evui 3.0

### Project setup
```
npm i -D evui
```

### Compiles library for product
```
npm run build:lib
```

### Compiles and hot-reloads for development document project
- Node 12 is required to run the official documentation locally.
- We will upload the node version later.
- DOCUMENT : https://ex-em.github.io/EVUI
```
npm run docs
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Use Vue3 Project
```
// main.ts
import App from '@/App.vue';
import EVUI from 'evui';

const app = createApp(App);

app.use(EVUI);

app.mount('#app');
```

### Using Message Component
```
// main.ts
import App from '@/App.vue';
import { EvMessageBox, EvMessage, EvNotification } from 'evui';

const app = createApp(App);

app.use(EVUI);
app.config.globalProperties.$messagebox = EvMessageBox;
app.config.globalProperties.$messagex = EvMessage;
app.config.globalProperties.$notify = EvNotification;

app.mount('#app');
```
