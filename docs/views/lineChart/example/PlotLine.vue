<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>

  <div class="plot-controls">
    <div class="group-title">추가된 Plot 목록 ({{ plots.length }})</div>
    <ul class="plot-list">
      <li v-for="p in plots" :key="p.id" class="plot-item">
        <span class="swatch" :style="{ background: swatchColor(p) }" />
        <span class="summary">{{ summary(p) }}</span>
        <ev-button shape="radius" @click="removePlot(p.id)"> 삭제 </ev-button>
      </li>
      <li v-if="!plots.length" class="empty">아직 추가된 plot이 없습니다.</li>
    </ul>

    <div class="group-title builder-title">새 Plot 만들기</div>
    <div class="grid">
      <div class="field">
        <span class="label">축(axis)</span>
        <ev-select v-model="draft.axis" :items="axisList" />
      </div>
      <div class="field">
        <span class="label">종류(type)</span>
        <ev-select v-model="draft.kind" :items="kindList" />
      </div>

      <!-- Line -->
      <template v-if="draft.kind === 'line'">
        <div v-if="draft.axis === 'y'" class="field">
          <span class="label">value</span>
          <ev-input-number v-model="draft.value" :step="5" :min="-100" :max="150" />
        </div>
        <div v-else class="field">
          <span class="label">위치(라벨 index)</span>
          <ev-input-number v-model="draft.lineIdx" :step="1" :min="0" :max="6" />
        </div>
        <div class="field">
          <span class="label">색상</span>
          <color-field v-model="draft.color" />
        </div>
        <div class="field">
          <span class="label">선 굵기</span>
          <ev-input-number v-model="draft.lineWidth" :step="1" :min="0" :max="10" />
        </div>
        <div class="field">
          <span class="label">선 스타일</span>
          <ev-select v-model="draft.dash" :items="dashList" />
        </div>
      </template>

      <!-- Band -->
      <template v-else>
        <template v-if="draft.axis === 'y'">
          <div class="field">
            <span class="label">from</span>
            <ev-input-number v-model="draft.from" :step="5" :min="-100" :max="150" />
          </div>
          <div class="field">
            <span class="label">to</span>
            <ev-input-number v-model="draft.to" :step="5" :min="-100" :max="150" />
          </div>
        </template>
        <template v-else>
          <div class="field">
            <span class="label">from(index)</span>
            <ev-input-number v-model="draft.fromIdx" :step="1" :min="0" :max="6" />
          </div>
          <div class="field">
            <span class="label">to(index)</span>
            <ev-input-number v-model="draft.toIdx" :step="1" :min="0" :max="6" />
          </div>
        </template>
        <div class="field">
          <span class="label">색상(+투명도)</span>
          <color-field v-model="draft.bandColor" with-alpha />
        </div>
        <div class="field">
          <span class="label">border 사용</span>
          <ev-toggle v-model="draft.borderUse" />
        </div>
        <div class="field">
          <span class="label">border 색상</span>
          <color-field v-model="draft.borderColor" />
        </div>
        <div class="field">
          <span class="label">border 굵기</span>
          <ev-input-number v-model="draft.borderWidth" :step="1" :min="0" :max="10" />
        </div>
        <div class="field">
          <span class="label">border 스타일</span>
          <ev-select v-model="draft.borderDash" :items="dashList" />
        </div>
      </template>
    </div>

    <div class="group-subtitle">Label</div>
    <plot-label-controls :label="draft.label" :axis="draft.axis" />

    <div class="actions">
      <ev-button type="primary" shape="radius" @click="addPlot"> + 추가 </ev-button>
    </div>

  </div>
</template>

<script>
import { reactive, computed } from 'vue';
import dayjs from 'dayjs';
import PlotLabelControls from './controlsUI/PlotLabelControls.vue';
import ColorField from './controlsUI/ColorField.vue';

export default {
  components: { PlotLabelControls, ColorField },
  setup() {
    const axisList = [
      { name: 'Y축', value: 'y' },
      { name: 'X축', value: 'x' },
    ];
    const kindList = [
      { name: 'PlotLine', value: 'line' },
      { name: 'PlotBand', value: 'band' },
    ];
    const dashList = [
      { name: 'solid', value: 'solid' },
      { name: 'dashed', value: 'dashed' },
      { name: 'dotted', value: 'dotted' },
    ];
    const dashToSegments = (s) => {
      if (s === 'dashed') {
        return [4, 4];
      }
      if (s === 'dotted') {
        return [2, 2];
      }
      return null;
    };

    // 라벨 옵션 전체 기본값(누락 방지). over 로 덮어쓰기
    const makeLabel = (over = {}) => ({
      show: true,
      text: '',
      showValue: false,
      position: 'innerStart',
      verticalAlign: 'top',
      textAlign: 'center',
      fontColor: '#FFFFFF',
      fontSize: 12,
      fontWeight: 400,
      fontFamily: 'Roboto',
      fillColor: 'rgba(0, 0, 0, 0.75)',
      lineColor: '#000000',
      lineWidth: 0,
      borderRadius: 2,
      paddingTop: 4,
      paddingRight: 4,
      paddingBottom: 4,
      paddingLeft: 4,
      textOverflow: 'none',
      maxWidth: 0,
      // 컨트롤러에선 빼고 기본값으로 동작시킴(반응형 3단계: 풀→value만→숨김)
      valueOnlyBelow: 500,
      hideBelow: 250,
      pointerShow: false,
      pointerColor: '',
      hoverUse: true,
      hoverBg: '#4C4C4C',
      hoverFontColor: '#FFFFFF',
      hoverBorderColor: '', // 빈값이면 배경색과 동일 → 테두리 미표시

      hoverBorderRadius: 4,
      hoverFontSize: 12,
      hoverUseShadow: true,
      hoverShadowOpacity: 0.25,
      ...over,
    });

    // 현재 작성 중인 plot(폼). [추가] 시 스냅샷이 plots 로 들어간다.
    const draft = reactive({
      axis: 'y',
      kind: 'line',
      value: 80,
      lineIdx: 2,
      from: 0,
      to: 120,
      fromIdx: 4,
      toIdx: 6,
      color: '#E53935',
      lineWidth: 1,
      dash: 'dashed',
      bandColor: 'rgba(250, 222, 76, 0.4)',
      borderUse: true,
      borderColor: '#FFA500',
      borderWidth: 1,
      borderDash: 'dotted',
      label: makeLabel({ text: '경고', showValue: true, pointerShow: true }),
    });

    // ui 라벨 상태 → 차트 label 옵션
    const buildLabel = (l) => ({
      show: l.show,
      text: l.text,
      showValue: l.showValue,
      position: l.position,
      verticalAlign: l.verticalAlign,
      textAlign: l.textAlign,
      fontColor: l.fontColor,
      fontSize: l.fontSize,
      fontWeight: l.fontWeight,
      fontFamily: l.fontFamily,
      fillColor: l.fillColor,
      lineColor: l.lineColor,
      lineWidth: l.lineWidth,
      borderRadius: l.borderRadius,
      padding: {
        top: l.paddingTop,
        right: l.paddingRight,
        bottom: l.paddingBottom,
        left: l.paddingLeft,
      },
      textOverflow: l.textOverflow,
      maxWidth: l.maxWidth || null,
      responsive: {
        valueOnlyBelow: l.valueOnlyBelow || null,
        hideBelow: l.hideBelow || null,
      },
      pointer: { show: l.pointerShow, color: l.pointerColor || null },
      showTextOnHover: {
        use: l.hoverUse,
        backgroundColor: l.hoverBg,
        fontColor: l.hoverFontColor,
        borderColor: l.hoverBorderColor || null,
        borderRadius: l.hoverBorderRadius,
        fontSize: l.hoverFontSize,
        useShadow: l.hoverUseShadow,
        shadowOpacity: l.hoverShadowOpacity,
      },
    });

    const time = dayjs().format('YYYY-MM-DD 00:00:00');
    const chartData = {
      series: {
        series1: { name: 'series#1', fill: true },
        series2: { name: 'series#2' },
      },
      labels: [
        dayjs(time),
        dayjs(time).add(1, 'day'),
        dayjs(time).add(2, 'day'),
        dayjs(time).add(3, 'day'),
        dayjs(time).add(4, 'day'),
        dayjs(time).add(5, 'day'),
        dayjs(time).add(6, 'day'),
      ],
      data: {
        series1: [-50, 25, 36, 47, 0, 50, 90],
        series2: [80, 36, 25, 47, 15, 90, 0],
      },
    };
    const labelTs = (idx) => chartData.labels[idx]?.valueOf();

    // 추가된 plot 목록
    let nextId = 1;
    const plots = reactive([]);
    const addPlot = () => {
      plots.push({
        id: nextId,
        axis: draft.axis,
        kind: draft.kind,
        value: draft.value,
        lineIdx: draft.lineIdx,
        from: draft.from,
        to: draft.to,
        fromIdx: draft.fromIdx,
        toIdx: draft.toIdx,
        color: draft.color,
        lineWidth: draft.lineWidth,
        dash: draft.dash,
        bandColor: draft.bandColor,
        borderUse: draft.borderUse,
        borderColor: draft.borderColor,
        borderWidth: draft.borderWidth,
        borderDash: draft.borderDash,
        label: { ...draft.label },
      });
      nextId += 1;
    };
    const removePlot = (id) => {
      const i = plots.findIndex((p) => p.id === id);
      if (i >= 0) {
        plots.splice(i, 1);
      }
    };

    // plot 항목(p) → 차트 옵션
    const toLine = (p) => ({
      value: p.axis === 'x' ? labelTs(p.lineIdx) : p.value,
      color: p.color,
      lineWidth: p.lineWidth,
      segments: dashToSegments(p.dash),
      label: buildLabel(p.label),
    });
    const toBand = (p) => ({
      from: p.axis === 'x' ? labelTs(p.fromIdx) : p.from,
      to: p.axis === 'x' ? labelTs(p.toIdx) : p.to,
      color: p.bandColor,
      border: p.borderUse
        ? { color: p.borderColor, width: p.borderWidth, segments: dashToSegments(p.borderDash) }
        : null,
      label: buildLabel(p.label),
    });
    const pick = (axis, kind) => plots.filter((p) => p.axis === axis && p.kind === kind);

    const plotLines = computed(() => pick('y', 'line').map(toLine));
    const plotBands = computed(() => pick('y', 'band').map(toBand));
    const xPlotLines = computed(() => pick('x', 'line').map(toLine));
    const xPlotBands = computed(() => pick('x', 'band').map(toBand));

    // 목록 표시용
    const swatchColor = (p) => (p.kind === 'band' ? p.bandColor : p.color);
    const summary = (p) => {
      const axis = p.axis === 'x' ? 'X' : 'Y';
      const text = p.label?.text ? ` · "${p.label.text}"` : '';
      if (p.kind === 'line') {
        const pos = p.axis === 'x' ? `idx ${p.lineIdx}` : `value ${p.value}`;
        return `${axis} · Line · ${pos}${text}`;
      }
      const range = p.axis === 'x' ? `idx ${p.fromIdx}~${p.toIdx}` : `${p.from}~${p.to}`;
      return `${axis} · Band · ${range}${text}`;
    };

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '100%',
      padding: {
        right: 50,
      },
      title: {
        text: 'Chart Title',
        show: false,
      },
      legend: {
        show: false,
      },
      axesX: [
        {
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
          plotLines: xPlotLines,
          plotBands: xPlotBands,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          plotLines,
          plotBands,
        },
      ],
      maxTip: {
        use: true,
      },
    });

    // 초기 예시 plot 2개
    addPlot();
    draft.kind = 'band';
    draft.label.text = '';
    draft.label.position = 'innerEnd';
    addPlot();
    // 폼을 line 기본으로 되돌림
    draft.kind = 'line';
    draft.label.text = '경고';
    draft.label.position = 'innerStart';

    return {
      chartData,
      chartOptions,
      draft,
      plots,
      axisList,
      kindList,
      dashList,
      addPlot,
      removePlot,
      swatchColor,
      summary,
    };
  },
};
</script>

<style lang="scss" scoped>
.plot-controls {
  margin-top: 16px;
}

.group-title {
  margin: 24px 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #2b2f36;

  &:first-child {
    margin-top: 0;
  }

  &.builder-title {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #e3e6eb;
  }
}

.group-subtitle {
  margin: 16px 0 10px;
  padding-top: 12px;
  border-top: 1px dashed #e3e6eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8a8f98;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px 18px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  .label {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
  }

  .ev-text-field,
  .ev-input-number,
  .ev-select {
    width: 100%;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.plot-list {
  margin: 0;
  padding: 0 8px 0 0;
  list-style: none;
  max-height: 176px; // 약 3~4개 노출 후 스크롤
  overflow-y: auto;
}

.plot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f1f4;

  .swatch {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    border: 1px solid #d0d3d9;
    border-radius: 3px;
  }

  .summary {
    flex: 1 1 auto;
    font-size: 13px;
    color: #2b2f36;
  }
}

.empty {
  padding: 12px 0;
  font-size: 13px;
  color: #8a8f98;
}
</style>
