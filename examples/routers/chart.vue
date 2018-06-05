<template>
  <div style="width: 100%; height: 100%;">
    <div style="width: 400px; height: 400px; position: absolute;">
      <chart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
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
        chartData: {
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
        chartOptions: {
          type: 'sunburst',
          width: '100%',
          height: '100%',
          border: 2,
          doughnutHoleSize: 0.4,
          title: {
            text: 'EVUI CHART 2.0',
            style: '20px Droid Sans',
            color: '#000000',
            height: 50,
            show: true,
          },
        },
      };
    },
  };
</script>
<style>
</style>
