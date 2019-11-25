<template>
  <div class="app">
    <main-header/>
    <main-content/>
  </div>
</template>
<script>
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

<style scoped lang="scss">
  @import '~evui/styles/default';

  * {
    font-family: 'NanumGothic', Arial, "Helvetica Neue", Helvetica, sans-serif;
  }

  .app {
    padding-top: 55px;
  }
</style>
