<template>
  <div
    ref="wrapper"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>
<script>
  import _ from 'lodash';
  import { getQuantity } from '@/common/utils';
  import EvChart from './chart1';

  export default {
    props: {
      options: {
        type: Object,
        default: () => {},
      },
      data: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        chart: null,
        normalizedOption: null,
        normalizedData: null,
      };
    },
    computed: {
      wrapperStyle() {
        return {
          width: this.getChartSize(getQuantity(this.options.width)),
          height: this.getChartSize(getQuantity(this.options.height)),
        };
      },
    },
    created() {
      const defaultOptions = {
        border: 2,
        title: {
          show: false,
          height: 40,
          text: '',
          style: {
            fontSize: 15,
            color: '#000',
            fontFamily: 'Droid Sans',
          },
        },
        legend: {
          show: true,
          position: 'right',
          color: '#000',
          inactive: '#aaa',
        },
        itemHighlight: true,
        seriesHighlight: true,
        useSelect: false,
        doughnutHoleSize: 0,
        reverse: false,
        bufferSize: null,
        horizontal: false,
        width: '100%',
        height: '100%',
        thickness: 1,
        useTooltip: true,
        useSelectionData: false,
        type: 'line',
      };

      const defaultData = {
        series: {},
        groups: [],
        labels: [],
        data: {},
      };

      this.normalizedOption = _.merge(defaultOptions, this.options);
      this.normalizedData = _.merge(defaultData, this.data);
    },
    mounted() {
      const wrapper = this.$refs.wrapper;
      const options = this.normalizedOption;
      const data = this.normalizedData;

      this.chart = new EvChart(wrapper, data, options);

      this.store = this.chart.store;
      setTimeout(() => {
        this.chart.init();
      }, 1);
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
      addAxisLabel(value, index = -1) {
        const labels = this.store.chartData.labels;
        if (index > -1) {
          labels[index] = value;
        } else {
          labels.push(value);
        }
      },
      updateAxisLabelSet(labelSet) {
        this.store.chartData.labels = labelSet;
      },
      updateGraphDataSet(graphSet) {
        this.store.chartData.data = graphSet;
      },
      updateSeriesSet(seriesSet) {
        this.store.chartData.series = seriesSet;
      },
      addGraphData(seriesId, value, index = -1) {
        const data = this.store.chartData.data;

        if (!data[seriesId]) {
          data[seriesId] = [];
        }

        if (index > -1) {
          data[seriesId][index] = value;
        } else {
          data[seriesId].push(value);
        }
      },
      addSeries(sId, sInfo) {
        const series = this.store.chartData.series;
        series[sId] = sInfo;
      },
      updateChart() {
        this.chart.updateChart();
      },
    },
  };
</script>
<style>
  .ev-chart-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: block;
  }

  .ev-chart-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
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
