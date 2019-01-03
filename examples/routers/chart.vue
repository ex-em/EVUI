<template>
  <div style="width: 100%; height: 100%; display: table;">
    <div
      class="ev-chart-ttt"
      style="width:100%; height:100%;">
      <line-chart/>
    </div>
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
