<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />

    <div class="description">
      <div class="section-body">

        <h2> Common </h2>

        <div class="section-item">
          <label>데이터 자동 업데이트</label>
          <ev-toggle v-model="isLive"/>
        </div>

        <div class="section-item" />

        <div class="section-item">
          <label title="legend 표시 여부">
            show
          </label>
          <ev-toggle v-model="show"/>
        </div>

        <div class="section-item">
          <label title="legend 위치">position</label>
          <ev-select
              v-model="position"
              :items="[{
              name: 'right',
              value: 'right',
            }, {
              name: 'bottom',
              value: 'bottom',
            }, {
              name: 'top',
              value: 'top',
            }, {
              name: 'left',
              value: 'left',
            }]"
          />
        </div>

        <div class="section-item">
          <label title="legend 영역 너비(position - left, right에만 해당)">
            width
          </label>
          <ev-input-number
            v-model="width"
            :step="10"
            :min="0"
            :max="500"
          />
        </div>

        <div class="section-item">
          <label title="legend 영역 높이(position - top, bottom에만 해당)">
            height
          </label>
          <ev-input-number
            v-model="height"
            :step="1"
            :min="0"
            :max="300"
          />
        </div>

        <h2> Table </h2>

        <div class="section-item">
          <label title="Table 기능 사용 여부">use</label>
          <ev-toggle v-model="useTable"/>
        </div>

        <div class="section-item" />

        <div class="section-item">
          <label title="Table - minimum 값 표시 여부">min</label>
          <ev-toggle v-model="useMin"/>
        </div>

        <div class="section-item">
          <label title="Table - maximum 값 표시 여부">max</label>
          <ev-toggle v-model="useMax"/>
        </div>

        <div class="section-item">
          <label title="Table - average 값 표시 여부">avg</label>
          <ev-toggle v-model="useAvg"/>
        </div>

        <div class="section-item">
          <label title="Table - total 값 표시 여부">total</label>
          <ev-toggle v-model="useTotal"/>
        </div>

        <div class="section-item">
          <label title="Table - current 값 표시 여부">last</label>
          <ev-toggle v-model="useLast"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1', type: 'line', combo: true, fill: true },
          series2: { name: 'series#2', type: 'bar' },
          series3: { name: 'series#3', type: 'bar' },
          series4: { name: 'series#4', type: 'line', combo: true, point: false },
          series5: { name: 'series#5', type: 'line', combo: true },
        },
        labels: [],
        groups: [['series1', 'series4', 'series5']],
        data: {
          series1: [],
          series2: [],
          series3: [],
          series4: [],
          series5: [],
        },
      });

      const show = ref(true);
      const position = ref('bottom');
      const useTable = ref(true);
      const width = ref(140);
      const height = ref(150);
      const useMin = ref(true);
      const useMax = ref(true);
      const useAvg = ref(true);
      const useTotal = ref(true);
      const useLast = ref(true);

      const chartOptions = reactive({
        width: '100%',
        thickness: 0.8,
        cPadRatio: 0.5,
        axesX: [{
          type: 'time',
          showGrid: false,
          categoryMode: true,
          timeFormat: 'mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          showGrid: false,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        tooltip: {
          showAllValueInRange: true,
        },
        legend: {
          show,
          position,
          width,
          height,
          table: {
            use: useTable,
            style: {
              header: {
                color: '#495057',
                borderBottom: '2px solid #DDDDDD',
              },
              row: {
                borderBottom: '1px solid #DDDDDD',
              },
            },
            columns: {
              name: {
                title: 'Name',
                style: {
                  minWidth: '100px',
                  maxWidth: '300px',
                  textAlign: 'left',
                },
              },
              min: {
                use: useMin,
                decimalPoint: 4,
                style: {
                  maxWidth: '100px',
                },
              },
              max: {
                use: useMax,
                decimalPoint: 4,
              },
              avg: {
                use: useAvg,
                decimalPoint: 4,
                formatter: value => `${value.toFixed(0)}`,
              },
              total: {
                use: useTotal,
                decimalPoint: 4,
                formatter: value => `${value.toFixed(0)}`,
              },
              last: {
                use: useLast,
                title: 'CURRENT',
                style: {
                  color: '#219EBC',
                },
              },
            },
          },
        },
      });

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = (ix) => {
        if (isLive.value) {
          chartData.labels.shift();
        }

        timeValue = dayjs(timeValue).add(1, 'second');
        chartData.labels.push(dayjs(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          if (isLive.value) {
            seriesData.shift();
          }

          seriesData.push(ix > 6 ? null : Math.random() * (100 - 1) + 1);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 10; ix++) {
          addRandomChartData(ix);
        }
      });

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearTimeout(liveInterval.value);
        }
      });

      onBeforeUnmount(() => {
        clearTimeout(liveInterval.value);
      });

      return {
        chartData,
        chartOptions,
        isLive,
        show,
        position,
        useTable,
        width,
        height,
        useMin,
        useMax,
        useAvg,
        useTotal,
        useLast,
      };
    },
  };
</script>

<style lang="scss" scoped>
.section {
  width: 100%;

  &-title {
    padding: 10px;
    background-color: rgba(#FADE4C, 0.6);
  }

  &-body {
    display: flex;
    padding: 0 0 10px 10px;
    flex-direction: row;
    flex-wrap: wrap;

    h2 {
      width: 100%;
      margin: 20px 0 5px 0;
    }

    .section-item {
      display: flex;
      width: 50%;
      padding: 5px;
      flex-direction: row;

      label {
        width: 140px;
        line-height: 35px;
        margin-right: 10px;
        font-weight: 700;
      }

      .ev-toggle {
        margin-top: 7px;
      }

      .ev-text-field, .ev-input-number, .ev-select {
        width: auto;
      }
    }
  }
}
</style>
