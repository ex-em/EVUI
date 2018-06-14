<template>
  <div>
    <line-chart/>
    <bar-chart/>
    <pie-chart/>
  </div>
</template>
<script>
  import LineChart from './charts/chart.line';
  import BarChart from './charts/chart.bar';
  import PieChart from './charts/chart.pie';

  export default {
    components: {
      LineChart,
      BarChart,
      PieChart,
    },
    data() {
      return {
      };
    },
  };
</script>
<style>
</style>
