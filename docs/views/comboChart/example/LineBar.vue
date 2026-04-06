<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart
        :data="chartData"
        :options="chartOptions"
        @click="onClick"
        @dbl-click="onDblClick"
      />
    </resizable-wrapper>
  </div>

  <div class="description">
    <b>막대 데이터값이 4500보다 큰 경우 빨간색으로 표시</b>
    <br />
    <span class="toggle-label">데이터 자동 업데이트</span>
    <ev-toggle v-model="isLive" />
    <br /><br />
    <b>Combo 차트 hit detection 테스트</b>
    <br />
    <span class="hint">
      작은 값의 <b>bar</b>를 클릭했을 때 bar(series#1)가 선택되는지 확인하세요.
      기존에는 같은 x 라벨 위를 지나가는 line이 더 큰 값이면 항상 line(series#2)이
      선택되는 버그가 있었습니다.
    </span>
    <br /><br />
    <div class="badge yellow">클릭 이벤트 결과 (single click)</div>
    <pre class="event-result">{{ clickedInfo }}</pre>
    <div class="badge yellow">더블클릭 이벤트 결과 (double click)</div>
    <pre class="event-result">{{ dblClickedInfo }}</pre>
  </div>
</template>

<script>
import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const chartData = reactive({
      series: {
        series1: { name: 'series#1', show: true, type: 'bar', showValue: { use: true } },
        series3: { name: 'series#2', show: true, type: 'line', combo: true },
      },
      labels: [],
      data: {
        series1: [],
        series3: [],
      },
    });

    const chartOptions = {
      width: '100%',
      height: '100%',
      thickness: 0.8,
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'mm:ss',
          interval: 'second',
          categoryMode: true,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      selectItem: {
        use: true,
        useClick: true,
        showTip: true,
      },
    };

    const isLive = ref(false);
    const liveInterval = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const clickedInfo = ref('(아직 클릭 안 됨)');
    const dblClickedInfo = ref('(아직 더블클릭 안 됨)');

    const formatEventInfo = (e) =>
      JSON.stringify(
        {
          seriesId: e?.seriesId,
          value: e?.value,
          label: e?.label,
          dataIndex: e?.dataIndex,
          eventTarget: e?.selected?.eventTarget,
        },
        null,
        2,
      );

    const onClick = (e) => {
      clickedInfo.value = formatEventInfo(e);
    };

    const onDblClick = (e) => {
      dblClickedInfo.value = formatEventInfo(e);
    };

    const addRandomChartData = () => {
      if (isLive.value) {
        chartData.labels.shift();
      }

      timeValue = dayjs(timeValue).add(1, 'second');
      chartData.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }

        const randomValue = Math.floor(Math.random() * (5000 - 5 + 1)) + 5;
        if (randomValue > 4500) {
          seriesData.push({ value: randomValue, color: '#FF0000' });
        } else {
          seriesData.push(randomValue);
        }
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < 10; ix++) {
        addRandomChartData();
      }
    });

    watch(isLive, (newValue) => {
      if (newValue) {
        addRandomChartData();
        liveInterval.value = setInterval(addRandomChartData, 1000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      chartData,
      chartOptions,
      isLive,
      clickedInfo,
      dblClickedInfo,
      onClick,
      onDblClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}

.hint {
  display: inline-block;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  max-width: 640px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;

  &.yellow {
    background-color: #fff3cd;
    color: #856404;
  }
}

.event-result {
  display: block;
  padding: 8px 12px;
  margin: 0 0 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-width: 480px;
}
</style>
