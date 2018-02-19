<template>
  <div class="evui-chart-container">
    <canvas/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        value: 'canvas',
      };
    },
    computed: {},
    methods: {
      checkBrowserSupport() {
        const vm = this;
        const canvasDOM = vm.$el.getElementById('sample-canvas');

        return canvasDOM && canvasDOM.getContext();
      },
    },
  };
</script>
<style>
</style>
