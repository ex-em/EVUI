import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * 커스텀 HTML 툴팁이 가시 영역을 벗어나 문서 스크롤 폭을 늘리지 않는지 실제 브라우저에서 검증한다.
 *
 * tooltipDOM 은 body 직속 absolute 라 오른쪽으로 삐져나온 폭이 그대로 문서 스크롤 폭이 된다.
 * 배치 한계를 `document.body.clientWidth` 로 잡으면, 대시보드처럼 body 가 뷰포트보다 넓은
 * 레이아웃에서 툴팁이 화면 밖으로 나가고 가로 스크롤바가 생긴다.
 * hover 지점마다 툴팁 폭이 달라지도록 두고 좌우로 훑으며 매 프레임 관측한다(정지 상태에선 안 잡힌다).
 */

const SERIES_COUNT = 4;
const LABEL_COUNT = 30;
const BASE = Date.now() - LABEL_COUNT * 1000;

const chartData = {
  series: Object.fromEntries(
    Array.from({ length: SERIES_COUNT }, (_, s) => [`s${s}`, { name: `series-${s}`, point: false }]),
  ),
  labels: Array.from({ length: LABEL_COUNT }, (_, i) => new Date(BASE + i * 1000)),
  data: Object.fromEntries(
    Array.from({ length: SERIES_COUNT }, (_, s) => [
      `s${s}`,
      Array.from({ length: LABEL_COUNT }, (__, i) => 10 + ((i * 7 + s * 13) % 50)),
    ]),
  ),
};

// hover 지점마다 폭이 크게 달라지도록 index 로 이름 길이를 변조한다.
const html = (seriesList) =>
  `<div class="ev-chart-tooltip-custom">
    <div class="ev-chart-tooltip-custom__header">header</div>
    <div class="ev-chart-tooltip-custom__body">${seriesList
      .map((s) => {
        const pad = 'x'.repeat(3 + (((s.index ?? 0) * 9) % 40));
        return `<div class="row" data-evui-tooltip-row>
          <span class="series-name">${s.name}-${pad}</span>
          <span class="value">${s?.data?.y ?? '-'}</span>
        </div>`;
      })
      .join('')}</div>
  </div>`;

const chartOptions = {
  type: 'line',
  width: '360px',
  height: '260px',
  legend: { show: false },
  axesX: [{ type: 'time', timeFormat: 'HH:mm:ss', interval: 'second' }],
  axesY: [{ type: 'linear', showGrid: true }],
  tooltip: {
    use: true,
    useScrollbar: true,
    maxHeight: 410,
    htmlScrollTarget: '.ev-chart-tooltip-custom__body',
    formatter: { html },
  },
};

const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

/**
 * 차트를 지정한 레이아웃에 렌더하고 좌우로 훑으며 매 프레임 툴팁 위치를 관측한다.
 * @returns {Promise<object>} 관측 결과
 */
const sweep = async ({ bodyWidth, chartLeft, scrollTo = 0, steps = 100 }) => {
  document.body.style.margin = '0';
  if (bodyWidth) {
    document.body.style.width = `${bodyWidth}px`;
  }

  const screen = render(EvChart, { props: { data: chartData, options: chartOptions } });
  const host = screen.container;
  host.style.cssText = `position:absolute;top:40px;left:${chartLeft}px;`;

  await new Promise((r) => setTimeout(r, 700));
  if (scrollTo) {
    window.scrollTo(scrollTo, 0);
    await nextFrame();
  }

  const canvas = host.querySelector('canvas.overlay-canvas');
  const rect = canvas.getBoundingClientRect();
  const baseScrollWidth = document.documentElement.scrollWidth;

  const result = { visibleFrames: 0, widths: [], grew: [], escaped: [] };
  let running = true;

  const watch = () => {
    if (!running) return;
    const dom = document.querySelector('.ev-chart-tooltip');
    if (dom && dom.style.display === 'block') {
      const r = dom.getBoundingClientRect();
      result.visibleFrames += 1;
      result.widths.push(Math.round(r.width));

      const grew = document.documentElement.scrollWidth - baseScrollWidth;
      if (grew > 0) {
        result.grew.push({ grew, transform: dom.style.transform, width: Math.round(r.width) });
      }
      if (r.right > document.documentElement.clientWidth + 0.5 || r.left < -0.5) {
        result.escaped.push({
          left: Math.round(r.left),
          right: Math.round(r.right),
          viewport: document.documentElement.clientWidth,
        });
      }
    }
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);

  /* eslint-disable no-await-in-loop -- 프레임 단위 페이싱이라 순차 대기가 목적이다 */
  for (let step = 0; step < steps; step++) {
    const ratio = (step % 25) / 25;
    const clientX = Math.round(rect.left + 5 + ratio * (rect.width - 10));
    canvas.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX,
        clientY: Math.round(rect.top + rect.height / 2),
        bubbles: true,
      }),
    );
    await nextFrame();
    await nextFrame();
  }
  /* eslint-enable no-await-in-loop */
  running = false;
  // 트레일링 throttle 호출이 차트 파기 뒤에 실행되지 않도록 여유를 둔다.
  await new Promise((r) => setTimeout(r, 80));

  return result;
};

describe('커스텀 툴팁 문서 오버플로', () => {
  afterEach(() => {
    document.body.style.width = '';
    window.scrollTo(0, 0);
    document.querySelectorAll('.ev-chart-tooltip').forEach((el) => el.remove());
  });

  it('body 가 뷰포트보다 넓어도 툴팁이 가시 영역을 벗어나지 않는다', async () => {
    const r = await sweep({ bodyWidth: 2000, chartLeft: 380 });

    expect(r.visibleFrames).toBeGreaterThan(50);
    expect(Math.max(...r.widths) - Math.min(...r.widths)).toBeGreaterThan(50);
    expect(r.escaped).toEqual([]);
    expect(r.grew).toEqual([]);
  }, 30000);

  it('차트가 뷰포트 오른쪽 가장자리여도 문서 가로 스크롤이 생기지 않는다', async () => {
    const r = await sweep({ chartLeft: 440 });

    expect(r.visibleFrames).toBeGreaterThan(50);
    expect(r.escaped).toEqual([]);
    expect(r.grew).toEqual([]);
  }, 30000);

  it('배치 이후 툴팁 폭이 커져도 가시 영역 밖으로 나가지 않는다', async () => {
    // 실서비스 재현: Live 갱신·내부 스크롤바 출현·웹폰트 적용 등으로 배치가 끝난 뒤 폭이 커지는 경로.
    // 이때 transform 은 이전(더 좁던) 폭 기준이라, 재클램프가 없으면 오른쪽으로 삐져나간다.
    document.body.style.margin = '0';
    const screen = render(EvChart, { props: { data: chartData, options: chartOptions } });
    const host = screen.container;
    host.style.cssText = 'position:absolute;top:40px;left:440px;';

    await new Promise((r) => setTimeout(r, 700));

    const canvas = host.querySelector('canvas.overlay-canvas');
    const rect = canvas.getBoundingClientRect();
    const baseScrollWidth = document.documentElement.scrollWidth;

    // 툴팁이 오른쪽에 배치되도록 차트 왼쪽 부분을 hover 한다.
    // 차트 기하 계산·30ms throttle 을 고려해 툴팁이 뜰 때까지 반복 hover 한다.
    const hover = async () => {
      /* eslint-disable no-await-in-loop -- throttle 통과를 기다리는 순차 재시도 */
      for (let i = 0; i < 40; i++) {
        canvas.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: Math.round(rect.left + 60 + (i % 2)),
            clientY: Math.round(rect.top + rect.height / 2),
            bubbles: true,
          }),
        );
        await new Promise((r) => setTimeout(r, 60));
        const el = document.querySelector('.ev-chart-tooltip');
        if (el?.style.display === 'block') return;
      }
      /* eslint-enable no-await-in-loop */
    };
    await hover();

    const dom = document.querySelector('.ev-chart-tooltip');
    expect(dom.style.display).toBe('block');
    const before = dom.getBoundingClientRect();
    expect(before.right).toBeLessThanOrEqual(document.documentElement.clientWidth + 0.5);

    // 배치 이후 폭 증가(내용이 비동기로 넓어지는 상황)
    const row = dom.querySelector('.row');
    row.textContent = `${row.textContent}${'W'.repeat(45)}`;
    // 변경 직후(같은 태스크)의 레이아웃이 그대로 그려진다. 사후 교정(ResizeObserver)은 한 프레임
    // 늦으므로, 이 시점에 이미 넘치지 않아야 스크롤바 깜빡임이 없다.
    expect(document.documentElement.scrollWidth).toBe(baseScrollWidth);

    await nextFrame();
    await nextFrame();

    const after = dom.getBoundingClientRect();
    expect(after.width).toBeGreaterThan(before.width);
    expect(after.right).toBeLessThanOrEqual(document.documentElement.clientWidth + 0.5);
    expect(document.documentElement.scrollWidth).toBe(baseScrollWidth);
    await new Promise((r) => setTimeout(r, 80));
  }, 30000);
});
