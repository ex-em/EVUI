<template>
  <loadingmask
    class="loadingBackground"
  />
</template>

<script>
  import '@/styles/evui.css';
  import loadingmask from '@/components/loadingmask/loadingmask';

  export default {
    name: 'Loadingmask',
    components: {
      loadingmask,
    },
    data() {
      return {
      };
    },
    methods: {
    },
  };
</script>

<style scoped>
  .loadingBackground
  {
    background-color: #172027;
  }
</style>
