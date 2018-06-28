<template>
  <div>
    <main-header/>
    <main-content/>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import mainHeader from './guide/views/header';
  import mainContent from './guide/views/content';

  export default {
    name: 'App',
    components: {
      mainHeader,
      mainContent,
    },
  };
</script>

<style scoped>
  nav { margin-bottom: 40px; }
  ul { display: flex; flex-wrap: wrap; }
  li { display: inline-block; }
  li + li { border-left: solid 1px #bbb; padding-left: 10px; margin-left: 10px; }
  .container{ padding: 10px 40px 0; }
  .v-link-active { color: #bbb; }
</style>
