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
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
        },
        data: {
          series1: [10],
          series2: [20],
          series3: [70],
        },
      };

      const chartOptions = {
        type: 'pie',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
          width: 200,
          table: {
            use: true,
            columns: {
              name: {
                use: true,
                title: 'Series name',
                style: {
                  width: '140px',
                },
              },
              last: {
                use: true,
                title: 'Value',
                unit: '%',
                decimalPoint: 0,
                style: {
                  color: '#219EBC',
                },
              },
            },
          },
        },
        tooltip: {
          formatter: ({ value }) => `${value}%`,
        },
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
