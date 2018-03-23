<template>
  <div
    ref="wrapper"
    class="evui-chart"
    :style="wrapperSize"
  >
    <canvas
      ref="canvas"
    >
      Please Check this Browser Support Canvas element
    </canvas>
  </div>
</template>
<script>
  import Util from './core/core.util';
  import Chart from './charts/chart.base';

  export default {
    props: {
      chartData: {
        type: Array,
        default() {
          return [];
        },
      },
      chartProps: {
        type: Object,
        default() {
          return {};
        },
      },
      chartStyles: {
        type: Object,
        default() {
          return {
            width: '100%',
            height: '100%',
          };
        },
      },
    },
    data() {
      return {
        chartHeight: null,
        chartWidth: null,
        xMax: null,
        yMax: null,
        ratio: null,
        ctx: null,
        canvas: null,
        maxYValue: 0,
      };
    },
    created() {
      // using wrapper div
      this.wrapperSize = {
        width: this.getChartSize(Util.quantity(this.chartStyles.width)),
        height: this.getChartSize(Util.quantity(this.chartStyles.height)),
      };
    },
    mounted() {
      if (!this.checkCanvasElement()) {
        throw new Error('[EVUI][ERROR][Chart]-Cannot get canvas. Please Check this Browser Support Canvas element');
      } else {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext('2d');

        canvas.width = this.$refs.wrapper.getClientRects()[0].width;
        canvas.height = this.$refs.wrapper.getClientRects()[0].height;

        this.chart = new Chart(canvas, ctx, {
          vm: this,
          data: this.chartData,
          props: this.chartProps,
          styles: this.chartStyles,
        });
        this.chart.init();
      }
    },
    methods: {
      getChartSize(size) {
        let sizeValue;

        if (size) {
          sizeValue = size.unit ? size.value + size.unit : `${size.value}px`;
        } else {
          sizeValue = undefined;
        }
        return sizeValue;
      },
      checkCanvasElement() {
        const vm = this;
        const canvas = vm.$refs.canvas;

        return !!(canvas && canvas.getContext('2d'));
      },
    },
  };
</script>
<style>
</style>
