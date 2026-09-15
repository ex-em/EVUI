import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * 커서가 한 방향으로 이동하는 동안 툴팁의 좌우 배치가 여러 번 뒤집히지 않는지 검증한다.
 *
 * 반전 여부를 매 호출의 폭으로만 판정하면, hover 지점마다 폭이 달라지는 차트에서 커서를
 * 오른쪽으로 계속 밀어도 왼쪽↔오른쪽이 번갈아 바뀐다(수정 전 실측: 폭 533→253 구간에서 복귀).
 * jsdom 에는 레이아웃이 없어 실제 브라우저에서만 잡힌다.
 */

const LABEL_COUNT = 30;
const BASE = Date.now() - LABEL_COUNT * 1000;

const makeData = (seriesCount) => ({
  series: Object.fromEntries(
    Array.from({ length: seriesCount }, (_, s) => [`s${s}`, { name: `series-${s}`, point: false }]),
  ),
  labels: Array.from({ length: LABEL_COUNT }, (_, i) => new Date(BASE + i * 1000)),
  data: Object.fromEntries(
    Array.from({ length: seriesCount }, (_, s) => [
      `s${s}`,
      Array.from({ length: LABEL_COUNT }, (__, i) => 10 + ((i * 7 + s * 13) % 50)),
    ]),
  ),
});

// hover 지점마다 가장 긴 행의 폭이 크게 달라지도록 변조한다 — 이 변동이 없으면 회귀를 못 잡는다.
const html = (seriesList) =>
  `<div class="ev-chart-tooltip-custom">
    <div class="ev-chart-tooltip-custom__header">header</div>
    <div class="ev-chart-tooltip-custom__body">${seriesList
      .map((s) => {
        const pad = 'x'.repeat(3 + (((s.index ?? 0) * 9 + (s.sId?.length ?? 0) * 7) % 52));
        return `<div class="row" data-evui-tooltip-row>
          <span class="series-name">${s.name}-${pad}</span>
          <span class="value">${s?.data?.y ?? '-'}</span>
        </div>`;
      })
      .join('')}</div>
  </div>`;

const options = {
  type: 'line',
  width: '300px',
  height: '220px',
  legend: { show: false },
  axesX: [{ type: 'time', timeFormat: 'HH:mm:ss', interval: 'second' }],
  axesY: [{ type: 'linear', showGrid: true }],
  tooltip: {
    use: true,
    useScrollbar: true,
    maxHeight: 300,
    htmlScrollTarget: '.ev-chart-tooltip-custom__body',
    formatter: { html },
  },
};

const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

/**
 * 차트를 가로질러 커서를 한 방향으로 옮기며 매 지점의 폭과 배치 방향을 기록한다.
 *
 * @param {number} seriesCount  시리즈 수 (50 이상이면 가상 스크롤 경로)
 * @returns {Promise<Array<{x: number, width: number, flipped: boolean}>>} 지점별 관측
 */
const sweepRightward = async (seriesCount) => {
  document.body.style.margin = '0';
  const screen = render(EvChart, { props: { data: makeData(seriesCount), options } });
  const host = screen.container;
  host.style.cssText = 'position:fixed;top:40px;left:420px;';
  await new Promise((r) => setTimeout(r, 700));

  const canvas = host.querySelector('canvas.overlay-canvas');
  const rect = canvas.getBoundingClientRect();
  const cy = Math.round(rect.top + rect.height / 2);

  const samples = [];
  /* eslint-disable no-await-in-loop -- 프레임 단위 페이싱이 목적이다 */
  for (let x = Math.round(rect.left) + 10; x < Math.round(rect.right) - 5; x += 4) {
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: cy, bubbles: true }));
    await nextFrame();
    await nextFrame();

    const dom = document.querySelector('.ev-chart-tooltip');
    if (dom && dom.style.display === 'block') {
      const posX = Number.parseFloat(/translate3d\((-?[\d.]+)px/.exec(dom.style.transform)[1]);
      samples.push({
        x,
        width: Math.round(dom.getBoundingClientRect().width),
        flipped: posX < x,
      });
    }
  }
  /* eslint-enable no-await-in-loop */
  // 트레일링 throttle 호출이 차트 파기 뒤에 실행되지 않도록 여유를 둔다.
  await new Promise((r) => setTimeout(r, 80));
  return samples;
};

/**
 * 커서를 빠르게 왼쪽으로 옮기며 매 프레임 툴팁이 커서를 가로로 덮는지 센다.
 * 배치 이후 폭이 커지는 경로(가상 스크롤 재렌더·ResizeObserver 재측정)에서, 반전 배치의
 * 좌측을 고정하면 툴팁이 커서 쪽으로 자라 커서를 덮는다.
 *
 * @returns {Promise<{overlapFrames: number, widths: number[], sample: object|null}>} 관측
 */
const sweepFastLeftward = async () => {
  document.body.style.margin = '0';
  const screen = render(EvChart, { props: { data: makeData(60), options } });
  const host = screen.container;
  host.style.cssText = 'position:fixed;right:0;bottom:24px;width:300px;height:220px;';
  await new Promise((r) => setTimeout(r, 800));

  const canvas = host.querySelector('canvas.overlay-canvas');
  const rect = canvas.getBoundingClientRect();
  const cy = Math.round(rect.top + rect.height / 2);

  const result = { overlapFrames: 0, widths: [], sample: null };
  let cursorX = Math.round(rect.right) - 8;
  let running = true;
  // 커서를 옮긴 직후 프레임은 아직 새 좌표로 배치되기 전이다 — 그 지연을 겹침으로 세지 않도록
  // 배치가 끝난 뒤부터 관측한다. 이후 폭이 커지는 프레임이 바로 이 테스트가 노리는 구간이다.
  let observing = false;

  const watch = () => {
    if (!running) return;
    const dom = document.querySelector('.ev-chart-tooltip');
    if (observing && dom && dom.style.display === 'block') {
      const r = dom.getBoundingClientRect();
      result.widths.push(Math.round(r.width));
      if (r.left <= cursorX && cursorX <= r.right) {
        result.overlapFrames += 1;
        result.sample = result.sample ?? {
          cursorX,
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        };
      }
    }
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);

  /* eslint-disable no-await-in-loop -- 프레임 단위 페이싱이 목적이다 */
  while (cursorX > Math.round(rect.left) + 8) {
    observing = false;
    canvas.dispatchEvent(
      new MouseEvent('mousemove', { clientX: cursorX, clientY: cy, bubbles: true }),
    );
    await nextFrame();
    await nextFrame();
    observing = true;
    await nextFrame();
    await nextFrame();
    cursorX -= 12;
  }
  /* eslint-enable no-await-in-loop */
  running = false;
  await new Promise((r) => setTimeout(r, 80));

  return result;
};

/**
 * 툴팁이 가시 영역보다 넓어 커서 양옆 어디에도 들어가지 않는 상황을 만들고 좌우로 훑는다.
 * 남은 폭이 아니라 폭 판정만으로 한쪽을 고정하면, 커서가 그 반대편 20px 안에 들어간 순간
 * 상한이 0 이 돼 테두리만 남는다.
 *
 * @returns {Promise<Array<{x: number, flipped: boolean, maxWidth: number, right: number,
 *   left: number, scrollWidth: number}>>} 지점별 관측
 */
const sweepWiderThanViewport = async () => {
  document.body.style.margin = '0';
  const wideHtml = (seriesList) => html(seriesList).replace(/-x{3,}/g, (m) => `-${'x'.repeat(200)}${m.slice(1)}`);
  const screen = render(EvChart, {
    props: {
      data: makeData(4),
      options: { ...options, tooltip: { ...options.tooltip, formatter: { html: wideHtml } } },
    },
  });
  const host = screen.container;
  // 커서가 가시 영역 우단 20px 안까지 들어가야 "남은 폭이 음수" 구간을 밟는다.
  host.style.cssText = 'position:fixed;top:40px;right:0;';
  await new Promise((r) => setTimeout(r, 700));

  const canvas = host.querySelector('canvas.overlay-canvas');
  const rect = canvas.getBoundingClientRect();
  const cy = Math.round(rect.top + rect.height / 2);
  const baseScrollWidth = document.documentElement.scrollWidth;

  const samples = [];
  /* eslint-disable no-await-in-loop -- 프레임 단위 페이싱이 목적이다 */
  for (let x = Math.round(rect.left) + 10; x < Math.round(rect.right) - 2; x += 4) {
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: cy, bubbles: true }));
    await nextFrame();
    await nextFrame();

    const dom = document.querySelector('.ev-chart-tooltip');
    if (dom && dom.style.display === 'block') {
      const posX = Number.parseFloat(/translate3d\((-?[\d.]+)px/.exec(dom.style.transform)[1]);
      const r = dom.getBoundingClientRect();
      samples.push({
        x,
        flipped: posX < x,
        maxWidth: Number.parseFloat(dom.style.maxWidth),
        width: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        scrollWidth: document.documentElement.scrollWidth - baseScrollWidth,
      });
    }
  }
  /* eslint-enable no-await-in-loop */
  await new Promise((r) => setTimeout(r, 80));

  return samples;
};

const countFlipChanges = (samples) =>
  samples.reduce((acc, s, i) => (i > 0 && s.flipped !== samples[i - 1].flipped ? acc + 1 : acc), 0);

describe('툴팁 좌우 배치 안정성', () => {
  afterEach(() => {
    document.querySelectorAll('.ev-chart-tooltip').forEach((el) => el.remove());
  });

  it.each([
    ['가상 스크롤 경로', 60],
    ['전체 부착 경로', 4],
  ])('%s — 커서를 한 방향으로 옮기면 반전은 한 번만 일어난다', async (_name, seriesCount) => {
    const samples = await sweepRightward(seriesCount);

    expect(samples.length).toBeGreaterThan(20);
    // 폭이 실제로 흔들려야 회귀를 잡을 수 있다 (formatter 변조가 죽으면 테스트도 무의미해진다)
    const widths = samples.map((s) => s.width);
    expect(Math.max(...widths) - Math.min(...widths)).toBeGreaterThan(100);

    expect(countFlipChanges(samples)).toBeLessThanOrEqual(1);
  }, 120000);

  it('배치 이후 폭이 커져도 툴팁이 커서를 덮지 않는다', async () => {
    const r = await sweepFastLeftward();

    expect(r.widths.length).toBeGreaterThan(10);
    // 폭이 실제로 흔들리는 상황이어야 회귀를 잡는다
    expect(Math.max(...r.widths) - Math.min(...r.widths)).toBeGreaterThan(50);

    expect({ overlapFrames: r.overlapFrames, sample: r.sample }).toEqual({
      overlapFrames: 0,
      sample: null,
    });
  }, 120000);

  it('툴팁이 화면보다 넓어도 상한이 0 이 되거나 화면을 벗어나지 않는다', async () => {
    const viewport = document.documentElement.clientWidth;
    const samples = await sweepWiderThanViewport();

    expect(samples.length).toBeGreaterThan(20);
    // 상한이 실제로 걸린 상황이어야 한다 — 자연 폭이 가시 폭보다 좁으면 이 테스트는 무의미해진다.
    expect(Math.max(...samples.map((s) => s.maxWidth))).toBeLessThan(viewport);

    // 넓은 쪽 여유는 두 여유의 합(`가시 폭 - 40`)의 절반 이상이다. 폭 판정만으로 한쪽을 고정하면
    // 커서가 그 반대편으로 갈수록 상한이 0 에 수렴한다(수정 전 실측: 22 → 14 → 6px).
    expect(samples.filter((s) => s.maxWidth < (viewport - 40) / 2)).toEqual([]);
    expect(samples.filter((s) => s.left < -0.5 || s.right > viewport + 0.5)).toEqual([]);
    expect(samples.filter((s) => s.scrollWidth !== 0)).toEqual([]);
    expect(countFlipChanges(samples)).toBeLessThanOrEqual(1);
  }, 120000);
});
