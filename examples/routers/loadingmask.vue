<template>
  <div style="width: 500px; height: 500px;">
    <loadingmask
      v-show="true"
      :bar-count="13"
    />
  </div>
</template>

<script>
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

<style lang="scss">
  @import '~@/styles/default';
</style>
