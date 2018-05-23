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
  import ScatterChart from './charts/chart.scatter';
  import BarChart from './charts/chart.bar';
  import PieChart from './charts/chart.pie';

  export default {
    props: {
      options: {
        type: Object,
        default() {
          return {
            type: 'line',
            xAxes: [],
            yAxes: [],
          };
        },
      },
      data: {
        type: Object,
        default() {
          return {
            series: [],
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
        width: this.getChartSize(Util.quantity(this.options.width)),
        height: this.getChartSize(Util.quantity(this.options.height)),
      };
    },
    mounted() {
      const chartType = this.$props.options.type || '';

      switch (chartType.toLowerCase()) {
        case 'line':
          this.chart = new LineChart(this.$refs.wrapper, this.$props.data, this.$props.options);
          break;
        case 'scatter':
          this.chart = new ScatterChart(this.$refs.wrapper, this.$props.data, this.$props.options);
          break;
        case 'bar':
          this.chart = new BarChart(this.$refs.wrapper, this.$props.data, this.$props.options);
          break;
        case 'pie':
          this.chart = new PieChart(this.$refs.wrapper, this.$props.data, this.$props.options);
          break;
        default:
          this.chart = new LineChart(this.$refs.wrapper, this.$props.data, this.$props.options);
          break;
      }

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
