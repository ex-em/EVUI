import { describe, it, expect, vi } from 'vitest';
import EvChart from './chart.core';

/**
 * emitDataMaxChange 는 DOM/canvas 없이 동작하는 순수 집계 로직이라
 * Object.create 로 prototype 메서드만 떼어 stub this 로 테스트한다.
 */
const createCore = ({ seriesList, listener, options = {} }) => {
  const core = Object.create(EvChart.prototype);
  core.seriesList = seriesList;
  core.options = options;
  core.listeners = listener ? { 'axes-data-max-change': listener } : {};
  return core;
};

describe('EvChart.emitDataMaxChange', () => {
  it('리스너가 없으면 아무것도 하지 않는다', () => {
    const core = createCore({
      seriesList: { s0: { show: true, minMax: { maxY: 9 } } },
      listener: null,
    });
    expect(() => core.emitDataMaxChange()).not.toThrow();
  });

  it('차트 타입과 무관하게 리스너가 있으면 emit 한다', () => {
    // 게이트는 리스너(구독) 존재 여부다. 구독 안 한 차트는 uses.js 가 래퍼를 등록하지 않아
    // listener 부재로 일찍 빠진다.
    const listener = vi.fn();
    const core = createCore({
      seriesList: { s0: { show: true, minMax: { maxY: 9 } } },
      listener,
      options: { realTimeScatter: { use: false } },
    });

    core.emitDataMaxChange();

    expect(listener).toHaveBeenCalledWith(9);
  });

  it('show 된 series 들의 maxY 중 최대값을 emit 한다', () => {
    const listener = vi.fn();
    const core = createCore({
      seriesList: {
        s0: { show: true, minMax: { maxY: 10 } },
        s1: { show: true, minMax: { maxY: 7 } },
        s2: { show: true, minMax: { maxY: 25 } },
      },
      listener,
    });

    core.emitDataMaxChange();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(25);
  });

  it('show=false / 비유한값 / minMax 없음 series 는 제외한다', () => {
    const listener = vi.fn();
    const core = createCore({
      seriesList: {
        s0: { show: true, minMax: { maxY: 6 } },
        sHidden: { show: false, minMax: { maxY: 999 } },
        sNaN: { show: true, minMax: { maxY: NaN } },
        sNoMinMax: { show: true },
      },
      listener,
    });

    core.emitDataMaxChange();

    expect(listener).toHaveBeenCalledWith(6);
  });

  it('유효 데이터가 없으면 null 을 emit 한다', () => {
    const listener = vi.fn();
    const core = createCore({ seriesList: {}, listener });

    core.emitDataMaxChange();

    expect(listener).toHaveBeenCalledWith(null);
  });

  it('dedup 없이 호출마다 emit 한다 (같은 값이어도)', () => {
    const listener = vi.fn();
    const core = createCore({
      seriesList: { s0: { show: true, minMax: { maxY: 9 } } },
      listener,
    });

    core.emitDataMaxChange();
    core.emitDataMaxChange();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, 9);
    expect(listener).toHaveBeenNthCalledWith(2, 9);
  });

  it('값이 바뀌면 바뀐 값을 emit 한다', () => {
    const listener = vi.fn();
    const series = { show: true, minMax: { maxY: 9 } };
    const core = createCore({ seriesList: { s0: series }, listener });

    core.emitDataMaxChange();
    series.minMax.maxY = 12;
    core.emitDataMaxChange();

    expect(listener).toHaveBeenLastCalledWith(12);
  });
});

/**
 * emitDataMaxChange 의 집계 로직은 위에서 격리 검증되지만,
 * drawChart 가 실제로 그 메서드를 부르는 한 줄(chart.core.js:372)은 어떤 테스트로도 실행되지 않았다.
 * emitDataMaxChange 는 canvas 부수효과가 없어 시각/스냅샷 테스트로도 호출부 삭제를 잡지 못하므로
 * (누가 호출 한 줄을 지워도 emit 유닛 테스트는 전부 GREEN), 여기서 drawChart 의 형제 메서드를
 * 전부 no-op stub 하고 emitDataMaxChange 만 실제로 남겨 호출부 배선을 잠근다.
 * 이 테스트가 RED 가 되면 drawChart→emitDataMaxChange 호출이 끊긴 것이다.
 */
describe('EvChart.drawChart → emitDataMaxChange 호출부 배선', () => {
  const createDrawCore = ({ seriesList, listener }) => {
    const core = Object.create(EvChart.prototype);
    core.options = {};
    core.seriesList = seriesList;
    core.listeners = { 'axes-data-max-change': listener };
    core.scrollbar = undefined;
    core.bufferCanvas = undefined;

    // drawChart 가 부르는 형제 메서드는 전부 no-op stub — emitDataMaxChange 만 실제 실행한다.
    core.initScale = vi.fn();
    core.getAxesRange = vi.fn();
    core.getLabelOffset = vi.fn();
    core.getAxesLabelRange = vi.fn();
    core.calculateSteps = vi.fn();
    core.adjustXAndYAxisWidth = vi.fn();
    core.emitAxesScaleChange = vi.fn();
    core.drawAxis = vi.fn();
    core.drawSeries = vi.fn();
    core.drawTip = vi.fn();

    return core;
  };

  it('drawChart() 가 emitDataMaxChange 를 거쳐 리스너에 통합 maxY 를 전달한다', () => {
    const listener = vi.fn();
    const core = createDrawCore({
      seriesList: {
        s0: { show: true, minMax: { maxY: 10 } },
        s1: { show: true, minMax: { maxY: 25 } },
      },
      listener,
    });

    core.drawChart();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(25);
  });
});
