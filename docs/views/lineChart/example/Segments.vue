<template>
  <resizable-wrapper>
    <ev-chart :data="chartData" :options="chartOptions" />
  </resizable-wrapper>
</template>

<script>
import dayjs from 'dayjs';

export default {
  setup() {
    const baseTime = dayjs().format('YYYY-MM-DD 00:00:00');
    const chartData = {
      series: {
        thresholdSeries: { name: 'thresholdSeries', color: 'rgba(239, 58, 58, 0.5)', segments: [1, 2] },
        dataSeries: { name: 'dataSeries' },
      },
      labels: [
        dayjs(baseTime),
        dayjs(baseTime).add(1, 'day'),
        dayjs(baseTime).add(2, 'day'),
        dayjs(baseTime).add(3, 'day'),
        dayjs(baseTime).add(4, 'day'),
        dayjs(baseTime).add(5, 'day'),
        dayjs(baseTime).add(6, 'day'),
      ],
      data: {
        thresholdSeries: [25, 47, 47, 40, 50, 100, null],
        dataSeries: [100, 25, 47, 47, null, null, null],
      },
    };

    const chartOptions = {
      type: 'line',
      width: '100%',
      height: '100%',
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      tooltip: {
        use: true,
      },
      axesX: [
        {
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        },
      ],
      annotations: [
      {
          id: 'threshold-badge',
          type: 'badge',
          content: 'Threshold',
          position: {
            type: 'series',
            seriesId: 'thresholdSeries',
            location: 'end',
            offsetX: 10,
            offsetY: -20,
          },
        },
      ]
    };

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style lang="scss"></style>
