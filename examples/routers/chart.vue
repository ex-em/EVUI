<template>
  <div style="width: 100%; height: 100%;">
    <div
      class="ev-chart-ttt"
      style="width: 100%; height: 100%;"
    >
      <pie-chart />
    </div>
  </div>
</template>
<script>
  import PieChart from './charts/chart.pie';

  export default {
    components: {
      PieChart,
    },
    data() {
      return {
      };
    },
  };
</script>
