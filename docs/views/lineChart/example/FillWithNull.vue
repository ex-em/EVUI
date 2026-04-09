<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
      @click="onClick"
      @dbl-click="onDblClick"
    />
    <div class="description">
      <b>null 값이 섞인 Area(Fill) 2개 시리즈 — fallback 선택 버그 재현 예제</b>
      <br>
      <span class="hint">
        두 area 시리즈 모두 fill 옵션을 사용합니다.
        01/03, 01/07: series#1 만 null / 01/04: 두 시리즈 모두 null.
      </span>
      <br><br>
      <b>검증 체크리스트</b>
      <br>
      <ol class="hint">
        <li>
          series#1 만 null 인 라벨(01/03, 01/07)의 빈 영역을 클릭 →
          <b>series2</b> 가 선택되어야 합니다. (기존 버그: series1 이 고정으로 리턴)
        </li>
        <li>
          <b>두 시리즈 모두 null</b> 인 라벨(01/04)을 클릭/더블클릭 →
          <code>seriesId=""</code>, <code>value=0</code> 또는 <code>undefined</code>,
          <code>label/dataIndex</code> 는 <b>01/04</b> 가 그대로 반환되어야 합니다.
          (hover 는 여전히 nearest valid 라벨로 snap 되어 tooltip 이 표시됩니다.)
        </li>
        <li>
          series#2 포인트 중심을 정확히 클릭 → <b>series2</b> (directHit).
        </li>
        <li>
          두 시리즈 모두 값이 있는 라벨에서 포인트가 아닌 중간 영역을 클릭 →
          <b>클릭 좌표에 가까운</b> 시리즈가 선택되어야 합니다.
        </li>
      </ol>
      <br>
      <div class="badge yellow">클릭 이벤트 결과 (single click)</div>
      <pre class="event-result">{{ clickedInfo }}</pre>
      <div class="badge yellow">더블클릭 이벤트 결과 (double click)</div>
      <pre class="event-result">{{ dblClickedInfo }}</pre>
    </div>
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
            name: 'series#1 (area, null 포함)',
            show: true,
            fill: { gradient: true },
            fillColor: '#6AA9F2',
            color: '#6AA9F2',
          },
          series2: {
            name: 'series#2 (area)',
            show: true,
            fill: { gradient: true },
            fillColor: '#FF6B6B',
            color: '#FF6B6B',
          },
        },
        labels,
        // - index 2, 6: series1 만 null → series2 선택되어야 함
        // - index 3: 두 시리즈 모두 null → seriesId='', label/dataIndex 그대로 반환
        // - 나머지: 두 시리즈 모두 값 → 클릭 좌표에 가까운 쪽이 선택
        data: {
          series1: [20, 45, null, null, 80, 55, null, 50],
          series2: [55, 30, 40, null, 45, 25, 65, 40],
        },
      };

      const chartOptions = {
        type: 'line',
        width: '100%',
        height: '320px',
        title: {
          text: 'Area Fill x 2 (series#1 에 null 포함)',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        axesX: [{
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        selectItem: {
          use: true,
          useClick: true,
          showTip: true,
        },
      };

      const clickedInfo = ref('(아직 클릭 안 됨)');
      const dblClickedInfo = ref('(아직 더블클릭 안 됨)');

      const formatEventInfo = e => JSON.stringify(
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
  .case {
    height: 100%;
  }
  .hint {
    display: inline-block;
    color: #666666;
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
      background-color: #FFF3CD;
      color: #856404;
    }
  }
  .event-result {
    display: block;
    padding: 8px 12px;
    margin: 0 0 12px;
    background-color: #F5F5F5;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    max-width: 480px;
  }
</style>
