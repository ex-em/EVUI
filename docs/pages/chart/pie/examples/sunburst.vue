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

  export default {
    data() {
      return {
        pieData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'pie' },
            series2: { name: 'series#2', show: true, type: 'pie' },
            series3: { name: 'series#3', show: true, type: 'pie' },
            series4: { name: 'series#4', show: true, type: 'pie' },
            series5: { name: 'series#5', show: true, type: 'pie' },
            series6: { name: 'series#6', show: true, type: 'pie' },
            series7: { name: 'series#7', show: true, type: 'pie' },
            series8: { name: 'series#8', show: true, type: 'pie' },
            series9: { name: 'series#9', show: true, type: 'pie' },
          },
          data: [{
            id: 'series1',
            value: 15,
            children: [{
              id: 'series2',
              value: 30,
            }, {
              id: 'series5',
              value: 10,
              children: [{
                id: 'series7',
                value: 10,
              }],
            }],
          }, {
            id: 'series3',
            value: 20,
            children: [{
              id: 'series6',
              value: 5,
              children: [{
                id: 'series8',
                value: 10,
                children: [{
                  id: 'series9',
                  value: 10,
                }],
              }],
            }],
          }],
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
          sunburst: true,
          reverse: false,
          doughnutHoleSize: 0.4,
        },
      };
    },
  };
</script>
