<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            값 기준 내림차순 정렬 여부
          </span>
          <ev-toggle v-model="sortByValue"/>
        </div>
      </div>

      <div class="row">
        <div class="row-item">
          <span class="item-title">
            스크롤 생성여부
          </span>
          <ev-toggle v-model="isScrollable"/>
        </div>

        <div class="row-item">
          <span class="item-title">
            스크롤 생성 기준 개수
          </span>
          <ev-input-number
            v-model="maxSeriesCount"
            :step="1"
            :min="1"
            :max="Object.keys(chartData.series).length"
          />
        </div>
      </div>

      <div class="row">
        <div class="row-item">
          <span class="item-title">
            그림자 생성여부
          </span>
          <ev-toggle v-model="useShadow"/>
        </div>

        <div class="row-item">
          <span class="item-title">
            그림자 투명도
          </span>
          <ev-input-number
            v-model="shadowOpacity"
            :step="0.05"
            :min="0"
            :max="1"
          />
        </div>
      </div>

      <div class="row">
        <div class="row-item">
          <span class="item-title">
            글자 색상
          </span>
          <ev-text-field v-model="fontColor"/>
        </div>

        <div class="row-item">
          <span class="item-title">
            배경 색상
          </span>
          <ev-text-field v-model="backgroundColor"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, reactive } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const sortByValue = ref(true);
      const isScrollable = ref(true);
      const maxSeriesCount = ref(10);
      const useShadow = ref(false);
      const shadowOpacity = ref(0.25);
      const fontColor = ref('#000000');
      const backgroundColor = ref('rgb(210, 234, 227, 0.7)');

      const chartData = reactive({
        series: {
          series1: { name: 'series#1', point: false },
          series2: { name: 'series#2', point: false },
          series3: { name: 'series#3', point: false },
          series4: { name: 'series#4', point: false },
          series5: { name: 'series#5', point: false },
          series6: { name: 'series#6', point: false },
          series7: { name: 'series#7', point: false },
          series8: { name: 'series#8', point: false },
          series9: { name: 'series#9', point: false },
          series10: { name: 'series#10', point: false },
          series11: { name: 'series#11', point: false },
          series12: { name: 'series#12', point: false },
          series13: { name: 'series#13', point: false },
          series14: { name: 'series#14', point: false },
          series15: { name: 'series#15', point: false },
          series16: { name: 'series#16', point: false },
          series17: { name: 'series#17', point: false },
          series18: { name: 'series#18', point: false },
          series19: { name: 'series#19', point: false },
          series20: { name: 'series#20', point: false },
        },
        labels: [],
        data: {
          series1: [],
          series2: [],
          series3: [],
          series4: [],
          series5: [],
          series6: [],
          series7: [],
          series8: [],
          series9: [],
          series10: [],
          series11: [],
          series12: [],
          series13: [],
          series14: [],
          series15: [],
          series16: [],
          series17: [],
          series18: [],
          series19: [],
          series20: [],
        },
      });

      const chartOptions = reactive({
        type: 'line',
        width: '100%',
        height: '80%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        tooltip: {
          use: true,
          sortByValue,
          backgroundColor,
          fontColor,
          shadowOpacity,
          useShadow,
          scrollbar: {
            use: isScrollable,
            maxSeriesCount,
          },
        },
      });


      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        timeValue = dayjs(timeValue).add(1, 'second');
        chartData.labels.push(dayjs(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 60; ix++) {
          addRandomChartData();
        }
      });

      return {
        chartData,
        chartOptions,
        sortByValue,
        isScrollable,
        maxSeriesCount,
        useShadow,
        shadowOpacity,
        fontColor,
        backgroundColor,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .description-label {
    vertical-align: top;
    margin-right: 3px;
  }

  .row {
    display: flex;
    margin-top: 15px;
    justify-content: space-between;
    .row-item {
      display: flex;
      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 50px;
      }
      .ev-text-field, .ev-input-number {
        width: auto;
      }
    }
  }
</style>
