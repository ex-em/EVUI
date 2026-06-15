import { describe, it, expect, vi } from 'vitest';
import interaction from './plugins/plugins.interaction';

/**
 * selectSeriesByData 재렌더 스킵 검증.
 *
 * 배경: 차트 그룹에서 한 차트를 선택하면 제품이 나머지 차트의 selectedSeries 를 빈 배열로
 * 리셋(재할당)하고, deep watch 가 이를 변경으로 보고 selectSeriesByData([]) 를 매 인터랙션마다
 * 호출한다. 선택이 실제로 바뀌지 않았는데도 render()→full redraw 폴백되는 비용을 막기 위해,
 * 값이 동일하면 render 를 스킵한다.
 */
const makeChart = (seriesId = []) => {
  const render = vi.fn();
  const ctx = { defaultSelectInfo: { seriesId }, render };
  const chart = {
    selectSeriesByData: (list) => interaction.selectSeriesByData.call(ctx, list),
    get defaultSelectInfo() {
      return ctx.defaultSelectInfo;
    },
  };
  return { chart, render };
};

describe('selectSeriesByData: 선택 변화가 없으면 render 를 스킵한다', () => {
  it('빈 배열 → 빈 배열: render 호출 안 함', () => {
    const { chart, render } = makeChart([]);
    chart.selectSeriesByData([]);
    expect(render).not.toHaveBeenCalled();
  });

  it('동일 seriesId 재선택: render 호출 안 함', () => {
    const { chart, render } = makeChart(['s1']);
    chart.selectSeriesByData(['s1']);
    expect(render).not.toHaveBeenCalled();
  });

  it('선택 추가([] → [s1]): render 1회 + defaultSelectInfo 갱신', () => {
    const { chart, render } = makeChart([]);
    chart.selectSeriesByData(['s1']);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual(['s1']);
  });

  it('선택 해제([s1] → []): 변경이므로 render 1회', () => {
    const { chart, render } = makeChart(['s1']);
    chart.selectSeriesByData([]);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual([]);
  });

  it('다른 seriesId([s1] → [s2]): render 1회', () => {
    const { chart, render } = makeChart(['s1']);
    chart.selectSeriesByData(['s2']);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual(['s2']);
  });
});
