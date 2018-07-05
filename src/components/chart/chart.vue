<template>
  <div
    ref="wrapper"
    :style="wrapperSize"
  />
</template>
<script>
  import Util from './core/core.util';
  import LineChart from './charts/chart.line';
  import ScatterChart from './charts/chart.scatter';
  import BarChart from './charts/chart.bar';
  import PieChart from './charts/chart.pie';
  import SunburstChart from './charts/chart.sunburst';

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
        border: '1px solid rgb(169, 169, 169)',
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
        case 'sunburst':
          this.chart = new SunburstChart(this.$refs.wrapper, this.$props.data, this.$props.options);
          break;
        default:
          break;
      }

      this.chart.drawChart();
      this.dataSet = this.chart.dataSet;
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
      addValue(seriesIndex, value, dataIndex) {
        const seriesList = this.dataSet.seriesList;
        const baseIndex = this.dataSet.findBaseSeries(seriesList[seriesIndex].id);

        if (seriesList[seriesIndex].stack && baseIndex !== null) {
          if (this.$props.data.category) {
            this.dataSet.addCategoryStackValue(seriesIndex, value, baseIndex, dataIndex);
          } else {
            this.dataSet.addStackValue(seriesIndex, value, baseIndex);
          }
        } else {
          this.dataSet.addValue(seriesIndex, value, dataIndex);
        }
      },
    },
  };
</script>
<style>
  .evui-chart-wrapper {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /*border: 1px solid red;*/
  }

  .evui-chart-container {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /*border: 1px solid blue;*/
  }

  .evui-chart-title {
    position: absolute;
    top: 0;
    width: 100%;
    padding-left: 10px;
    word-wrap: normal;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    /*border: 1px solid black;*/
  }

  .evui-chart-legend{
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 0 0 0 10px;
    overflow: auto;
  }

  .evui-chart-legend-container {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    margin: 2px 10px 2px 0;
  }

  .evui-chart-legend-color {
    left: 0;
    width: 10px;
    height: 10px;
    margin-top: 5px;
    margin-right: 6px;
    position: absolute;
  }

  .evui-chart-legend-color.inactive {
    background-color: #bbb !important;
  }

  .evui-chart-legend-name {
    float: left;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    margin-left: 16px;
    padding-right: 21px;
    width: 100%;
    color: #000;
    user-select:none;
  }

  .evui-chart-legend-name.inactive {
    color: #bbb !important;
  }

  .evui-chart-legend-name:hover {
    font-weight: bold;
  }

  .evui-chart-legend-value {
    float: right;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .evui-chart-resize-bar {
    position: absolute;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    opacity: 0.5;
    z-index: 1;
  }

  .evui-chart-resize-bar:hover {
    background-color: #e2e2e2;
  }

  .evui-chart-resize-ghost {
    position: absolute;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    opacity: 0.5;
    background-color: #e2e2e2;
  }

  .evui-chart-resize-ghost.horizontal {
    width: 100%;
    height: 4px;
    cursor: row-resize;
  }

</style>
