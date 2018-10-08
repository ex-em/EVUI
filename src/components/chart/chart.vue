<template>
  <div
    ref="wrapper"
    :style="wrapperSize"
    class="ev-chart"
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
      this.dataStore = this.chart.store;
    },
    destroyed() {
      if (this.chart.tooltipDOM) {
        this.chart.tooltipDOM.remove();
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
      addValue(seriesIndex, value, dataIndex) {
        const seriesList = this.dataStore.seriesList;
        const baseIndex = this.dataStore.findBaseSeries(seriesList[seriesIndex].id);
        const isStack = this.$props.options.stack;

        if (isStack && baseIndex !== null) {
          if (this.$props.data.category) {
            this.dataStore.addCategoryStackValue(seriesIndex, value, baseIndex, dataIndex);
          } else {
            this.dataStore.addStackValue(seriesIndex, value, baseIndex);
          }
        } else {
          this.dataStore.addValue(seriesIndex, value, dataIndex);
        }
      },
    },
  };
</script>
<style>
  .ev-chart-wrapper {
    position: relative;
    top: 0;
    left: 0;
  }

  .ev-chart-container {
    position: relative;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .ev-chart-title {
    position: absolute;
    top: 0;
    width: 100%;
    padding-left: 10px;
    word-wrap: normal;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: none;
  }

  .ev-chart-legend{
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 0 0 0 10px;
    overflow: auto;
  }

  .ev-chart-legend-container {
    position: relative;
    overflow: hidden;
    margin: 2px 10px 2px 0;
  }

  .ev-chart-legend-color {
    left: 0;
    width: 10px;
    height: 10px;
    margin-top: 6px;
    margin-right: 6px;
    position: absolute;
    border-radius: 5px;
  }

  .ev-chart-legend-color.inactive {
    /*background-color: #555 !important;*/
  }

  .ev-chart-legend-name {
    float: left;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    margin-left: 16px;
    padding-right: 21px;
    width: 100%;
    /*color: #ABAEB5;*/
    user-select:none;
  }

  .ev-chart-legend-name.inactive {
    /*color: #555 !important;*/
  }

  .ev-chart-legend-value {
    float: right;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .ev-chart-resize-bar {
    position: absolute;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    opacity: 0.5;
    z-index: 1;
  }

  .ev-chart-resize-bar:hover {
    background-color: #e2e2e2;
  }

  .ev-chart-resize-ghost {
    position: absolute;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    opacity: 0.5;
    background-color: #e2e2e2;
  }

  .ev-chart-resize-ghost.horizontal {
    width: 100%;
    height: 4px;
    cursor: row-resize;
  }

  .ev-chart-tooltip {
    position: absolute;
    z-index: 100000;
    color: #000;
    border-radius: 4px;
    border: 1px solid #D8D8D8;
    background: #fff;
    overflow-y: auto;
    max-height: 500px;
    padding: 10px;
  }

  .ev-chart-tooltip-title {
    font-size: 14px;
    text-align: center;
    margin: 0 5px 3px 5px;
    padding-bottom: 2px;
    border-bottom: 1px solid #D2D2D2;
    user-select: none;
  }

  .ev-chart-tooltip-ul {
    list-style: none;
    display: block;
    user-select: none;
  }

  .ev-chart-tooltip-li {
    border: none;
    padding: 0;
    margin: 0;
  }

  .ev-chart-tooltip-color {
    width: 10px;
    height: 10px;
    position: absolute;
    margin: 8px 0 0 5px;
    border-radius: 5px;
  }

  .ev-chart-tooltip-name {
    /*float: left;*/
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    margin-left: 20px;
    width: 100%;
    user-select: none;
    color: #000;
  }

  .ev-chart-tooltip-colon {
    width: 100%;
  }

  .ev-chart-tooltip-value {
    font-size: 12px;
    margin-right: 5px;
  }

</style>
