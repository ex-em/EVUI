<template>
  <ev-chart
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
  export default {
    setup() {
      const addUnit = (value) => {
        const bytes = +value;

        if (bytes === 0) {
          return '0 Bytes';
        }

        const decimalPoint = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / k ** i).toFixed(decimalPoint))} ${sizes[i]}`;
      };

      const chartData = {
        series: {
          series1: { name: 'series#1', showValue: { use: true, fontSize: 12, textColor: '#000000', align: 'out', formatter: addUnit } },
        },
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: {
          series1: [1500.123456, 180.123456, 30.123456, 10, 0],
        },
      };

      const chartOptions = {
        type: 'bar',
        width: '100%',
        height: '100%',
        thickness: 0.8,
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        horizontal: true,
        borderRadius: 15,
        axesX: [{
          type: 'log',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: true,
          formatter: addUnit,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        indicator: {
          use: false,
        },
        tooltip: {
          use: true,
        },
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>

<style lang="scss">
</style>
