<template>
  <div class="evui-chart-container">
    <canvas></canvas>
  </div>
</template>

<script>
  export default {
    name: 'evui-chart',
    computed: {},
    methods: {
      checkBrowserSupport() {
        const vm = this;
        let canvasDOM = vm.$el.getElementById('sample-canvas');

        return canvasDOM && canvasDOM.getContext();
      }
    },
    data() {
      return {
        value : 'canvas'
      };
    }
  }
</script>
<style>
</style>
