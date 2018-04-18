<template>
  <div
    ref="wrapper"
    :style="wrapperSize"
    class="evui-chart"
  />
</template>
<script>
  import Util from './core/core.util';
  import LineChart from './charts/chart.line';

  export default {
    props: {
      options: {
        type: Object,
        default() {
          return {};
        },
      },
      data: {
        type: Object,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        chart: null,
      };
    },
    created() {
      // using wrapper div
      this.wrapperSize = {
        width: this.getChartSize(Util.quantity(this.options.width)),
        height: this.getChartSize(Util.quantity(this.options.height)),
      };
    },
    mounted() {
      this.chart = new LineChart(this.$refs.wrapper, this.$props.data, this.$props.options);
      this.chart.createChart();
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
    },
  };
</script>
<style>
  .evui-chart-inner{
    position:relative;
    top:0;
    left:0;
    width:100%;
    height:100%;
  }

  .evui-chart-title{
    position: absolute;
    top: 0px;
    width: 100%;
    padding-left: 10px;
    word-wrap: normal;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
