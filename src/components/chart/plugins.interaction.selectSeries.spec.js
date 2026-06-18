import { describe, it, expect, vi } from 'vitest';
import interaction from './plugins/plugins.interaction';

/**
 * selectSeriesByData 재렌더 스킵 검증.
 *
 * 배경: 차트 그룹에서 한 차트를 선택하면 제품이 나머지 차트의 selectedSeries 를 빈 배열로
 * 리셋(재할당)하고, deep watch 가 이를 변경으로 보고 selectSeriesByData([]) 를 매 인터랙션마다
 * 호출한다. 이 스팸을 막기 위해 재렌더를 스킵한다.
 *
 * 단, 비교 기준은 defaultSelectInfo.seriesId 가 아니라 '마지막으로 render 한 선택'이다.
 * onClick(setSelectedSeriesInfo)이 클릭 즉시 defaultSelectInfo.seriesId 를 선반영하므로, 그 값을
 * 기준으로 비교하면 '클릭한 차트'는 선택/해제 모두 동일로 오판돼 render 가 스킵된다(하이라이트 누락).
 */
const makeChart = ({ rendered = null, selected } = {}) => {
  const render = vi.fn();
  // selected: onClick 이 선반영해 둔 defaultSelectInfo.seriesId (미지정 시 rendered 와 동일로 본다)
  const ctx = {
    defaultSelectInfo: { seriesId: selected ?? rendered ?? [] },
    _renderedSelectSeriesIds: rendered,
    render,
  };
  const chart = {
    selectSeriesByData: (list) => interaction.selectSeriesByData.call(ctx, list),
    get defaultSelectInfo() {
      return ctx.defaultSelectInfo;
    },
  };
  return { chart, render };
};

describe('selectSeriesByData: 마지막 render 한 선택 기준으로 스킵', () => {
  it('그룹 빈배열 스팸(rendered [] → []): render 스킵', () => {
    const { chart, render } = makeChart({ rendered: [] });
    chart.selectSeriesByData([]);
    expect(render).not.toHaveBeenCalled();
  });

  it('동일 선택 echo(rendered [s1] → [s1]): render 스킵', () => {
    const { chart, render } = makeChart({ rendered: ['s1'] });
    chart.selectSeriesByData(['s1']);
    expect(render).not.toHaveBeenCalled();
  });

  it('첫 호출(rendered 미설정): render 1회', () => {
    const { chart, render } = makeChart({ rendered: null });
    chart.selectSeriesByData(['s1']);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual(['s1']);
  });

  it('신규 선택(rendered [] → [s1]): render 1회', () => {
    const { chart, render } = makeChart({ rendered: [] });
    chart.selectSeriesByData(['s1']);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('다른 seriesId(rendered [s1] → [s2]): render 1회', () => {
    const { chart, render } = makeChart({ rendered: ['s1'] });
    chart.selectSeriesByData(['s2']);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual(['s2']);
  });

  it('클릭한 차트 선택: onClick 이 defaultSelectInfo 를 [s5] 로 선반영해도 render 1회', () => {
    // rendered=[s1](마지막 render), onClick 이 defaultSelectInfo 를 [s5] 로 선반영 후 round-trip 으로
    // selectSeriesByData([s5]) 호출. defaultSelectInfo 기준 비교면 스킵되던 버그 → render 돼야 한다.
    const { chart, render } = makeChart({ rendered: ['s1'], selected: ['s5'] });
    chart.selectSeriesByData(['s5']);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual(['s5']);
  });

  it('클릭한 차트 해제: onClick 이 defaultSelectInfo 를 [] 로 선반영해도 render 1회', () => {
    // 선택된 시리즈 재클릭으로 해제 → onClick 이 defaultSelectInfo 를 [] 로 선반영, selectSeriesByData([]).
    // defaultSelectInfo 기준([]→[]) 비교면 스킵되던 버그 → 해제 render 돼야 한다.
    const { chart, render } = makeChart({ rendered: ['s1'], selected: [] });
    chart.selectSeriesByData([]);
    expect(render).toHaveBeenCalledTimes(1);
    expect(chart.defaultSelectInfo.seriesId).toEqual([]);
  });
});
