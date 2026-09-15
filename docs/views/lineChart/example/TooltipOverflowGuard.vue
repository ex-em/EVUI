<template>
  <div class="case">
    <div class="panel">
      <div class="row">
        <ev-button @click="toggleWideBody">
          {{ wideBody ? '① body 넓힘 해제' : '① body 를 화면보다 넓게 (버그 조건)' }}
        </ev-button>
        <span :class="['badge', wideBody ? 'on' : 'off']">
          body {{ bodyWidth }}px / 화면 {{ viewportWidth }}px
        </span>
        <ev-button @click="toggleSide">
          {{ chartSide === 'right' ? '② 차트를 왼쪽 끝으로' : '② 차트를 오른쪽 끝으로' }}
        </ev-button>
        <ev-button @click="wideTooltip = !wideTooltip">
          {{ wideTooltip ? '③ 툴팁 폭 되돌리기' : '③ 툴팁을 화면보다 넓게' }}
        </ev-button>
        <span :class="['badge', wideTooltip ? 'on' : 'off']">
          툴팁 {{ tipWidth }}px / 상한 {{ tipMaxWidth }}
        </span>
        <span v-if="wideBody && scrollX > 0" class="badge warn">
          가로 스크롤을 왼쪽 끝으로 (현재 {{ scrollX }}px)
        </span>
      </div>

      <div class="row">
        <div :class="['verdict', nowState]">
          <b>툴팁 위치</b>
          <span>{{ nowText }}</span>
        </div>
      </div>

      <p class="hint">
        ①을 켠 뒤 오른쪽 아래 차트의 <strong>오른쪽 끝 부근</strong>에 마우스를 올려 보세요.
        툴팁이 커서 왼쪽으로 반전되어 화면 안에 머물면 정상입니다. 마우스를 멈춰도 유지되므로
        천천히 봐도 됩니다.
      </p>
      <p class="hint">
        ①을 끄면 body 폭과 화면 폭이 같아집니다 — 이 조건에서는 버그가 재현되지 않습니다.
        즉 <strong>body 가 화면보다 넓을 때만</strong> 터집니다.
      </p>
      <p class="hint">
        ②로 차트를 화면 왼쪽 끝에 붙이면 반대 경우를 봅니다 — 커서 오른쪽에 자리가 넉넉하니
        툴팁은 <strong>반전 없이 커서 오른쪽</strong>에 머물러야 합니다.
      </p>
      <p class="hint">
        ③은 툴팁이 <strong>화면보다 넓은</strong> 경우입니다 — 커서 양옆 어디에도 들어가지 않습니다.
        이때는 남은 폭이 넓은 쪽으로 붙고 상한이 그 여유만큼 걸립니다. 커서를 차트 <strong>오른쪽 끝</strong>까지
        끌고 가도 상한이 0 이 되어 툴팁이 테두리만 남는 일이 없어야 하고, 좌우로 훑을 때 방향이
        커서 위치 기준으로 <strong>한 번만</strong> 바뀌어야 합니다.
      </p>
      <p class="hint sub">
        마우스를 좌우로 <strong>빠르게</strong> 훑으면 배치 이후 툴팁이 넓어지는 경로도 같이
        재현됩니다 — 문서 폭을 늘린 프레임 {{ overFrames }}회 / 최대 {{ maxOver }}px.
        <a @click="resetProbe">리셋</a>
      </p>
    </div>

    <div :class="['chart-card', chartSide]">
      <ev-chart :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

export default {
  setup() {
    // 가상 스크롤 경로(threshold 50)를 타야 배치 이후 폭이 커지는 상황까지 재현된다.
    const SERIES_COUNT = 60;
    const LABEL_COUNT = 60;
    const baseTime = Date.now() - LABEL_COUNT * 1000;

    const chartData = reactive({
      series: Object.fromEntries(
        Array.from({ length: SERIES_COUNT }, (_, i) => [
          `series${i}`,
          { name: `series#${i}`, point: false },
        ]),
      ),
      labels: Array.from({ length: LABEL_COUNT }, (_, i) => new Date(baseTime + i * 1000)),
      data: Object.fromEntries(
        Array.from({ length: SERIES_COUNT }, (_, i) => [
          `series${i}`,
          Array.from({ length: LABEL_COUNT }, (__, j) => 10 + ((j * 7 + i * 13) % 60)),
        ]),
      ),
    });

    // hover 지점마다 가장 긴 행의 폭이 달라져야 배치 이후 확대 경로가 재현된다.
    const wideTooltip = ref(false);
    const htmlFormatter = (seriesList) =>
      `<div class="ev-chart-tooltip-custom">
        <div class="ev-chart-tooltip-custom__header">폭이 변하는 툴팁</div>
        <div class="ev-chart-tooltip-custom__body">${seriesList
          .map((s) => {
            // 기본값(3)은 폭이 흔들리는 상황, 넓힘(200)은 툴팁이 화면보다 넓은 상황을 만든다.
            const base = wideTooltip.value ? 200 : 3;
            const pad = 'x'.repeat(base + (((s.index ?? 0) * 9 + (s.sId?.length ?? 0) * 7) % 52));
            return `<div class="row" data-evui-tooltip-row>
                <span class="series-name">${s.name}-${pad}</span>
                <span class="value">${s?.data?.y ?? '-'}</span>
              </div>`;
          })
          .join('')}</div>
      </div>`;

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '100%',
      legend: { show: false },
      axesX: [{ type: 'time', timeFormat: 'HH:mm:ss', interval: 'second' }],
      axesY: [{ type: 'linear', showGrid: true }],
      tooltip: {
        use: true,
        useScrollbar: true,
        maxHeight: 300,
        htmlScrollTarget: '.ev-chart-tooltip-custom__body',
        formatter: { html: htmlFormatter },
      },
    });

    const wideBody = ref(false);
    const chartSide = ref('right');
    const bodyWidth = ref(0);
    const viewportWidth = ref(0);
    const scrollX = ref(0);
    const nowOver = ref(0);
    const tipWidth = ref(0);
    const tipMaxWidth = ref('-');
    const tooltipShown = ref(false);
    const overFrames = ref(0);
    const maxOver = ref(0);

    let baseScrollWidth = 0;
    let rafId = null;

    const resetProbe = () => {
      overFrames.value = 0;
      maxOver.value = 0;
      baseScrollWidth = document.documentElement.scrollWidth;
    };

    const toggleSide = () => {
      chartSide.value = chartSide.value === 'right' ? 'left' : 'right';
    };

    const toggleWideBody = () => {
      wideBody.value = !wideBody.value;
      document.body.style.minWidth = wideBody.value
        ? `${document.documentElement.clientWidth + 500}px`
        : '';
      resetProbe();
    };

    const watchFrame = () => {
      const doc = document.documentElement;

      bodyWidth.value = document.body.clientWidth;
      viewportWidth.value = doc.clientWidth;
      scrollX.value = Math.round(window.scrollX);

      const dom = [...document.querySelectorAll('.ev-chart-tooltip')].find(
        (el) => el.style.display === 'block' && el.offsetWidth > 0,
      );
      tooltipShown.value = !!dom;

      if (dom) {
        const rect = dom.getBoundingClientRect();
        nowOver.value = Math.max(0, Math.round(rect.right - viewportWidth.value));
        tipWidth.value = Math.round(rect.width);
        tipMaxWidth.value = dom.style.maxWidth || '-';
      } else {
        nowOver.value = 0;
        tipWidth.value = 0;
        tipMaxWidth.value = '-';
        // 툴팁이 없는 프레임의 문서 폭이 기준선 — 페이지 자체의 가로 스크롤을 상쇄한다.
        baseScrollWidth = doc.scrollWidth;
      }

      const grew = Math.max(0, doc.scrollWidth - baseScrollWidth);
      if (grew > 0) {
        overFrames.value += 1;
        maxOver.value = Math.max(maxOver.value, grew);
      }

      rafId = requestAnimationFrame(watchFrame);
    };

    onMounted(() => {
      resetProbe();
      rafId = requestAnimationFrame(watchFrame);
    });

    onBeforeUnmount(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      document.body.style.minWidth = '';
    });

    return {
      chartData,
      chartOptions,
      wideBody,
      wideTooltip,
      tipWidth,
      tipMaxWidth,
      chartSide,
      toggleSide,
      bodyWidth,
      viewportWidth,
      scrollX,
      overFrames,
      maxOver,
      toggleWideBody,
      resetProbe,
      nowState: computed(() => {
        if (!tooltipShown.value) return 'idle';
        return nowOver.value > 0 ? 'bad' : 'good';
      }),
      nowText: computed(() => {
        if (!tooltipShown.value) return '차트에 마우스를 올려주세요';
        return nowOver.value > 0 ? `화면 밖으로 ${nowOver.value}px 넘침` : '화면 안';
      }),
    };
  },
};
</script>

<style lang="scss" scoped>
.case {
  height: 100%;
  overflow: hidden;
}

.panel {
  padding: 10px 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.badge {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 10px;
  background-color: #eeeeee;
  color: #555555;
  font-variant-numeric: tabular-nums;
}

.badge.on {
  background-color: #fdecea;
  color: #c62828;
}

.badge.warn {
  background-color: #fff8e1;
  color: #ef6c00;
}

.verdict {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 190px;
  padding: 8px 10px;
  border-radius: 4px;
  border-left: 4px solid #cccccc;
  background-color: #f7f7f7;
  font-size: 13px;
}

.verdict b {
  font-size: 11px;
  color: #888888;
}

.verdict.good {
  border-left-color: #2e7d32;
  background-color: #eef7ee;
  color: #2e7d32;
}

.verdict.bad {
  border-left-color: #c62828;
  background-color: #fdecea;
  color: #c62828;
}

.hint {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #666666;
}

.hint.sub {
  color: #999999;
}

.hint a {
  cursor: pointer;
  text-decoration: underline;
}

// fixed 라 문서 스크롤 영역에 기여하지 않는다 — 초과폭 측정이 예제 자신 때문에 오염되지 않는다.
// 툴팁이 반전되는 경계를 만들려면 차트가 화면 오른쪽 끝에 붙어야 한다.
.chart-card {
  position: fixed;
  bottom: 24px;
  z-index: 500;
  width: 360px;
  height: 240px;
  background-color: #ffffff;
  border: 1px solid #bbbbbb;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}

.chart-card.right {
  right: 0;
  border-radius: 4px 0 0 4px;
}

.chart-card.left {
  left: 0;
  border-radius: 0 4px 4px 0;
}
</style>
