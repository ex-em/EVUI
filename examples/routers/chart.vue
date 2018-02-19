<template>
  <div>
    <Chart
      :width="500"
      :height="800"
    />
  </div>
</template>
<script>
  import Chart from '@/components/chart';

  export default {
    components: {
      Chart,
    },
    data() {
      return {
        width: 500,
        height: 800,
      };
    },
  };
</script>
<style>
</style>

