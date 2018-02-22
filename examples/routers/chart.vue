<template>
  <div style="width: 800px; height: 600px;">
    <Chart
      :width="width"
      :height="height"
      :chart-type="'line'"
      :chart-data="data"
      :margin="margin"
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
        width: '100%',
        height: '100%',
        data: [
          { x: '1790', y: 3.9 },
          { x: '1810', y: 7.2 },
          { x: '1850', y: 23.1 },
          { x: '1830', y: 12.8 },
          { x: '1870', y: 36.5 },
          { x: '1890', y: 62.9 },
          { x: '1910', y: 92.2 },
          { x: '1930', y: 123.2 },
          { x: '1950', y: 151.3 },
          { x: '1970', y: 203.2 },
          { x: '1990', y: 248.7 },
          { x: '2010', y: 308.7 },
        ],
        margin: { top: 40, left: 75, right: 0, bottom: 75 },
      };
    },
  };
</script>
<style>
</style>

