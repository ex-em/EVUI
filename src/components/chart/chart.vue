<template>
  <div
    class="evui-chart-container"
    :style="styleObj"
  >
    <canvas
      :width="styleObj.width"
      :height="styleObj.height"
    />
  </div>
</template>
<script>
  export default {
    props: {
      name: {
        type: String,
        default: 'Chart',
      },
      width: {
        type: [String, Number],
        default: '100%',
      },
      height: {
        type: [String, Number],
        default: '100%',
      },
    },
    computed: {
      styleObj() {
        const style = {
          width: `${this.width}px`,
          height: `${this.height}px`,
          background: '#000',
        };
        return style;
      },
    },
    mounted() {
      this.canvasDOM = this.checkCanvasElement();

      if (!this.canvasDOM) {
        throw new Error('Cannot get canvas. Please Check this Browser Support Canvas element');
      }
    },
    methods: {
      checkCanvasElement() {
        const vm = this;
        const canvasDOM = vm.$el.getElementsByTagName('canvas')[0];
        let retCanvas = false;

        if (canvasDOM && canvasDOM.getContext('2d')) {
          retCanvas = canvasDOM;
        }

        return retCanvas;
      },
    },
  };
</script>
<style>
</style>
