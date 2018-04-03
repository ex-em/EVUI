<template>
  <div
    ref="wrapper"
    :style="wrapperSize"
    class="evui-chart"
  />
</template>
<script>
  import Util from './core/core.util';
  import Chart from './charts/chart.base';

  export default {
    props: {
      chartType: {
        type: String,
        default: 'line',
      },
      chartData: {
        type: Object,
        default() {
          return {};
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
        chart: null,
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
      this.chart = new Chart({
        target: this.$refs.wrapper,
        vm: this,
        data: this.chartData,
        props: this.chartProps,
        styles: this.chartStyles,
        type: this.chartType,
      });
      this.chart.init();
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
  .evui-chart-outer{
    position:relative;
    top:0px;
    left:0px;
    width:100%;
    height:100%;
  }

  .evui-chart-inner{
    position:relative;
    top:0px;
    left:0px;
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
