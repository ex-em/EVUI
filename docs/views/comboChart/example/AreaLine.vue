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
    <b>Area(fill=true)와 일반 Line을 combo로 구성한 예제</b>
    <br />
    <span class="hint">
      exemONE 대시보드에서 사용하는 area + line combo 패턴을 재현합니다.
      area 시리즈(series#1)와 line 시리즈(series#2)의 포인트를 각각 클릭했을 때
      의도한 시리즈가 선택되는지 확인하세요.
    </span>
    <br /><br />
    <b>Combo 차트 hit detection 테스트</b>
    <br />
    <span class="hint">
      두 시리즈가 겹치는 구간에서도 실제로 클릭한 포인트에 가장 가까운 시리즈가
      선택되어야 합니다. 포인트 중심에서 조금 떨어진 곳을 클릭하면 라벨 기준
      가장 가까운 hit 시리즈가 선택됩니다.
    </span>
    <br /><br />
    <div class="badge yellow">클릭 이벤트 결과 (single click)</div>
    <pre class="event-result">{{ clickedInfo }}</pre>
    <div class="badge yellow">더블클릭 이벤트 결과 (double click)</div>
    <pre class="event-result">{{ dblClickedInfo }}</pre>
  </div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const baseTime = dayjs('2026-01-01 00:00:00');
    const labels = Array.from({ length: 8 }, (_, i) => baseTime.add(i, 'day'));

    const chartData = {
      series: {
        series1: {
          name: 'series#1 (area)',
          show: true,
          type: 'line',
          fill: { gradient: true },
          fillColor: '#6AA9F2',
          color: '#6AA9F2',
        },
        series2: {
          name: 'series#2 (line)',
          show: true,
          type: 'line',
          color: '#FF6B6B',
        },
      },
      labels,
      // 두 시리즈가 여러 지점에서 교차하도록 구성
      data: {
        series1: [20, 45, 60, 35, 80, 55, 30, 50],
        series2: [55, 30, 40, 70, 45, 25, 65, 40],
      },
    };

    const chartOptions = {
      type: 'line',
      width: '100%',
      height: '100%',
      title: {
        text: 'Area + Line Combo',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
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

    return {
      chartData,
      chartOptions,
      clickedInfo,
      dblClickedInfo,
      onClick,
      onDblClick,
    };
  },
};
</script>

<style lang="scss" scoped>
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
