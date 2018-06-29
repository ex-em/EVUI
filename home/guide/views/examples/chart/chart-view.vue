<template>
  <div>
    <line-chart/>
    <bar-chart/>
    <pie-chart/>
  </div>
</template>
<script>
  import LineChart from '@/components/chart/charts/chart.line';
  import BarChart from '@/components/chart/charts/chart.bar';
  import PieChart from '@/components/chart/charts/chart.pie';

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
