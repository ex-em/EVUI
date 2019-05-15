<template>
  <div class="app">
    <main-header/>
    <main-content/>
  </div>
</template>
<script>
  import '@/styles/evui.css';

  import mainHeader from './components/header';
  import mainContent from './components/content';

  export default {
    name: 'App',
    components: {
      mainHeader,
      mainContent,
    },
  };
</script>

<style scoped>
  * {
    font-family: 'NanumGothic', Arial, "Helvetica Neue", Helvetica, sans-serif;
  }
</style>
<style>
  body {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .app {
    position: absolute;
    width: 100%;
    height: 100%;
    padding-top: 55px;
  }
</style>
