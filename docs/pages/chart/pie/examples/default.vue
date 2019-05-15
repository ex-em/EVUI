<template>
  <div>
    <ev-chart
      :data="pieData"
      :options="pieOptions"
    />
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  export default {
    data() {
      return {
        pieData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'pie' },
            series2: { name: 'series#2', show: true, type: 'pie' },
            series3: { name: 'series#3', show: true, type: 'pie' },
          },
          data: {
            series1: [10, 20, 30],
            series2: [20, 10, 50],
            series3: [15, 12, 70],
          },
        },
        pieOptions: {
          width: '100%',
          height: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          legend: {
            show: true,
            position: 'right',
          },
          type: 'pie',
        },
      };
    },
  };
</script>
