<template>
  <div style="width: 100%; height: 100%; display: inline-flex;">
    <chart
      :data="pieData"
      :options="pieOptions"
    />
    <chart
      :data="pieData"
      :options="doughnutOptions"
    />
    <chart
      :data="sunburstData"
      :options="sunburstOptions"
    />
  </div>
</template>
<script>
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        pieData: {
          series: [
            {
              id: 'series0',
              name: 'series-0',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 10, 6],
            },
            {
              id: 'series1',
              name: 'series-1',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [10, 12, 8],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [15, 10, 20],
            },
            {
              id: 'series3',
              name: 'series-3',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 15, 10],
            },
          ],
        },
        sunburstData: {
          series: [
            {
              id: 'series_0',
              name: 'series_0',
              show: true,
              data: 15,
              children: [
                {
                  id: 'series_0_0',
                  name: 'series_0_0',
                  show: true,
                  data: 10,
                },
                {
                  id: 'series_0_1',
                  name: 'series_0_1',
                  show: true,
                  data: 12,
                },
              ],
            },
            {
              id: 'series_1',
              name: 'series_1',
              show: true,
              data: 10,
              children: [
                {
                  id: 'series_1_0',
                  name: 'series_1_0',
                  show: true,
                  data: 17,
                },
                {
                  id: 'series_1_1',
                  name: 'series_1_1',
                  show: true,
                  data: 13,
                  children: [
                    {
                      id: 'series_1_1_0',
                      name: 'series_1_1_0',
                      show: true,
                      data: 17,
                    },
                    {
                      id: 'series_1_1_1',
                      name: 'series_1_1_1',
                      show: true,
                      data: 10,
                    },
                  ],
                },
                {
                  id: 'series_1_2',
                  name: 'series_1_3',
                  show: true,
                  data: 30,
                  children: [
                    {
                      id: 'series_1_2_0',
                      name: 'series_1_2_0',
                      show: true,
                      data: 17,
                      children: [
                        {
                          id: 'series_1_2_0',
                          name: 'series_1_2_0',
                          show: true,
                          data: 10,
                        },
                        {
                          id: 'series_1_2_0',
                          name: 'series_1_2_0',
                          show: true,
                          data: 10,
                        },
                        {
                          id: 'series_1_2_0',
                          name: 'series_1_2_0',
                          show: true,
                          data: 15,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'series_2',
              name: 'series_2',
              show: true,
              data: 12,
            },
          ],
        },
        pieOptions: {
          type: 'pie',
          width: '400px',
          height: '350px',
        },
        doughnutOptions: {
          type: 'pie',
          doughnutHoleSize: 0.4,
          width: '400px',
          height: '350px',
        },
        sunburstOptions: {
          type: 'sunburst',
          width: '400px',
          height: '350px',
          doughnutHoleSize: 0.4,
        },
      };
    },
  };
</script>
<style>
</style>
