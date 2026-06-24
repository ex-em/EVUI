import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * selectSeries 강조 — 겹친 시리즈의 "선택 = 최상위 불투명" 정합을 픽셀로 검증한다.
 *
 * full redraw 는 선택 시리즈를 z-order 제자리에 그리므로, 선택 시리즈가 비선택보다 먼저(아래)
 * 그려지면 위에 깔리는 비선택 dim 라인에 묻혀 선택색이 흐려진다. shouldDrawSelectedOnTop→
 * drawSelectedSeriesOnly 가 선택 line 을 맨 위에 한 번 더 불투명하게 덧그려 이를 보정한다.
 *
 * 계약 수준 spec(chart.selection.spec.js)은 호출 순서/게이트만 보므로, 이 픽셀 단언이 없으면
 * draw-order 가 바뀌어 깜빡임이 되살아나도 모든 spec 이 green 으로 남는다.
 *
 * 검증 전략: 두 라인을 완전히 겹쳐 두고 각 시리즈를 번갈아 선택해 "선택색 순수 픽셀 수"를 잰다.
 * 보정이 작동하면 어느 쪽을 선택하든 선택색이 라인 전체를 불투명하게 덮어 두 값이 대칭이다.
 * 보정이 빠지면 z-order 하위를 선택한 쪽만 비선택 dim 에 절반 묻혀 순수색이 급감해 비대칭이 된다
 * (실측: 보정 OFF 시 하위 선택 1976→988, 상위 선택은 1976 유지 → min/max=0.5).
 */
describe('EvChart selectSeries 겹침 최상위 색 정합', () => {
  const RED = '#DF6264'; // series1
  const BLUE = '#3CA0FF'; // series2

  // 두 시리즈를 동일 y(완전 겹침)로 둔다.
  const makeData = () => ({
    series: {
      series1: { name: 's1', color: RED, point: false },
      series2: { name: 's2', color: BLUE, point: false },
    },
    labels: [0, 1, 2, 3, 4],
    data: { series1: [50, 50, 50, 50, 50], series2: [50, 50, 50, 50, 50] },
  });

  const options = {
    type: 'line',
    width: '600px',
    height: '400px',
    selectSeries: { use: true },
    unSelectedOpacity: 0.3,
    legend: { show: false },
    tooltip: { use: false },
    axesX: [{ type: 'linear', showGrid: false }],
    axesY: [{ type: 'linear', showGrid: false, range: [0, 100] }],
    padding: { top: 20, right: 20, bottom: 20, left: 40 },
  };

  const settle = async () => {
    await new Promise((r) => setTimeout(r, 120));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 80));
  };

  const getImg = (container) => {
    const canvas = container.querySelector('canvas:not(.overlay-canvas)');
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  };

  // 선택색이 dim 과 섞이지 않은 '순수' 픽셀만 센다(섞이면 채널 차가 줄어 임계 미달).
  // 회색 축 라벨(r≈b)·저 alpha 배경은 자동 제외된다.
  const measure = (img) => {
    const d = img.data;
    let pureRed = 0;
    let pureBlue = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] >= 32) {
        const r = d[i];
        const b = d[i + 2];
        if (r > 180 && r - b > 80) {
          pureRed += 1;
        }
        if (b > 180 && b - r > 80) {
          pureBlue += 1;
        }
      }
    }
    return { pureRed, pureBlue };
  };

  // 무선택으로 그린 뒤 sel 을 선택(props.selectedSeries watch 발화 = 클릭 대응)하고 측정한다.
  const renderSelect = async (sel) => {
    const { container, rerender } = render(EvChart, {
      props: { data: makeData(), options, selectedSeries: { seriesId: [] } },
    });
    await settle();
    await rerender({ data: makeData(), options, selectedSeries: { seriesId: [sel] } });
    await settle();
    return measure(getImg(container));
  };

  it('겹친 두 시리즈 중 어느 쪽을 선택해도 선택색이 동등하게 순수(불투명 최상위)해야 한다', async () => {
    const redPure = (await renderSelect('series1')).pureRed;
    const bluePure = (await renderSelect('series2')).pureBlue;

    // 선택 라인이 실제로 그려졌는지(sanity).
    expect(redPure, 'series1 선택 라인 미검출').toBeGreaterThan(200);
    expect(bluePure, 'series2 선택 라인 미검출').toBeGreaterThan(200);

    // z-order 무관하게 선택색이 동등 순수해야 한다. 한쪽만 비선택 dim 에 묻히면(최상위 보정 회귀)
    // 비대칭으로 깨진다.
    const lo = Math.min(redPure, bluePure);
    const hi = Math.max(redPure, bluePure);
    expect(
      lo,
      `선택색 순도 비대칭(최상위 보정 회귀) series1=${redPure} series2=${bluePure}`,
    ).toBeGreaterThan(hi * 0.85);
  }, 60000);

  it('폴링(재렌더) 전후로 선택색 농도가 유지된다(클릭↔폴링 깜빡임 방지)', async () => {
    const { container, rerender } = render(EvChart, {
      props: { data: makeData(), options, selectedSeries: { seriesId: [] } },
    });
    await settle();

    // z-order 하위(보정 적용 대상)인 series1 을 선택.
    await rerender({ data: makeData(), options, selectedSeries: { seriesId: ['series1'] } });
    await settle();
    const before = measure(getImg(container)).pureRed;

    // 데이터 새 참조로 재렌더(폴링) — 선택 유지.
    await rerender({ data: makeData(), options, selectedSeries: { seriesId: ['series1'] } });
    await settle();
    const after = measure(getImg(container)).pureRed;

    expect(before, '선택 라인 미검출').toBeGreaterThan(200);
    expect(
      Math.abs(after - before),
      `폴링 전후 선택색 농도 급변(깜빡임) before=${before} after=${after}`,
    ).toBeLessThan(before * 0.3);
  }, 60000);
});
