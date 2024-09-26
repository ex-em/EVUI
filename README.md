# evui 3.0

## Project setup

```sh
npm i -D evui
```

## Compiles library for product

```sh
npm run build:lib
```

## Compiles and hot-reloads for development document project

- Node 12 is required to run the official documentation locally.
- We will upload the node version later.
- DOCUMENT : <https://ex-em.github.io/EVUI>

```sh
npm run docs
```

## Compiles and hot-reloads for development

```sh
npm run serve
```

## Compiles and minifies for production

```sh
npm run build
```

## Run your unit tests

```sh
npm run test:unit
```

## Use Vue3 Project

```ts
// main.ts
import App from '@/App.vue';
import EVUI from 'evui';

const app = createApp(App);

app.use(EVUI);

app.mount('#app');
```

## Using Message Component

```ts
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
