# evui 3.5.0-rc.1

## Project setup

```sh
npm i evui
```

## Compiles library for product

```sh
npm run build:lib
```

## Compiles and hot-reloads for development document project

- DOCUMENT : <https://ex-em.github.io/EVUI>

```sh
npm run docs
```

## Use Vue3 Project

```ts
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
import 'evui/style';

const app = createApp(App);

app.use(EVUI);

app.mount('#app');
```
