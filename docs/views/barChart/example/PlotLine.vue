<template>
  <ev-chart
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
  export default {
    setup() {
      const chartData = {
        series: {
          series1: { name: 'series#1', color: '#FEC64F', showValue: { use: true } },
          series2: { name: 'series#2', color: '#48D1CC', showValue: { use: true } },
        },
        labels: [
          'value1',
          'value2',
          'value3',
          'value4',
          'value5',
        ],
        data: {
          series1: [100, 150, 51, 150, { value: 350, color: '#FF0000' }],
          series2: [150, 100, 151, 50, 250],
        },
      };

      const chartOptions = {
        type: 'bar',
        thickness: 0.8,
        width: '100%',
        padding: {
          right: 80,
        },
        title: {
          text: 'Chart Title',
            show: true,
        },
        legend: {
          show: true,
            position: 'right',
        },
        axesX: [{
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
          plotBands: [{
            color: 'rgba(250, 222, 76, 0.8)',
            from: 2.5,
            to: 3.5,
            label: {
              show: true,
              text: 'X Plot Band ZONE',
              fontColor: '#FFA500',
            },
          }],
        }],
          axesY: [{
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
          plotLines: [{
            value: 180,
            color: '#FFA500',
            label: {
              show: true,
              text: 'Warning',
              fontColor: '#FFA500',
            },
          }, {
            value: 300,
            label: {
              show: true,
              lineWidth: 1,
              lineColor: '#000000',
              fillColor: '#FF0000',
              fontColor: '#FFFFFF',
              text: 'Critical',
            },
          }],
            plotBands: [{
              color: 'rgba(104, 173, 244, 0.3)',
              from: 0, // 생략 가능
              to: 120,
              label: {
                show: true,
                text: 'Y Plot Band Zone',
                fontColor: '#68ADF4',
              },
            }],
        }],
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
