<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
    </resizable-wrapper>

    <div class="description">
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            Interval Value
          </span>
          <ev-input-number
            v-model="intervalValue"
            class="component"
            :min="0"
          />
          <span class="item-title">
            Interval Unit
          </span>
          <ev-select
            v-model="intervalUnit"
            class="component"
            :items="[{
              name: 'second',
              value: 'second',
            }, {
              name: 'minute',
              value: 'minute',
            }, {
              name: 'hour',
              value: 'hour',
            }, {
              name: 'day',
              value: 'day',
            }, {
              name: 'week',
              value: 'week',
            }]"
          />
        </div>
      </div>
      <div class="row">
        <div class="sub-description">
          range 옵션과 interval 옵션이 호환되지 않는다면, interval 옵션은 무시됩니다.
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            Range
          </span>
          <ev-date-picker
            v-model="rangeDateTimes"
            mode="dateTimeRange"
            :options="{
              timeFormat: ['HH:mm:ss', 'HH:mm:ss'],
            }"
        />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const now = dayjs();
    const threeHoursAgo = now.subtract(3, 'hour');
    const sixHoursAgo = now.subtract(6, 'hour');
    const twelveHoursAgo = now.subtract(12, 'hour');
    const twentyFourHoursAgo = now.subtract(24, 'hour');
    const threeDaysAgo = now.subtract(3, 'day');

    // 최근 3시간 이내의 10초 간격 데이터 생성
    const generateTimeSeriesData = (start, end) => {
      const dataPoints = [];

      let currentTime = end;
      while (currentTime.isBefore(start) || currentTime.isSame(start)) {
        const y = Math.floor(Math.random() * 100) + 1;
        dataPoints.push({
          x: currentTime.valueOf(),
          y,
        });
        currentTime = currentTime.add(1, 'minute');
      }

      return dataPoints;
    };

    const chartData = reactive({
      series: {
        series1: { name: '현재~3시간전' },
        series2: { name: '3시간전~6시간전' },
        series3: { name: '6시간~12시간전' },
        series4: { name: '12시간~24시간전' },
        series5: { name: '24시간~3일전' },
      },
      data: {
        series1: generateTimeSeriesData(now, threeHoursAgo),
        series2: generateTimeSeriesData(threeHoursAgo, sixHoursAgo),
        series3: generateTimeSeriesData(sixHoursAgo, twelveHoursAgo),
        series4: generateTimeSeriesData(twelveHoursAgo, twentyFourHoursAgo),
        series5: generateTimeSeriesData(twentyFourHoursAgo, threeDaysAgo),
      },
    });

    console.log('chartData', chartData);

    const rangeDateTimes = ref([threeHoursAgo.format('YYYY-MM-DD HH:mm:ss'), now.format('YYYY-MM-DD HH:mm:ss')]);
    const intervalValue = ref(10);
    const intervalUnit = ref('second');

    const chartOptions = computed(() => ({
      type: 'scatter',
      width: '100%',
      height: '100%',
      axesX: [{
        type: 'time',
        timeFormat: 'DD HH:mm:ss',
        interval: {
          time: intervalValue.value,
          unit: intervalUnit.value,
        },
        range: [
          dayjs(rangeDateTimes.value[0]).valueOf(),
          dayjs(rangeDateTimes.value[1]).valueOf(),
        ],
      }],
      axesY: [{
        type: 'linear',
        showAxis: true,
        startToZero: true,
        autoScaleRatio: null,
        showGrid: true,
        axisLineColor: '#C9CFDC',
        gridLineColor: '#C9CFDC',
        labelStyle: {
          show: true,
          fontSize: 12,
          color: '#25262E',
          fontFamily: 'Roboto',
          fitWidth: false,
          fitDir: 'right',
        },
        plotLines: [],
        plotBands: [],
        formatter: null,
      }],
      title: {
        text: '',
        show: false,
      },
      legend: {
        show: true,
        position: 'bottom',
      },
      tooltip: {
        use: false,
      },
      selectItem: {
        use: false,
      },
      dragSelection: {
        use: false,
        keepDisplay: true,
        fillColor: '#38ACEC',
        opacity: 0.65,
      },
    }));

    return {
      chartData,
      intervalValue,
      intervalUnit,
      chartOptions,
      rangeDateTimes,
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
    flex-direction: column;
    margin-top: 15px;
    justify-content: space-between;
    gap: 30px;
    .row-item {
      flex: 1;
      display: flex;
      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 80px;
        text-align: right;
      }
    }
    .sub-description {
      font-size: 12px;
      color: #666;
      text-align: right;
    }
  }
</style>
