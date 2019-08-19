<template>
  <div
    ref="wrapper"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>
<script>
  import _ from 'lodash-es/merge';
  import { getQuantity } from '@/common/utils';
  import EvChart from './chart.core';

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
    watch: {
      data: {
        handler(newVal) {
          this.evChart.data = _.merge(this.normalizedData, newVal);
          this.evChart.update();
        },
        deep: true,
      },
      options: {
        handler(newVal) {
          this.evChart.options = _.merge(this.normalizedOption, newVal);
          this.evChart.update();
        },
        deep: true,
      },
    },
    created() {
      this.normalizedOption = _.merge(this.getDefaultOptions(), this.options);
      this.normalizedData = _.merge(this.getDefaultData(), this.data);
    },
    mounted() {
      const wrapper = this.$refs.wrapper;
      const options = this.normalizedOption;
      const data = this.normalizedData;

      this.evChart = new EvChart(wrapper, data, options);

      this.store = this.evChart.store;
      const timer = setTimeout(() => {
        this.evChart.init();
        clearTimeout(timer);
      }, 1);
    },
    beforeDestroy() {
      if (this.evChart.tooltipDOM) {
        this.evChart.tooltipDOM.remove();
      }
      delete this.evChart;
    },
    methods: {
      getDefaultOptions() {
        return {
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
            width: 140,
            height: 24,
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
      },
      getDefaultData() {
        return {
          series: {},
          groups: [],
          labels: [],
          data: {},
        };
      },
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
    left: 0;
    width: 100%;
    padding-left: 10px;
    word-wrap: normal;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: none;
  }

  .ev-chart-legend {
    position: absolute;
    overflow: hidden;
  }

  .ev-chart-legend-box {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .ev-chart-legend-container {
    position: relative;
    overflow: hidden;
  }

  .ev-chart-legend-color {
    top: 50%;
    left: 0;
    transform: translate(0, -50%);
    width: 8px;
    height: 8px;
    position: absolute;
    border-radius: 50%;
  }

  .ev-chart-legend-color.inactive {
    /*background-color: #555 !important;*/
  }

  .ev-chart-legend-name {
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    margin-left: 16px;
    padding-right: 16px;
    user-select:none;
    top: 50%;
    left: 0;
    width: 100%;
    transform: translate(0, -50%);
    position: absolute;
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
    background: transparent;
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
