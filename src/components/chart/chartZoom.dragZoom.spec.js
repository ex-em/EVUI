import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import EvChartZoom from './chartZoom.core';

const LABELS = Array.from({ length: 5 }, (_, ix) => dayjs('2026-08-21T00:00:00').add(ix, 'hour'));

/**
 * dragZoom 은 생성자가 툴바 DOM·애니메이션 캔버스를 요구하므로 프로토타입만 빌려
 * 이 메서드가 실제로 읽는 필드만 세운다.
 */
const createZoom = (labels = LABELS) => {
  const zoom = Object.create(EvChartZoom.prototype);

  Object.assign(zoom, {
    evChartProps: {
      options: [{ title: { text: 'chart' }, axesX: [{ type: 'time' }] }],
      data: [{ labels }],
    },
    evChartCloneData: [{ labels }],
    evChartZoomOptions: { useAnimation: false, bufferMemoryCnt: 100 },
    zoomAreaMemory: { previous: [], current: [[0, labels.length - 1]], latest: [] },
    executeZoom: vi.fn(),
    setZoomAreaMemory: vi.fn(),
  });

  return zoom;
};

/** Bar.findItems 가 돌려주는 모양 — x 는 라벨(dayjs)이다. */
const barItems = (...indexes) => [
  { seriesId: 'series1', items: indexes.map((ix) => ({ x: LABELS[ix], y: 10, o: 10 })) },
];

const dragArgs = (data, { dragXsp = 100, dragXep = 300 } = {}) => ({
  data,
  range: {
    dragSelectionInfo: {
      dragXsp,
      dragXep,
      exceptAxesYChartWidth: 400,
      exceptAxesXChartHeight: 200,
      chartRange: { x1: 0, x2: 400, y1: 0, y2: 200 },
      chartTitle: 'chart',
    },
  },
});

describe('dragZoom (bar 시리즈)', () => {
  it('막대 x(라벨)로 줌 구간을 계산한다', () => {
    const zoom = createZoom();

    zoom.dragZoom(dragArgs(barItems(1, 2, 3)));

    expect(zoom.executeZoom).toHaveBeenCalledWith(1, 3);
    expect(zoom.setZoomAreaMemory).toHaveBeenCalledWith(1, 3);
  });

  // Bar.findItems 는 부분 겹침을 담으므로, 완전히 든 막대가 없는 드래그도 줌으로 이어진다.
  // 대가로 줌 창이 시각적 밴드보다 양쪽 최대 한 막대씩 넓다 — 의도된 트레이드오프다.
  it('걸치기만 한 막대 2개로도 줌이 실행된다', () => {
    const zoom = createZoom();

    zoom.dragZoom(dragArgs(barItems(1, 2)));

    expect(zoom.executeZoom).toHaveBeenCalledWith(1, 2);
  });

  it('막대 1개만 걸리면 드래그 위치에 가까운 쪽으로 한 칸 넓힌다', () => {
    const zoom = createZoom();

    // 라벨 간격 100px 기준 index 2 는 200px. 드래그가 그보다 오른쪽이면 오른쪽으로 넓어진다.
    zoom.dragZoom(dragArgs(barItems(2), { dragXsp: 190, dragXep: 260 }));

    expect(zoom.executeZoom).toHaveBeenCalledWith(2, 3);
  });

  it('줌 구간이 현재와 같으면 실행하지 않는다', () => {
    const zoom = createZoom();

    zoom.dragZoom(dragArgs(barItems(0, 1, 2, 3, 4)));

    expect(zoom.executeZoom).not.toHaveBeenCalled();
  });

  // dragZoom 은 time 축에서만 동작한다(SPEC.md 「줌 규칙」). bar 도 이 제약을 그대로 물려받는다.
  it('step 축이면 아무것도 하지 않는다', () => {
    const zoom = createZoom();
    zoom.evChartProps.options[0].axesX = [{ type: 'step' }];

    zoom.dragZoom(dragArgs(barItems(1, 2, 3)));

    expect(zoom.executeZoom).not.toHaveBeenCalled();
  });
});
