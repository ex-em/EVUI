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
    <b>Area(fill=true)와 일반 Line을 combo로 구성한 예제 — null 섞임</b>
    <br />
    <span class="hint">
      01/03, 01/07: series#1 만 null / 01/04: 두 시리즈 모두 null.
    </span>
    <br /><br />
    <b>검증 체크리스트</b>
    <br />
    <ol class="hint">
      <li>
        series#1 만 null 인 라벨(01/03, 01/07)의 빈 영역을 클릭 →
        <b>series2</b> 가 선택되어야 합니다. (기존 버그: series1 이 고정으로 리턴)
      </li>
      <li>
        <b>두 시리즈 모두 null</b> 인 라벨(01/04)의 어느 영역을 클릭하든 →
        hover/dblclick 과 동일하게 <b>nearest valid 라벨(01/03 또는 01/05)</b>이 선택되어야 합니다.
      </li>
      <li>
        두 시리즈 모두 값이 있는 라벨에서 포인트가 아닌 중간 영역을 클릭 →
        <b>클릭 좌표에 가까운</b> 시리즈가 선택되어야 합니다.
      </li>
      <li>각 시리즈 포인트 중심을 정확히 클릭 → 해당 시리즈 (directHit).</li>
    </ol>
    <br />
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
      // - index 2, 6 (01/03, 01/07): series1 만 null → series2 선택되어야 함
      // - index 3 (01/04): 두 시리즈 모두 null → nearest valid 라벨(01/03 또는 01/05) 선택
      // - 나머지: 두 시리즈 모두 값 → 클릭 좌표에 가까운 쪽이 선택
      data: {
        series1: [20, 45, null, null, 80, 55, null, 50],
        series2: [55, 30, 40, null, 45, 25, 65, 40],
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
