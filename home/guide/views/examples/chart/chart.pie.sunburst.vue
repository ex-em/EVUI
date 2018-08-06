<template>
  <div>
    <chart
      :data="sunburstChartData"
      :options="sunburstChartOptions"
    />
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        sunburstChartData: {
          series: [
            {
              id: 'series1',
              name: 'series#1',
              show: true,
              data: 15,
              children: [
                {
                  id: 'series1_1',
                  name: 'series#1_1',
                  show: true,
                  data: 10,
                },
                {
                  id: 'series1_2',
                  name: 'series#1_2',
                  show: true,
                  data: 12,
                  children: [
                    {
                      id: 'series1_2_1',
                      name: 'series#1_2_1',
                      show: true,
                      data: 10,
                    },
                    {
                      id: 'series1_2_2',
                      name: 'series#1_2_2',
                      show: true,
                      data: 7,
                    },
                    {
                      id: 'series1_2_3',
                      name: 'series#1_2_3',
                      show: true,
                      data: 3,
                    },
                  ],
                },
              ],
            },
            {
              id: 'series2',
              name: 'series#2',
              show: true,
              data: 12,
            },
          ],
        },
        sunburstChartOptions: {
          type: 'sunburst',
          width: '600px',
          height: '350px',
          doughnutHoleSize: 0.4,
        },
      };
    },
  };
</script>
